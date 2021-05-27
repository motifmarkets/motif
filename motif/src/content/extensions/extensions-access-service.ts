/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExtStringId, StringId } from 'src/res/internal-api';
import { ExtensionHandle, Integer, ListChangeTypeId, MultiEvent } from 'src/sys/internal-api';
import { ExtensionInfo, RegisteredExtension } from './extension/internal-api';

export interface ExtensionsAccessService {
    readonly internalHandle: ExtensionHandle;
    readonly internalRegisteredExtensionInfo: ExtensionInfo;

    readonly installedArray: RegisteredExtension[];
    readonly installedCount: Integer;
    readonly uninstalledBundledArray: ExtensionInfo[];
    readonly uninstalledBundledCount: Integer;

    getRegisteredExtensionInfo(handle: ExtensionHandle): ExtensionInfo;

    installExtension(info: ExtensionInfo, loadAlso: boolean): void;
    uninstallExtension(handle: ExtensionHandle): void;

    getInstalledExtension(idx: Integer): RegisteredExtension;
    getUninstalledBundledExtensionInfo(idx: Integer): ExtensionInfo;
    findInstalledExtension(publisher: string, name: string): RegisteredExtension | undefined;

    internalToExtStringId(internalStringId: StringId): ExtStringId;

    subscribeInstalledListChangedEvent(handler: ExtensionsAccessService.InstalledListChangedEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeInstalledListChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void;

    subscribeUninstalledBundledListChangedEvent(
        handler: ExtensionsAccessService.UnInstalledBundledListChangedEventHandler
    ): MultiEvent.DefinedSubscriptionId;
    unsubscribeUninstalledBundledListChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void;

    subscribeInstallErrorEvent(handler: ExtensionsAccessService.InstallErrorEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeInstallErrorEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

export namespace ExtensionsAccessService {
    export type InstalledListChangedEventHandler = (this: void, listChangeTypeId: ListChangeTypeId, idx: Integer,
        extension: RegisteredExtension, listTransitioning: boolean
    ) => void;
    export type UnInstalledBundledListChangedEventHandler = (this: void, listChangeTypeId: ListChangeTypeId, idx: Integer,
        info: ExtensionInfo, listTransitioning: boolean
    ) => void;
    export type InstallErrorEventHandler = (this: void, info: ExtensionInfo, errorText: string) => void;
}
