/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer } from './types-api';

/** @public */
export interface MultiEvent<T> {
    readonly count: Integer;
    subscribe(handler: T): MultiEvent.DefinedSubscriptionId;
    unsubscribe(id: MultiEvent.SubscriptionId): void;
    copyHandlers(): T[];
}

/** @public */
export namespace MultiEvent {
    export type DefinedSubscriptionId = Integer;
    export type SubscriptionId = DefinedSubscriptionId | undefined;
}
