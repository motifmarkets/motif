/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ComparableList, Integer, MultiEvent } from 'src/sys/internal-api';
import { NumberHistorySequenceSeriesInterface } from './number-history-sequence-series-interface';
import { RepeatableExactHistorySequenceSeries } from './repeatable-exact-history-sequence-series';
import { RepeatableExactHistorySequencer } from './repeatable-exact-history-sequencer';

// eslint-disable-next-line max-len
export class CurrentRepeatableExactHistorySequenceSeries extends RepeatableExactHistorySequenceSeries implements NumberHistorySequenceSeriesInterface {
    private _points = new ComparableList<CurrentRepeatableExactHistorySequenceSeries.Point>();

    private _stagedTick: CurrentRepeatableExactHistorySequenceSeries.StagedTick | undefined;

    private _pointInsertedEventSubscriptionId: MultiEvent.SubscriptionId;
    private _pointUpdatedEventSubscriptionId: MultiEvent.SubscriptionId;

    protected get points() { return this._points; }

    constructor(sequencer: RepeatableExactHistorySequencer) {
        super(sequencer);
        this._pointInsertedEventSubscriptionId = this.repeatableExactSequencer.subscribePointInsertedEvent(
            (index) => this.handlePointInsertedEvent(index)
        );
        this._pointUpdatedEventSubscriptionId = this.repeatableExactSequencer.subscribePointUpdatedEvent(
            (index) => this.handlePointUpdatedEvent(index)
        );
    }

    override finalise() {
        this.repeatableExactSequencer.unsubscribePointInsertedEvent(this._pointInsertedEventSubscriptionId);
        this._pointInsertedEventSubscriptionId = undefined;
        this.repeatableExactSequencer.unsubscribePointUpdatedEvent(this._pointUpdatedEventSubscriptionId);
        this._pointUpdatedEventSubscriptionId = undefined;
    }

    getNumberPoint(idx: Integer) {
        return this.points.getItem(idx);
    }

    stageOhlcTick(tickDateTime: Date, open: number, high: number, low: number, close: number | undefined) {
        this._stagedTick = {
            value: close,
        };
    }

    stageValueTick(tickDateTime: Date, value: number | undefined) {
        this._stagedTick = {
            value,
        };
    }

    clear() {
        this._points.clear();
    }

    initialiseWithNullPoints() {
        this._points.clear();
        const count = this.sequencerPoints.count;
        const nullPoints = new Array<CurrentRepeatableExactHistorySequenceSeries.Point>(count);
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

    private createNullPoint(index: Integer) {
        const result: CurrentRepeatableExactHistorySequenceSeries.Point = {
            null: true,
            value: 0,
        };
        return result;
    }

    private insertNullPoint(index: Integer) {
        const point = this.createNullPoint(index);
        this._points.insert(index, point);
        this.notifyPointInserted(index);
    }

    private insertPointFromStagedTick(index: Integer, tick: CurrentRepeatableExactHistorySequenceSeries.StagedTick) {
        const point = this.createPointFromTick(index, tick);
        this._stagedTick = undefined;
        this._points.insert(index, point);
        this.notifyPointInserted(index);
    }

    private createPointFromTick(index: Integer, tick: CurrentRepeatableExactHistorySequenceSeries.StagedTick) {
        if (tick.value === undefined) {
            return this.createNullPoint(index);
        } else {
            const result: CurrentRepeatableExactHistorySequenceSeries.Point = {
                null: false,
                value: tick.value,
            };
            return result;
        }
    }

    private updatePointFromStagedTick(index: Integer, tick: CurrentRepeatableExactHistorySequenceSeries.StagedTick) {
        const point = this.points.getItem(index);
        const tickValue = tick.value;
        let updated: boolean;
        if (tickValue === undefined) {
            if (point.null) {
                updated = false;
            } else {
                point.null = true;
                point.value = 0;
                updated = true;
            }
        } else {
            if (point.null) {
                point.null = false;
                point.value = tickValue;
                updated = true;
            } else {
                if (tickValue === point.value) {
                    updated = false;
                } else {
                    point.value = tickValue;
                    updated = true;
                }
            }
        }

        if (updated) {
            this.notifyPointUpdated(index);
        }
    }
}

export namespace CurrentRepeatableExactHistorySequenceSeries {
    export interface Point extends RepeatableExactHistorySequenceSeries.Point {
        value: number;
    }

    export interface StagedTick {
        value: number | undefined;
    }
}
