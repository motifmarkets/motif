/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ComparableList, compareDate, ComparisonResult, Integer, MultiEvent, newDate, newNullDate } from 'src/sys/internal-api';
import { IntervalHistorySequenceSeries } from './interval-history-sequence-series';
import { IntervalHistorySequencer } from './interval-history-sequencer';
import { OhlcHistorySequenceSeriesInterface } from './ohlc-history-sequence-series-interface';

export class OhlcIntervalHistorySequenceSeries extends IntervalHistorySequenceSeries implements OhlcHistorySequenceSeriesInterface {
    private _points = new ComparableList<OhlcIntervalHistorySequenceSeries.Point>();

    private _stagedTick: OhlcIntervalHistorySequenceSeries.StagedTick | undefined;

    private _pointInsertedEventSubscriptionId: MultiEvent.SubscriptionId;
    private _pointUpdatedEventSubscriptionId: MultiEvent.SubscriptionId;
    private _emptyIntervalsInsertedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(sequencer: IntervalHistorySequencer) {
        super(sequencer);
        this._pointInsertedEventSubscriptionId = this.intervalSequencer.subscribePointInsertedEvent(
            (index) => this.handlePointInsertedEvent(index)
        );
        this._pointUpdatedEventSubscriptionId = this.intervalSequencer.subscribePointUpdatedEvent(
            (index) => this.handlePointUpdatedEvent(index)
        );
        this._emptyIntervalsInsertedEventSubscriptionId = this.intervalSequencer.subscribeEmptyIntervalsInsertedEvent(
            (index, count) => this.handleEmptyIntervalsInsertedEvent(index, count)
        );
    }

    get points() { return this._points; }

    override finalise() {
        this.intervalSequencer.unsubscribePointInsertedEvent(this._pointInsertedEventSubscriptionId);
        this._pointInsertedEventSubscriptionId = undefined;
        this.intervalSequencer.unsubscribePointUpdatedEvent(this._pointUpdatedEventSubscriptionId);
        this._pointUpdatedEventSubscriptionId = undefined;
        this.intervalSequencer.unsubscribeEmptyIntervalsInsertedEvent(this._emptyIntervalsInsertedEventSubscriptionId);
        this._emptyIntervalsInsertedEventSubscriptionId = undefined;
    }

    getOhlcPoint(idx: Integer) {
        return this.points.getItem(idx);
    }

    stageOhlcTick(tickDateTime: Date, tickDateTimeRepeatCount: Integer,
        open: number, high: number, low: number, close: number | undefined
    ) {
        this._stagedTick = {
            tickDateTime,
            tickDateTimeRepeatCount,
            open,
            high,
            low,
            close,
        };
    }

    stageValueTick(tickDateTime: Date, tickDateTimeRepeatCount: Integer, value: number | undefined) {
        if (value === undefined) {
            this._stagedTick = {
                tickDateTime,
                tickDateTimeRepeatCount,
                open: 0,
                high: 0,
                low: 0,
                close: undefined,
            };
        } else {
            this._stagedTick = {
                tickDateTime,
                tickDateTimeRepeatCount,
                open: value,
                high: value,
                low: value,
                close: value,
            };
        }
    }

    clear() {
        this._points.clear();
    }

    initialiseWithNullPoints() {
        this._points.clear();
        const count = this.sequencerPoints.count;
        const nullPoints = new Array<OhlcIntervalHistorySequenceSeries.Point>(count);
        for (let i = 0; i < count; i++) {
            nullPoints[i] = this.createNullPoint(i);
        }
        this._points.addRange(nullPoints);
    }

    private handlePointInsertedEvent(index: Integer) {
        if (this._stagedTick === undefined) {
            this.insertNullPoint(index);
        } else {
            this.insertPointFromStagedTick(index, this._stagedTick);
            this._stagedTick = undefined;
        }
        return false;
    }

    private handlePointUpdatedEvent(index: Integer) {
        if (this._stagedTick !== undefined) {
            this.updatePointFromStagedTick(index, this._stagedTick);
            this._stagedTick = undefined;
        }
        return false;
    }

    private handleEmptyIntervalsInsertedEvent(index: Integer, count: Integer) {
        this.insertNullPoints(index, count);
    }

    private createNullPoint(index: Integer) {
        const result: OhlcIntervalHistorySequenceSeries.Point = {
            null: true,
            closeDateTime: newNullDate(),
            closeDateTimeRepeatCount: -1,
            openDateTime: newNullDate(),
            openDateTimeRepeatCount: -1,
            open: 0,
            high: 0,
            low: 0,
            close: 0,
        };
        return result;
    }

    private createPointFromTick(index: Integer, tick: OhlcIntervalHistorySequenceSeries.StagedTick) {
        if (tick.close === undefined) {
            return this.createNullPoint(index);
        } else {
            const tickUtcDateTime = tick.tickDateTime;
            const tickDateTimeRepeatCount = tick.tickDateTimeRepeatCount;

            const result: OhlcIntervalHistorySequenceSeries.Point = {
                null: false,
                openDateTime: tickUtcDateTime,
                openDateTimeRepeatCount: tickDateTimeRepeatCount,
                closeDateTime: tickUtcDateTime,
                closeDateTimeRepeatCount: tickDateTimeRepeatCount,
                open: tick.open,
                high: tick.high,
                low: tick.low,
                close: tick.close,
            };
            return result;
        }
    }

    private insertNullPoint(index: Integer) {
        const point = this.createNullPoint(index);
        this._points.insert(index, point);
        this.notifyPointInserted(index);
    }

    private insertNullPoints(index: Integer, count: Integer) {
        const insertPoints = new Array<OhlcIntervalHistorySequenceSeries.Point>(count);
        let pointIdx = index;
        for (let i = 0; i < count; i++) {
            insertPoints[i] = this.createNullPoint(pointIdx++);
        }
        this._points.insertRange(index, insertPoints);
        this.notifyPointsInserted(index, count);
    }

    private insertPointFromStagedTick(index: Integer, tick: OhlcIntervalHistorySequenceSeries.StagedTick) {
        const point = this.createPointFromTick(index, tick);
        this._stagedTick = undefined;
        this._points.insert(index, point);
        this.notifyPointInserted(index);
    }

    private updatePointFromStagedTick(index: Integer, tick: OhlcIntervalHistorySequenceSeries.StagedTick) {
        const point = this._points.getItem(index);
        let updated = false;
        if (tick.close === undefined) {
            if (!point.null) {
                point.null = true;
                point.closeDateTime = newNullDate();
                point.closeDateTimeRepeatCount = -1;
                point.openDateTime = newNullDate();
                point.openDateTimeRepeatCount = -1;
                point.open = 0;
                point.high = 0;
                point.low = 0;
                point.close = 0;
                updated = true;
            }
        } else {
            const tickUtcDateTime = tick.tickDateTime;
            const tickDateTimeRepeatCount = tick.tickDateTimeRepeatCount;
            if (point.null) {
                point.null = false;
                point.openDateTime = tickUtcDateTime;
                point.openDateTimeRepeatCount = tickDateTimeRepeatCount;
                point.closeDateTime = tickUtcDateTime;
                point.closeDateTimeRepeatCount = tickDateTimeRepeatCount;
                point.open = tick.open;
                point.high = tick.high;
                point.low = tick.low;
                point.close = tick.close;
                updated = true;
            } else {
                const openDateTimeComparisonResult = compareDate(tickUtcDateTime, point.openDateTime);
                if (openDateTimeComparisonResult === ComparisonResult.LeftLessThanRight
                    ||
                    (
                        (openDateTimeComparisonResult === ComparisonResult.LeftEqualsRight)
                        &&
                        (tickDateTimeRepeatCount <= point.openDateTimeRepeatCount)
                    )
                ) {
                    point.openDateTime = newDate(tickUtcDateTime);
                    point.open = tick.open;
                    point.openDateTimeRepeatCount = tickDateTimeRepeatCount;
                    updated = true;
                }

                const closeDateTimeComparisonResult = compareDate(tickUtcDateTime, point.closeDateTime);
                if (closeDateTimeComparisonResult === ComparisonResult.LeftGreaterThanRight
                    ||
                    (
                        (closeDateTimeComparisonResult === ComparisonResult.LeftEqualsRight)
                        &&
                        (tickDateTimeRepeatCount >= point.closeDateTimeRepeatCount)
                    )
                ) {
                    point.close = tick.close;
                    point.closeDateTime = newDate(tickUtcDateTime);
                    point.closeDateTimeRepeatCount = tickDateTimeRepeatCount;
                    updated = true;
                }

                if (tick.high > point.high) {
                    point.high = tick.high;
                    updated = true;
                }

                if (tick.low < point.low) {
                    point.low = tick.low;
                    updated = true;
                }
            }
        }
        if (updated) {
            this.notifyPointUpdated(index);
        }
    }
}

export namespace OhlcIntervalHistorySequenceSeries {
    export interface Point extends IntervalHistorySequenceSeries.Point {
        openDateTime: Date;
        openDateTimeRepeatCount: Integer;
        closeDateTime: Date;
        closeDateTimeRepeatCount: Integer;
        open: number;
        high: number;
        low: number;
        close: number;
    }

    export interface StagedTick {
        tickDateTime: Date;
        tickDateTimeRepeatCount: Integer;
        open: number;
        high: number;
        low: number;
        close: number | undefined; // signifies null if undefined
    }
}
