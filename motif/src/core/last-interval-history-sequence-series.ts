/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ComparableList, compareDate, ComparisonResult, Integer, MultiEvent, newNullDate } from 'src/sys/internal-api';
import { IntervalHistorySequenceSeries } from './interval-history-sequence-series';
import { IntervalHistorySequencer } from './interval-history-sequencer';
import { NumberHistorySequenceSeriesInterface } from './number-history-sequence-series-interface';

export class LastIntervalHistorySequenceSeries extends IntervalHistorySequenceSeries implements NumberHistorySequenceSeriesInterface {
    private _points = new ComparableList<LastIntervalHistorySequenceSeries.Point>();

    private _stagedTick: LastIntervalHistorySequenceSeries.StagedTick | undefined;

    private _pointInsertedEventSubscriptionId: MultiEvent.SubscriptionId;
    private _pointUpdatedEventSubscriptionId: MultiEvent.SubscriptionId;
    private _emptyIntervalsInsertedEventSubscriptionId: MultiEvent.SubscriptionId;

    protected get points() { return this._points; }

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

    override finalise() {
        this.intervalSequencer.unsubscribePointInsertedEvent(this._pointInsertedEventSubscriptionId);
        this._pointInsertedEventSubscriptionId = undefined;
        this.intervalSequencer.unsubscribePointUpdatedEvent(this._pointUpdatedEventSubscriptionId);
        this._pointUpdatedEventSubscriptionId = undefined;
        this.intervalSequencer.unsubscribeEmptyIntervalsInsertedEvent(this._emptyIntervalsInsertedEventSubscriptionId);
        this._emptyIntervalsInsertedEventSubscriptionId = undefined;
    }

    getNumberPoint(idx: Integer) {
        return this.points.getItem(idx);
    }

    stageOhlcTick(tickDateTime: Date, tickDateTimeRepeatCount: Integer,
        open: number, high: number, low: number, close: number | undefined
    ) {
        this._stagedTick = {
            tickDateTime,
            tickDateTimeRepeatCount,
            value: close,
        };
    }

    stageValueTick(tickDateTime: Date, tickDateTimeRepeatCount: Integer, value: number | undefined) {
        this._stagedTick = {
            tickDateTime,
            tickDateTimeRepeatCount,
            value,
        };
    }

    clear() {
        this._points.clear();
    }

    initialiseWithNullPoints() {
        this._points.clear();
        const count = this.sequencerPoints.count;
        const nullPoints = new Array<LastIntervalHistorySequenceSeries.Point>(count);
        for (let i = 0; i < count; i++) {
            nullPoints[i] = this.createNullPoint(i);
        }
        this._points.addRange(nullPoints);
    }

    private handlePointInsertedEvent(index: Integer) {
        if (this._stagedTick === undefined) {
            this.insertNullPoint(index);
            return false;
        } else {
            const insertOrUpdateNextRequired = this.insertPointFromStagedTick(index, this._stagedTick);
            this._stagedTick = undefined;
            return insertOrUpdateNextRequired;
        }
    }

    private handlePointUpdatedEvent(index: Integer) {
        if (this._stagedTick === undefined) {
            return false;
        } else {
            const insertOrUpdateNextRequired = this.updatePointFromStagedTick(index, this._stagedTick);
            this._stagedTick = undefined;
            return insertOrUpdateNextRequired;
        }
    }

    private handleEmptyIntervalsInsertedEvent(index: Integer, count: Integer) {
        this.insertNullPoints(index, count);
    }

    private createNullPoint(index: Integer) {
        const result: LastIntervalHistorySequenceSeries.Point = {
            null: true,
            previousIntervalCloseDateTime: newNullDate(),
            previousIntervalCloseDateTimeRepeatCount: -1,
            value: 0,
        };
        return result;
    }

    private insertNullPoint(index: Integer) {
        const point = this.createNullPoint(index);
        this._points.insert(index, point);
        this.notifyPointInserted(index);
    }

    private insertNullPoints(index: Integer, count: Integer) {
        const insertPoints = new Array<LastIntervalHistorySequenceSeries.Point>(count);
        let pointIdx = index;
        for (let i = 0; i < count; i++) {
            insertPoints[i] = this.createNullPoint(pointIdx++);
        }
        this._points.insertRange(index, insertPoints);
        this.notifyPointsInserted(index, count);
    }

    private insertPointFromStagedTick(index: Integer, tick: LastIntervalHistorySequenceSeries.StagedTick) {
        const sequencerPoint = this.sequencerPoints.getItem(index);
        const tickDateTime = tick.tickDateTime;
        const closeDateTimeComparisonResult = compareDate(tickDateTime, sequencerPoint.utcDate);
        if (closeDateTimeComparisonResult === ComparisonResult.LeftGreaterThanRight) {
            // staged tick belongs to interval after that specified by index
            this.insertNullPoint(index); // insert a null interval instead
            return true; // flag that a subsequent interval needs to be inserted or updated (tick is still staged)
        } else {
            // staged tick belongs to interval specified by index
            const point = this.createPointFromTick(index, tick);
            this._stagedTick = undefined;
            this._points.insert(index, point);
            this.notifyPointInserted(index);
            return false;
        }
    }

    private createPointFromTick(index: Integer, tick: LastIntervalHistorySequenceSeries.StagedTick) {
        if (tick.value === undefined) {
            return this.createNullPoint(index);
        } else {
            const tickDateTime = tick.tickDateTime;
            const tickDateTimeRepeatCount = tick.tickDateTimeRepeatCount;

            const result: LastIntervalHistorySequenceSeries.Point = {
                null: false,
                previousIntervalCloseDateTime: tickDateTime,
                previousIntervalCloseDateTimeRepeatCount: tickDateTimeRepeatCount,
                value: tick.value,
            };
            return result;
        }
    }


    private updatePointFromStagedTick(index: Integer, tick: LastIntervalHistorySequenceSeries.StagedTick) {
        const point = this.points.getItem(index);
        const tickValue = tick.value;
        if (tickValue === undefined) {
            if (!point.null) {
                point.null = true;
                point.previousIntervalCloseDateTime = newNullDate();
                point.previousIntervalCloseDateTimeRepeatCount = -1;
                point.value = 0;
                this.notifyPointUpdated(index);
            }
            return false;
        } else {
            const sequencerPoint = this.sequencerPoints.getItem(index);
            const tickDateTime = tick.tickDateTime;
            const tickDateTimeRepeatCount = tick.tickDateTimeRepeatCount;
            const nextIntervalStartComparisonResult = compareDate(tickDateTime, sequencerPoint.utcDate);
            if (nextIntervalStartComparisonResult === ComparisonResult.LeftGreaterThanRight) {
                // staged tick belongs to interval after that specified by index
                return true; // flag that a subsequent interval needs to be inserted or updated (tick is still staged)
            } else {
                if (point.null) {
                    point.null = false;
                    point.previousIntervalCloseDateTime = tickDateTime;
                    point.previousIntervalCloseDateTimeRepeatCount = tickDateTimeRepeatCount;
                    point.value = tickValue;
                    this.notifyPointUpdated(index);
                } else {
                    const closeDateTimeComparisonResult = compareDate(tickDateTime, point.previousIntervalCloseDateTime);
                    if (closeDateTimeComparisonResult === ComparisonResult.LeftGreaterThanRight
                        ||
                        (
                            (closeDateTimeComparisonResult === ComparisonResult.LeftEqualsRight)
                            &&
                            (tickDateTimeRepeatCount >= point.previousIntervalCloseDateTimeRepeatCount)
                        )
                    ) {
                        point.value = tickValue;
                        point.previousIntervalCloseDateTime = tickDateTime;
                        point.previousIntervalCloseDateTimeRepeatCount = tickDateTimeRepeatCount;
                        this.notifyPointUpdated(index);
                    }
                }
                return false;
            }
        }
    }
}

export namespace LastIntervalHistorySequenceSeries {
    export interface Point extends IntervalHistorySequenceSeries.Point {
        previousIntervalCloseDateTime: Date;
        previousIntervalCloseDateTimeRepeatCount: Integer;
        value: number;
    }

    export interface StagedTick {
        tickDateTime: Date;
        tickDateTimeRepeatCount: Integer;
        value: number | undefined;
    }
}
