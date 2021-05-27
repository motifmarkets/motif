/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

// import { ComparableList, Integer, MultiEvent, SourceTzOffsetDateTime } from '../../sys/extension-api';
import { ComparableList, Integer } from '../../sys/extension-api';
import { HistorySequencer } from './history-sequencer-api';

/** @public */
export interface IntervalHistorySequencer extends HistorySequencer {
    readonly unit: IntervalHistorySequencer.Unit;
    readonly unitCount: Integer;
    readonly emptyPeriodsSkipped: boolean;
    readonly weekendsSkipped: boolean;

    // readonly paddingActive: boolean;

    readonly pointList: IntervalHistorySequencer.PointList;

    setParameters(
        unit: IntervalHistorySequencer.Unit,
        unitCount: Integer,
        emptyPeriodsSkipped: boolean,
        weekendsSkipped: boolean,
    ): void;

    // clear(): void;

    // addDateTime(tickDateTime: SourceTzOffsetDateTime, tickDateTimeRepeatIndex: Integer): boolean;

    // addTick(sourceTzOffsetDateTime: SourceTzOffsetDateTime, tickDateTimeRepeatIndex: Integer): void;
    // getLastSourceTimezoneOffset(): Integer;

    // subscribePointInsertedEvent(handler: IntervalHistorySequencer.PointInsertedEventHandler): MultiEvent.SubscriptionId;
    // unsubscribePointInsertedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
    // subscribePointUpdatedEvent(handler: IntervalHistorySequencer.PointUpdatedEventHandler): MultiEvent.SubscriptionId;
    // unsubscribePointUpdatedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
    // subscribeEmptyIntervalsInsertedEvent(handler: IntervalHistorySequencer.EmptyIntervalsInsertedEventHandler): MultiEvent.SubscriptionId
    // unsubscribeEmptyIntervalsInsertedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

/** @public */
export namespace IntervalHistorySequencer {
    export const enum UnitEnum {
        Millisecond = 'Millisecond',
        Day = 'Day',
        Week = 'Week',
        Month = 'Month',
        Year = 'Year',
    }
    export type Unit = keyof typeof UnitEnum;

    // export type PointInsertedEventHandler = (this: void, index: Integer) => boolean;
    // export type PointUpdatedEventHandler = (this: void, index: Integer) => boolean;
    // export type EmptyIntervalsInsertedEventHandler = (this: void, index: Integer, count: Integer) => void;

    export interface Point extends HistorySequencer.Point {
    }

    export interface PointList extends ComparableList<Point> {
        findPoint(dateTime: Date, suggestedIndex: Integer): ComparableList.BinarySearchResult;
    }

    // export namespace PointList {
    //     // SearchPoint has same shape as Point but utcDate is writeable
    //     export interface SearchPoint {
    //         utcDate: Date;
    //         readonly offset: Integer;
    //     }
    // }
}
