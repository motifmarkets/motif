/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExtensionHandle, MultiEvent } from 'src/sys/internal-api';
import { ExtensionInfo } from './extension-info';

export interface RegisteredExtension extends ExtensionInfo {
    readonly handle: ExtensionHandle;
    readonly loaded: boolean;
    readonly persistKey: string;

    load(): void;
    unload(): void;

    subscribeLoadedChangedEvent(handler: RegisteredExtension.LoadedChangedEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeLoadedChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

export namespace RegisteredExtension {
    export type LoadedChangedEventHandler = (this: void) => void;

    export function isRegisteredExtension(info: ExtensionInfo): info is RegisteredExtension {
        return 'handle' in info;
    }
}
