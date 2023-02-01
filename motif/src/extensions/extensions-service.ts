/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AppStorageService,
    AssertInternalError,
    CommandRegisterService,
    ComparisonResult,
    Err,
    ErrorCode,
    ExtensionError,
    ExtensionHandle,
    ExtensionId,
    ExtensionInfo,
    ExtStringId,
    ExtStrings,
    Integer,
    invalidHandle,
    ListChangeTypeId,
    Logger,
    mSecsPerMin,
    MultiEvent,
    Ok,
    PublisherId,
    RegisteredExtension,
    Result,
    StringId,
    Strings,
    SymbolsService,
    SysTick
} from '@motifmarkets/motif-core';
import { ExtensionsAccessService } from 'content-internal-api';
import { MenuBarService } from 'controls-internal-api';
import { ExtensionDitemComponent } from 'ditem-internal-api';
import { ComponentContainer } from 'golden-layout';
import { FrameExtensionsAccessService } from 'src/desktop/internal-api';
import { WorkspaceService } from 'src/workspace/internal-api';
import { Extension as ExtensionApi, ExtensionRegistrar as ExtensionRegistrarApi, Frame as FrameApi } from './api/extension-api';
import { ExtensionRegistration } from './extension-registration';
import {
    ApiContentComponentFactory,
    ApiControlComponentFactory,
    ExtensionRegistrarImplementation,
    FrameSvcImplementation,
    PublisherTypeImplementation
} from './implementation/internal-api';

declare global {
    interface Window {
        motifExtensionRegistrar: ExtensionRegistrarImplementation;
    }
}

export class ExtensionsService implements FrameExtensionsAccessService {
    private readonly _internalHandle: ExtensionHandle;

    private readonly _registrations: ExtensionRegistration[] = [];
    private readonly _installedArray: ExtensionRegistration[] = [];
    private readonly _uninstalledArray: ExtensionRegistration[] = [];
    private readonly _uninstalledBundledArray: ExtensionInfo[] = [];

    private readonly _activeDownloads: ExtensionsService.ActiveDownload[] = [];

    private _bundled: readonly ExtensionsService.BundledExtension[];

    private _activeDownloadsTimeoutCheckIntervalHandle: ReturnType<typeof setInterval> | undefined;

    private readonly _installedListChangedMultiEvent = new MultiEvent<ExtensionsAccessService.InstalledListChangedEventHandler>();
    private readonly _uninstalledBundledListChangedMultiEvent =
        new MultiEvent<ExtensionsAccessService.UnInstalledBundledListChangedEventHandler>();
    private readonly _installErrorMultiEvent = new MultiEvent<ExtensionsAccessService.InstallErrorEventHandler>();

    constructor(
        private readonly _adiService: AdiService,
        private readonly _commandRegisterService: CommandRegisterService,
        private readonly _storageService: AppStorageService,
        private readonly _symbolsService: SymbolsService,
        private readonly _menuBarService: MenuBarService,
        private readonly _workspaceService: WorkspaceService,
        private readonly _apiControlComponentFactory: ApiControlComponentFactory,
        private readonly _apiContentComponentFactory: ApiContentComponentFactory,
    ) {
        this.registerInvalidExtension();
        const internalRegistration = this.registerInternalExtension();
        this._internalHandle = internalRegistration.handle;
        ExtStrings.setExtensionStrings(this._internalHandle, Strings);

        window.motifExtensionRegistrar = new ExtensionRegistrarImplementation();
    }

    get internalHandle() { return this._internalHandle; }
    get internalRegisteredExtensionInfo() { return this._registrations[this._internalHandle]; }

    public get installedArray() { return this._installedArray; }
    public get installedCount() { return this._installedArray.length; }
    public get uninstalledBundledArray() { return this._uninstalledBundledArray; }
    public get uninstalledBundledCount() { return this._uninstalledBundledArray.length; }

    destroy() {
        this.checkActiveDownloadsTimoutCheckIntervalStopped();
    }

    setBundled(value: readonly ExtensionsService.BundledExtension[]) {
        this._bundled = value;
    }

    processBundled() {
        for (const bundledExtension of this._bundled) {
            const info = bundledExtension.info;
            if (bundledExtension.install) {
                this.installExtension(info, true);
            } else {
                this._uninstalledBundledArray.push(info);
            }
        }
    }

    public getRegisteredExtensionInfo(handle: ExtensionHandle) {
        return this._registrations[handle];
    }

    public getInstalledExtension(idx: Integer) {
        return this._installedArray[idx];
    }

    public getUninstalledBundledExtensionInfo(idx: Integer) {
        return this._uninstalledBundledArray[idx];
    }


    // loadTest() {
    //     this.loadExtension('tstest/dist/tstest.js');
    // }

    public installExtension(info: ExtensionInfo, loadAlso: boolean) {
        const uninstalledIdx = this.indexOfUninstalled(info);
        if (uninstalledIdx >= 0) {
            const registration = this._uninstalledArray[uninstalledIdx];
            this._uninstalledArray.splice(uninstalledIdx, 1);
            this.installRegistration(registration, loadAlso);
        } else {
            const existingActiveDownloadIdx = this.indexOfActiveDownload(info);
            if (existingActiveDownloadIdx < 0) {
                const activeDownload: ExtensionsService.ActiveDownload = {
                    info,
                    loadAlso,
                    timeoutTime: SysTick.now() + ExtensionsService.downloadTimeoutSpan,
                };
                this._activeDownloads.push(activeDownload);
                this.downloadExtension(info.urlPath);
                this.checkActiveDownloadsTimeoutCheckIntervalRunning();
            }
        }
    }

    public uninstallExtension(handle: Integer) {
        const registration = this._registrations[handle];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (registration === undefined) {
            throw new AssertInternalError('ESUE319981667');
        } else {
            const idx = this._installedArray.indexOf(registration);
            this._installedArray.splice(idx, 1);
            this.notifyInstalledListChanged(ListChangeTypeId.Remove, idx, registration, true);

            if (registration.loaded) {
                registration.unload();
            }

            this._uninstalledArray.push(registration);
            this.checkAddToUninstalledBundled(registration, true);
        }
    }

    public getExtensionName(handle: ExtensionHandle) {
        const extension = this._registrations[handle];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (extension === undefined) {
            throw new ExtensionError(ErrorCode.ExtensionsService_GetNameHandleExtensionUndefined, handle.toString());
        } else {
            return extension.name;
        }
    }

    public getExtensionPublisherName(handle: ExtensionHandle) {
        const extension = this._registrations[handle];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (extension === undefined) {
            throw new ExtensionError(ErrorCode.ExtensionsService_GetPublisherHandleExtensionUndefined,
                handle.toString()
            );
        } else {
            return extension.publisherId.name;
        }
    }

    public findInstalledExtension(publisher: string, name: string) {
        const count = this._registrations.length;
        for (let i = 0; i < count; i++) {
            const registration = this._registrations[i];
            if (registration.publisherId.name === publisher && registration.name === name) {
                return registration;
            }
        }
        return undefined;
    }

    public internalToExtStringId(internalStringId: StringId): ExtStringId {
        return {
            handle: this._internalHandle,
            index: internalStringId,
        };
    }

    public getFrame(container: ComponentContainer, extensionId: ExtensionId, frameTypeName: string): ExtensionDitemComponent.GetResult {
        const registration = this.tryGetRegistration(extensionId);
        if (registration === undefined) {
            return { component: undefined, errorText: Strings[StringId.Extensions_ExtensionNotInstalledOrEnabled] };
        } else {
            const extensionSvc = registration.extensionSvc;
            if (extensionSvc === undefined) {
                return { component: undefined, errorText: Strings[StringId.Extensions_ExtensionNotInstalledOrEnabled] };
            } else {
                const localDesktop = extensionSvc.workspaceSvc.localDesktop;
                const localDesktopFrame = this._workspaceService.localDesktopFrame;
                if (localDesktop === undefined || localDesktopFrame === undefined) {
                    return { component: undefined, errorText: Strings[StringId.Extensions_LocalDesktopNotLoaded] };
                } else {
                    const frameSvc = new FrameSvcImplementation(
                        registration.handle,
                        frameTypeName,
                        container,
                        this._commandRegisterService,
                        localDesktopFrame, // LocalDesktopAccessService
                        this._symbolsService,
                        this._adiService,
                        this._apiControlComponentFactory,
                        this._apiContentComponentFactory,
                    );

                    const frame = localDesktop.getFrame(frameSvc);

                    if (frame === undefined) {
                        return { component: undefined, errorText: Strings[StringId.Extensions_ExtensionDidNotCreateComponent] };
                    } else {
                        return { component: frame, errorText: undefined };
                    }
                }
            }
        }
    }

    public releaseFrame(component: ExtensionDitemComponent) {
        const frame = component as FrameApi;
        const frameSvc = frame.svc as FrameSvcImplementation;
        const extensionHandle = frameSvc.extensionHandle;
        const registration = this._registrations[extensionHandle];
        const extensionSvc = registration.extensionSvc;
        if (extensionSvc === undefined) {
            throw new AssertInternalError('ESRFE28827711');
        } else {
            const localDesktop = extensionSvc.workspaceSvc.localDesktop;
            if (localDesktop === undefined) {
                throw new AssertInternalError('ESRFL28827711');
            } else {
                localDesktop.releaseFrame(frame);
            }
        }
    }

    public subscribeInstalledListChangedEvent(handler: ExtensionsAccessService.InstalledListChangedEventHandler) {
        return this._installedListChangedMultiEvent.subscribe(handler);
    }

    public unsubscribeInstalledListChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._installedListChangedMultiEvent.unsubscribe(subscriptionId);
    }

    public subscribeUninstalledBundledListChangedEvent(handler: ExtensionsAccessService.UnInstalledBundledListChangedEventHandler) {
        return this._uninstalledBundledListChangedMultiEvent.subscribe(handler);
    }

    public unsubscribeUninstalledBundledListChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._uninstalledBundledListChangedMultiEvent.unsubscribe(subscriptionId);
    }

    public subscribeInstallErrorEvent(handler: ExtensionsAccessService.InstallErrorEventHandler) {
        return this._installErrorMultiEvent.subscribe(handler);
    }

    public unsubscribeInstallErrorEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._installErrorMultiEvent.unsubscribe(subscriptionId);
    }

    private readonly _scriptLoadListener = (ev: Event) => this.handleScriptLoadEvent(ev);

    private handleScriptLoadEvent(ev: Event): void {
        const requests = window.motifExtensionRegistrar.extractRequests();
        ev.currentTarget?.removeEventListener('load', this._scriptLoadListener);

        const requestCount = requests.length;
        for (let i = 0; i < requestCount; i++) {
            const request = requests[i];

            this.processRegistrationRequest(request);
        }
    }

    private handleActiveDownloadsTimeoutCheckInterval() {
        let count = this._activeDownloads.length;
        if (count > 0) {
            const nowTickTime = SysTick.now();
            let timedOutCount = count;
            for (let i = 0; i < count; i++) {
                const download = this._activeDownloads[i];
                if (SysTick.compare(download.timeoutTime, nowTickTime) !== ComparisonResult.LeftGreaterThanRight) {
                    this.notifyInstallError(download.info, Strings[StringId.Extensions_DownloadTimeout]);
                } else {
                    timedOutCount = i + 1;
                }
            }

            if (timedOutCount > 0) {
                this._activeDownloads.splice(0, timedOutCount);
            }

            count = this._activeDownloads.length;
        }

        if (count === 0) {
            this.checkActiveDownloadsTimoutCheckIntervalStopped();
        }
    }

    private notifyInstalledListChanged(listChangeTypeId: ListChangeTypeId, idx: Integer,
        extension: RegisteredExtension, listTransitioning: boolean
    ) {
        const handlers = this._installedListChangedMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler(listChangeTypeId, idx, extension, listTransitioning);
        }
    }

    private notifyUninstalledBundledListChange(listChangeTypeId: ListChangeTypeId, idx: Integer,
        info: ExtensionInfo, listTransitioning: boolean
    ) {
        const handlers = this._uninstalledBundledListChangedMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler(listChangeTypeId, idx, info, listTransitioning);
        }
    }

    private notifyInstallError(info: ExtensionInfo, errorText: string) {
        const handlers = this._installErrorMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler(info, errorText);
        }
    }

    private tryGetRegistration(extensionId: ExtensionId) {
        const count = this._registrations.length;
        for (let i = 0; i < count; i++) {
            const registration = this._registrations[i];
            if (ExtensionId.isEqual(registration, extensionId)) {
                return registration;
            }
        }
        return undefined;
    }

    private installRegistration(registration: ExtensionRegistration, loadAlso: boolean) {
        const listTransitioning = this.checkRemoveFromUninstalledBundled(registration, true);
        const idx = this._installedArray.length;
        this._installedArray.push(registration);
        this.notifyInstalledListChanged(ListChangeTypeId.Insert, idx, registration, listTransitioning);
        if (loadAlso) {
            registration.load();
        }
    }

    private checkAddToUninstalledBundled(registration: ExtensionRegistration, listTransitioning: boolean) {
        if (this.isBundled(registration)) {
            // Do not add registration into uninstalledBundled. Make copy
            const bundledInfo: ExtensionInfo = {
                publisherId: registration.publisherId,
                name: registration.name,
                version: registration.version,
                apiVersion: registration.apiVersion,
                shortDescription: registration.shortDescription,
                longDescription: registration.longDescription,
                urlPath: registration.urlPath,
            };

            const idx = this._uninstalledBundledArray.length;
            this._uninstalledBundledArray.push(bundledInfo);
            this.notifyUninstalledBundledListChange(ListChangeTypeId.Insert, idx, bundledInfo, listTransitioning);
        }
    }

    private checkRemoveFromUninstalledBundled(info: ExtensionInfo, listTransitioning: boolean) {
        const uninstalledBundledIdx = this.indexOfUninstalledBundled(info);
        if (uninstalledBundledIdx < 0) {
            return false;
        } else {
            const uninstalledBundledInfo = this._uninstalledBundledArray[uninstalledBundledIdx];
            this.notifyUninstalledBundledListChange(ListChangeTypeId.Remove, uninstalledBundledIdx, uninstalledBundledInfo,
                listTransitioning
            );
            this._uninstalledBundledArray.splice(uninstalledBundledIdx, 1);
            return true;
        }
    }

    private downloadExtension(urlPath: string) {
        const url = new URL(urlPath, globalThis.location.origin);
        const headElement = document.head;
        const scriptElement = document.createElement('script');
        scriptElement.type = 'module';
        scriptElement.src = url.href;
        scriptElement.addEventListener('load', this._scriptLoadListener);
        headElement.appendChild(scriptElement);
    }

    private checkActiveDownloadsTimeoutCheckIntervalRunning() {
        if (this._activeDownloadsTimeoutCheckIntervalHandle === undefined) {
            this._activeDownloadsTimeoutCheckIntervalHandle = setInterval(() => this.handleActiveDownloadsTimeoutCheckInterval(),
                ExtensionsService.activeDownloadsTimeoutCheckIntervalSpan
            );
        }
    }

    private checkActiveDownloadsTimoutCheckIntervalStopped() {
        if (this._activeDownloadsTimeoutCheckIntervalHandle !== undefined) {
            clearInterval(this._activeDownloadsTimeoutCheckIntervalHandle);
            this._activeDownloadsTimeoutCheckIntervalHandle = undefined;
        }
    }

    private registerInvalidExtension() {
        const extensionRequest: ExtensionRegistrarApi.Request = {
            publisherType: PublisherTypeImplementation.toApi(ExtensionsService.invalidExtensionInfo.publisherId.typeId),
            publisherName: ExtensionsService.invalidExtensionInfo.publisherId.name,
            name: ExtensionsService.invalidExtensionInfo.name,
            version: ExtensionsService.invalidExtensionInfo.version,
            apiVersion: ExtensionsService.apiVersion,
            loadCallback: ExtensionsService.nullLoadCallback,
        };

        const registration = this.registerExtension(extensionRequest, ExtensionsService.invalidExtensionInfo);

        if (registration === undefined) {
            throw new AssertInternalError('ESCVU877333');
        } else {
            if (registration.handle !== invalidHandle) {
                throw new AssertInternalError('IESCVH877333');
            }
        }
    }

    private registerInternalExtension() {
        const extensionRequest: ExtensionRegistrarApi.Request = {
            publisherType: PublisherTypeImplementation.toApi(ExtensionsService.internalExtensionInfo.publisherId.typeId),
            publisherName: ExtensionsService.internalExtensionInfo.publisherId.name,
            name: ExtensionsService.internalExtensionInfo.name,
            version: ExtensionsService.internalExtensionInfo.version,
            apiVersion: ExtensionsService.apiVersion,
            loadCallback: ExtensionsService.nullLoadCallback,
        };

        const registration = this.registerExtension(extensionRequest, ExtensionsService.internalExtensionInfo);

        if (registration === undefined) {
            throw new AssertInternalError('IESCIU877333');
        } else {
            return registration;
        }
    }

    private processRegistrationRequest(request: ExtensionRegistrarApi.Request) {
        const publisherType = request.publisherType;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (publisherType === undefined) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            Logger.logExternalError(ErrorCode.ExtensionsService_PublisherTypeNotSpecified, request.name ?? '');
        } else {
            const publisherTypeId = PublisherTypeImplementation.tryFromApi(publisherType);
            if (publisherTypeId === undefined) {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                Logger.logExternalError(ErrorCode.ExtensionsService_InvalidPublisherType, request.name ?? '');
            } else {
                const publisherId: PublisherId = {
                    typeId: publisherTypeId,
                    name: request.publisherName,
                };

                const requestExtensionInfo: ExtensionInfo = {
                    publisherId,
                    name: request.name,
                    version: '',
                    apiVersion: '',
                    shortDescription: '',
                    longDescription: '',
                    urlPath: '',
                };

                const activeDownload = this.extractActiveDownload(requestExtensionInfo);
                if (activeDownload === undefined) {
                    // must have timed out
                    Logger.logWarning('Extension active download not found:',
                        `ESHSLE21110332 ${this.generateExtensionKeyText(requestExtensionInfo)}`
                    );
                } else {
                    const matchingExtension = this.findExtensionRegistration(requestExtensionInfo);
                    if (matchingExtension !== undefined) {
                        Logger.logExternalError(ErrorCode.ExtensionsService_AddDuplicateName,
                            `${this.generateExtensionKeyText(requestExtensionInfo)}`
                        );
                    } else {
                        const requestedInfo = activeDownload.info;
                        const matchResult = this.matchRequestWithInfo(request, requestedInfo);
                        if (matchResult.isErr()) {
                            Logger.logExternalError(ErrorCode.ExtensionsService_MismatchedExtensionInfo,
                                `${this.generateExtensionKeyText(requestExtensionInfo)}: ${matchResult.error}`
                            );
                        } else {
                            const registration = this.registerExtension(request, requestedInfo);
                            this.installRegistration(registration, activeDownload.loadAlso);
                        }
                    }
                }
            }
        }
    }

    private generateExtensionKeyText(info: ExtensionInfo) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        return `"${PublisherId.Type.idToDisplay(info.publisherId.typeId)}" "${info.publisherId.name ?? ''}" "${info.name ?? ''}"`;
    }

    private registerExtension(request: ExtensionRegistrarApi.Request, extensionInfo: ExtensionInfo) {
        const handle = this._registrations.length;
        const registration = new ExtensionRegistration(
            this._adiService,
            this._commandRegisterService,
            this._storageService,
            this._symbolsService,
            this._menuBarService,
            this._workspaceService,
            handle,
            request,
            extensionInfo.shortDescription,
            extensionInfo.longDescription,
            extensionInfo.urlPath,
        );
        this._registrations.push(registration);

        return registration;
    }

    private findExtensionRegistration(value: ExtensionInfo) {
        const count = this._registrations.length;
        for (let i = 0; i < count; i++) {
            const registration = this._registrations[i];
            if (registration !== undefined) {
                if (ExtensionId.isEqual(registration, value)) {
                    return registration;
                }
            }
        }
        return undefined;
    }

    private isBundled(value: ExtensionRegistration) {
        const count = this._bundled.length;
        for (let i = 0; i < count; i++) {
            const bundledExtension = this._bundled[i];
            const info = bundledExtension.info;
            if (info !== undefined) {
                if (ExtensionId.isEqual(info, value)) {
                    return true;
                }
            }
        }
        return false;
    }

    private indexOfUninstalled(value: ExtensionInfo) {
        const count = this._uninstalledArray.length;
        for (let i = 0; i < count; i++) {
            const registration = this._uninstalledArray[i];
            if (registration !== undefined) {
                if (ExtensionId.isEqual(registration, value)) {
                    return i;
                }
            }
        }
        return -1;
    }

    private indexOfUninstalledBundled(value: ExtensionInfo) {
        const count = this._uninstalledBundledArray.length;
        for (let i = 0; i < count; i++) {
            const info = this._uninstalledBundledArray[i];
            if (info !== undefined) {
                if (ExtensionId.isEqual(info, value)) {
                    return i;
                }
            }
        }
        return -1;
    }

    private indexOfActiveDownload(value: ExtensionInfo) {
        const count = this._activeDownloads.length;
        for (let i = 0; i < count; i++) {
            const activeDownload = this._activeDownloads[i];
            const info = activeDownload.info;
            if (info !== undefined) {
                if (ExtensionId.isEqual(info, value)) {
                    return i;
                }
            }
        }
        return -1;
    }

    private extractActiveDownload(info: ExtensionInfo) {
        const idx = this.indexOfActiveDownload(info);
        if (idx < 0) {
            return undefined;
        } else {
            const activeDownload = this._activeDownloads[idx];
            this._activeDownloads.splice(idx, 1);
            return activeDownload;
        }
    }

    private matchRequestWithInfo(request: ExtensionRegistrarApi.Request, extensionInfo: ExtensionInfo): Result<void> {
        const match =
            request.publisherName === extensionInfo.publisherId.name &&
            request.name === extensionInfo.name &&
            request.version === extensionInfo.version &&
            request.apiVersion === extensionInfo.apiVersion;

        if (match) {
            return new Ok(undefined);
        } else {
            const extensionText =
                `${extensionInfo.publisherId.name}|` +
                `${extensionInfo.name}|` +
                `${extensionInfo.version}|` +
                `${extensionInfo.apiVersion}`;

            const requestText =
                `${request.publisherName}|` +
                `${request.name}|` +
                `${request.version}|` +
                `${request.apiVersion}`;

            return new Err(`${extensionText}|:|${requestText}`);
        }
    }
}

export namespace ExtensionsService {
    export const apiVersion = '1';

    export const invalidExtensionInfo: ExtensionInfo = {
        publisherId: PublisherId.invalid,
        name: 'Invalid',
        version: '1.0.0',
        apiVersion,
        shortDescription: 'Builtin Invalid Extension',
        longDescription: 'Builtin Invalid Extension',
        urlPath: '/',
    } as const;

    export const internalExtensionName = 'Internal';
    export const internalExtensionInfo: ExtensionInfo = {
        publisherId: PublisherId.internal,
        name: internalExtensionName,
        version: '1.0.0',
        apiVersion,
        shortDescription: 'Builtin Internal Extension',
        longDescription: 'Builtin Internal Extension',
        urlPath: '/',
    } as const;

    export const nullLoadCallback: ExtensionRegistrarApi.Request.LoadCallback = () => {
        const nullExtension: ExtensionApi = {
            unloadEventer: nullEventHandler,
        };
        return nullExtension;
    };

    export const nullEventHandler = () => {};

    export interface ActiveDownload {
        readonly info: ExtensionInfo;
        readonly loadAlso: boolean;
        readonly timeoutTime: SysTick.Time;
    }

    export const downloadTimeoutSpan = 5 * mSecsPerMin;
    export const activeDownloadsTimeoutCheckIntervalSpan = 1 * mSecsPerMin;

    export interface BundledExtension {
        readonly info: ExtensionInfo;
        readonly install: boolean;
    }
}
