/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer, MultiEvent } from '../../sys/extension-api';
// import { MultiEvent } from '../../sys/multi-event-api';

/** @public */
export interface HistorySequenceSeriesInterface {
    readonly pointCount: number;

    // clear(): void;
    initialiseWithNullPoints(): void;

    finalise(): void;

    subscribePointInsertedEvent(handler: HistorySequenceSeriesInterface.PointInsertedEventHandler): MultiEvent.SubscriptionId;
    unsubscribePointInsertedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
    subscribePointsInsertedEvent(handler: HistorySequenceSeriesInterface.PointsInsertedEventHandler): MultiEvent.SubscriptionId;
    unsubscribePointsInsertedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
    subscribePointUpdatedEvent(handler: HistorySequenceSeriesInterface.PointUpdatedEventHandler): MultiEvent.SubscriptionId;
    unsubscribePointUpdatedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}


/** @public */
export namespace HistorySequenceSeriesInterface {
    export interface Point {
        null: boolean;
    }

    export type PointInsertedEventHandler = (this: void, index: Integer) => void;
    export type PointsInsertedEventHandler = (this: void, index: Integer, count: Integer) => void;
    export type PointUpdatedEventHandler = (this: void, index: Integer) => void;
}
