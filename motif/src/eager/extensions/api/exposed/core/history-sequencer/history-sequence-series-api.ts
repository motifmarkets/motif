/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MultiEvent } from '../../sys/extension-api';
import { HistorySequenceSeriesInterface } from './history-sequence-series-interface-api';
// import { HistorySequencer } from './history-sequencer-api';

/** @public */
export interface HistorySequenceSeries extends HistorySequenceSeriesInterface {
    // readonly sequencer: HistorySequencer;

    // readonly pointCount: Integer;

    // clear(): void;
    initialiseWithNullPoints(): void;

    // stageOhlcTick(tickDateTime: Date, tickDateTimeRepeatIndex: Integer,
    //     open: number, high: number, low: number, close: number | undefined): void;
    // stageValueTick(tickDateTime: Date, tickDateTimeRepeatIndex: Integer, value: number | undefined): void;

    finalise(): void;

    subscribePointInsertedEvent(handler: HistorySequenceSeriesInterface.PointInsertedEventHandler): MultiEvent.SubscriptionId;
    unsubscribePointInsertedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
    subscribePointsInsertedEvent(handler: HistorySequenceSeriesInterface.PointsInsertedEventHandler): MultiEvent.SubscriptionId;
    unsubscribePointsInsertedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
    subscribePointUpdatedEvent(handler: HistorySequenceSeriesInterface.PointUpdatedEventHandler): MultiEvent.SubscriptionId;
    unsubscribePointUpdatedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

/** @public */
export namespace HistorySequenceSeries {
    export interface Point extends HistorySequenceSeriesInterface.Point {

    }
}
