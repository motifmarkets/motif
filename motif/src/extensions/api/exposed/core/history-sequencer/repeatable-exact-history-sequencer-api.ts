/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

// import { ComparableList, Integer, MultiEvent, SourceTzOffsetDateTime } from '../../sys/extension-api';
import { ComparableList, Integer } from '../../sys/extension-api';
import { HistorySequencer } from './history-sequencer-api';

/** @public */
export interface RepeatableExactHistorySequencer extends HistorySequencer {
    readonly pointList: RepeatableExactHistorySequencer.PointList;

    // clear(fromIdx?: Integer): void;
    // addDateTime(sourceTzOffsetDateTime: SourceTzOffsetDateTime, tickDateTimeRepeatIndex: Integer): boolean;
    // addTick(sourceTzOffsetDateTime: SourceTzOffsetDateTime, tickDateTimeRepeatIndex: Integer): void;

    // getLastSourceTimezoneOffset(): Integer;

    // subscribePointInsertedEvent(handler: RepeatableExactHistorySequencer.PointInsertedEventHandler): MultiEvent.SubscriptionId;
    // unsubscribePointInsertedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
    // subscribePointUpdatedEvent(handler: RepeatableExactHistorySequencer.PointUpdatedEventHandler): MultiEvent.SubscriptionId;
    // unsubscribePointUpdatedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

/** @public */
export namespace RepeatableExactHistorySequencer {
    // export type PointInsertedEventHandler = (this: void, index: Integer) => void;
    // export type PointUpdatedEventHandler = (this: void, index: Integer) => void;

    export interface Point extends HistorySequencer.Point {
        dateTimeRepeatIndex: Integer;
    }

    export interface PointList extends ComparableList<Point> {
        findPoint(dateTime: Date, dateTimeRepeatIndex: Integer, suggestedIndex: Integer): ComparableList.BinarySearchResult;
    }

    export namespace PointList {
        // SearchPoint has same shape as Point but utcDate is writeable
        export interface SearchPoint {
            utcDate: Date;
            readonly offset: Integer;
            readonly dateTimeRepeatIndex: Integer;
        }
    }
}
