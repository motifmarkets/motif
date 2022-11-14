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
    CommaText,
    ExtensionHandle,
    MultiEvent,
    PublisherId,
    RegisteredExtension,
    SymbolsService
} from '@motifmarkets/motif-core';
import { MenuBarService } from 'controls-internal-api';
import { WorkspaceService } from 'src/workspace/internal-api';
import { Extension as ExtensionApi, ExtensionRegistrar as ExtensionRegistrarApi } from './api/extension-api';
import { ExtensionSvcImplementation, PublisherTypeImplementation } from './implementation/internal-api';

export class ExtensionRegistration implements RegisteredExtension {
    private readonly _publisherId: PublisherId;
    private readonly _name: string;
    private readonly _version: string;
    private readonly _apiVersion: string;
    private readonly _loadCallback: ExtensionRegistrarApi.Request.LoadCallback;
    private readonly _persistKey: string;

    private _extension: ExtensionApi | undefined;
    private _extensionSvc: ExtensionSvcImplementation | undefined;

    private _loadedChangedMultiEvent = new MultiEvent<RegisteredExtension.LoadedChangedEventHandler>();

    constructor(
        private readonly _adiService: AdiService,
        private readonly _commandRegisterService: CommandRegisterService,
        private readonly _storageService: AppStorageService,
        private readonly _symbolsService: SymbolsService,
        private readonly _menuBarService: MenuBarService,
        private readonly _workspaceService: WorkspaceService,
        private readonly _handle: ExtensionHandle,
        request: ExtensionRegistrarApi.Request,
        private readonly _shortDescription: string,
        private readonly _longDescription: string,
        private readonly _urlPath: string,
    ) {
        const publisherTypeId = PublisherTypeImplementation.fromApi(request.publisherType);
        const publisherName = request.publisherName;
        this._publisherId = {
            typeId: publisherTypeId,
            name: publisherName,
        };
        this._name = request.name;
        this._version = request.version;
        this._apiVersion = request.apiVersion;
        this._loadCallback = request.loadCallback;

        this._persistKey = this.generatePersistKey();
    }

    get handle() { return this._handle; }
    get name() { return this._name; }
    get publisherId() { return this._publisherId; }
    get version() { return this._version; }
    get apiVersion() { return this._apiVersion; }
    get shortDescription() { return this._shortDescription; }
    get longDescription() { return this._longDescription; }
    get urlPath() { return this._urlPath; }
    get extensionSvc() { return this._extensionSvc; }
    get persistKey() { return this._persistKey; }

    get loaded() { return this._extension !== undefined; }

    load() {
        if (this.loaded) {
            throw new AssertInternalError('ERL8983262042');
        } else {
            const extensionSvcImplementation = this.createExtensionSvcImplementation();
            this._extensionSvc = extensionSvcImplementation;
            this._extension = this._loadCallback(extensionSvcImplementation);

            this.notifyLoadedChanged();
        }
    }

    unload() {
        if (this._extension === undefined || this._extensionSvc === undefined) {
            throw new AssertInternalError('ERE100499458733');
        } else {
            this._extension.unloadEventer();
            this._extensionSvc.destroy();
            this._extensionSvc = undefined;
            this._extension = undefined;

            this.notifyLoadedChanged();
        }
    }

    subscribeLoadedChangedEvent(handler: RegisteredExtension.LoadedChangedEventHandler) {
        return this._loadedChangedMultiEvent.subscribe(handler);
    }
    unsubscribeLoadedChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._loadedChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private createExtensionSvcImplementation() {
        const extensionSvcImplementation = new ExtensionSvcImplementation(
            this,
            this._adiService,
            this._commandRegisterService,
            this._storageService,
            this._symbolsService,
            this._menuBarService,
            this._workspaceService,
        );

        return extensionSvcImplementation;
    }

    private notifyLoadedChanged() {
        const handlers = this._loadedChangedMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler();
        }
    }

    private generatePersistKey() {
        const publisherTypePersistKey = PublisherId.Type.idToPersistKey(this._publisherId.typeId);
        return CommaText.from3Values(publisherTypePersistKey, this._publisherId.name, this._name);
    }
}
