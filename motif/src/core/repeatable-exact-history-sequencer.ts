/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    BinarySearchResult,
    ComparableList,
    compareDate,
    compareInteger,
    ComparisonResult,
    Integer,
    isDateEqual,
    MultiEvent,
    SourceTzOffsetDateTime
} from 'src/sys/internal-api';
import { HistorySequencer } from './history-sequencer';

export class RepeatableExactHistorySequencer extends HistorySequencer {
    private _pointList = new RepeatableExactHistorySequencer.PointList();
    private _activeIntervalIdx = 0;

    private _pointInsertedMultiEvent = new MultiEvent<RepeatableExactHistorySequencer.PointInsertedEventHandler>();
    private _pointUpdatedMultiEvent = new MultiEvent<RepeatableExactHistorySequencer.PointUpdatedEventHandler>();

    constructor() {
        super(HistorySequencer.TypeId.Interval);
        this._pointList.capacityIncSize = 1000;
    }

    get pointList() { return this._pointList; }

    clear(fromIdx: Integer = 0) {
        this._pointList.clear();
        this._activeIntervalIdx = 0;
    }

    addDateTime(sourceTzOffsetDateTime: SourceTzOffsetDateTime, tickDateTimeRepeatIndex: Integer) {
        this.beginChange();
        try {
            const tickDateTime = sourceTzOffsetDateTime.utcDate;
            const { found, index } = this._pointList.findPoint(tickDateTime, tickDateTimeRepeatIndex, this._activeIntervalIdx);
            if (found) {
                this._activeIntervalIdx = index;
            } else {
                const point: RepeatableExactHistorySequencer.Point = {
                    offset: sourceTzOffsetDateTime.offset,
                    utcDate: tickDateTime,
                    dateTimeRepeatIndex: tickDateTimeRepeatIndex,
                };

                this._pointList.insert(index, point);
            }
            return true;
        } finally {
            this.endChange();
        }
    }

    addTick(sourceTzOffsetDateTime: SourceTzOffsetDateTime, tickDateTimeRepeatIndex: Integer) {
        this.beginChange();
        try {
            const offset = sourceTzOffsetDateTime.offset;
            const tickDateTime = sourceTzOffsetDateTime.utcDate;

            const { found, index } = this._pointList.findPoint(tickDateTime, tickDateTimeRepeatIndex, this._activeIntervalIdx);

            if (found) {
                this.notifyPointUpdated(index);
                this._activeIntervalIdx = index;
            } else {
                const point: RepeatableExactHistorySequencer.Point = {
                    offset,
                    utcDate: tickDateTime,
                    dateTimeRepeatIndex: tickDateTimeRepeatIndex
                };

                this._pointList.insert(index, point);

                this.notifyPointInserted(index);
            }
        } finally {
            this.endChange();
        }
    }

    getLastSourceTimezoneOffset() {
        if (this.pointCount === 0) {
            return undefined;
        } else {
            return this.pointList.getItem(this.pointCount - 1).offset;
        }
    }

    subscribePointInsertedEvent(handler: RepeatableExactHistorySequencer.PointInsertedEventHandler) {
        return this._pointInsertedMultiEvent.subscribe(handler);
    }

    unsubscribePointInsertedEvent(subscriptionId: MultiEvent.SubscriptionId) {
         this._pointInsertedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribePointUpdatedEvent(handler: RepeatableExactHistorySequencer.PointUpdatedEventHandler) {
        return this._pointUpdatedMultiEvent.subscribe(handler);
    }

    unsubscribePointUpdatedEvent(subscriptionId: MultiEvent.SubscriptionId) {
         this._pointUpdatedMultiEvent.unsubscribe(subscriptionId);
    }

    protected getPointCount() {
        return this._pointList.count;
    }

    private notifyPointInserted(index: Integer) {
        const handlers = this._pointInsertedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            const handler = handlers[i];
            handler(index);
        }
    }

    private notifyPointUpdated(index: Integer) {
        const handlers = this._pointUpdatedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            const handler = handlers[i];
            handler(index);
        }
    }
}

export namespace RepeatableExactHistorySequencer {
    export type PointInsertedEventHandler = (this: void, index: Integer) => void;
    export type PointUpdatedEventHandler = (this: void, index: Integer) => void;

    export interface Point extends HistorySequencer.Point {
        dateTimeRepeatIndex: Integer;
    }

    export class PointList extends ComparableList<Point> {
        private _searchPoint: PointList.SearchPoint = {
            utcDate: new Date(0),
            offset: -1,
            dateTimeRepeatIndex: -1,
        };

        constructor() {
            super(PointList.compareItems);
        }

        findPoint(dateTime: Date, dateTimeRepeatIndex: Integer, suggestedIndex: Integer): BinarySearchResult {
            const count = this.count;
            if (count === 0) {
                // empty - need to check this first
                return {
                    found: false,
                    index: 0,
                };
            } else {
                if (this.isDateTimeAndRepeatIndexEqual(suggestedIndex, dateTime, dateTimeRepeatIndex)) {
                    // Current point being added to. Typically price/volume
                    return {
                        found: true,
                        index: suggestedIndex,
                    };
                } else {
                    const lastIdx = count - 1;
                    if (this.compareDateTimeAndRepeatIndex(lastIdx, dateTime, dateTimeRepeatIndex) === ComparisonResult.LeftLessThanRight) {
                        // new interval at end
                        return {
                            found: false,
                            index: count,
                        };
                    } else {
                        this._searchPoint.utcDate = dateTime;
                        return super.binarySearch(this._searchPoint);
                    }
                }
            }
        }

        private isDateTimeAndRepeatIndexEqual(index: Integer, dateTime: Date, dateTimeRepeatIndex: Integer) {
            const item = this.getItem(index);
            return isDateEqual(item.utcDate, dateTime) && item.dateTimeRepeatIndex === dateTimeRepeatIndex;
        }

        private compareDateTimeAndRepeatIndex(index: Integer, dateTime: Date, dateTimeRepeatIndex: Integer) {
            const item = this.getItem(index);

            const dateCompareResult = compareDate(item.utcDate, dateTime);
            if (dateCompareResult !== ComparisonResult.LeftEqualsRight) {
                return dateCompareResult;
            } else {
                return compareInteger(item.dateTimeRepeatIndex, dateTimeRepeatIndex);
            }
        }
    }

    export namespace PointList {
        // SearchPoint has same shape as Point but utcDate is writeable
        export interface SearchPoint {
            utcDate: Date;
            readonly offset: Integer;
            readonly dateTimeRepeatIndex: Integer;
        }

        export function compareItems(left: Point, right: Point): Integer {
            const dateCompareResult = compareDate(left.utcDate, right.utcDate);
            if (dateCompareResult !== ComparisonResult.LeftEqualsRight) {
                return dateCompareResult;
            } else {
                return compareInteger(left.dateTimeRepeatIndex, right.dateTimeRepeatIndex);
            }
        }
    }
}
