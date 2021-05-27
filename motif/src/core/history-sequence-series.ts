/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer, MultiEvent } from 'src/sys/internal-api';
import { HistorySequenceSeriesInterface } from './history-sequence-series-interface';
import { HistorySequencer } from './history-sequencer';

export abstract class HistorySequenceSeries implements HistorySequenceSeriesInterface {
    private _pointInsertedMultiEvent = new MultiEvent<HistorySequenceSeriesInterface.PointInsertedEventHandler>();
    private _pointsInsertedMultiEvent = new MultiEvent<HistorySequenceSeriesInterface.PointsInsertedEventHandler>();
    private _pointUpdatedMultiEvent = new MultiEvent<HistorySequenceSeriesInterface.PointUpdatedEventHandler>();

    get sequencer() { return this._sequencer; }

    get pointCount() { return this.getPointCount(); }

    constructor(private _sequencer: HistorySequencer) { }

    finalise() {
        this.clear();
    }

    subscribePointInsertedEvent(handler: HistorySequenceSeriesInterface.PointInsertedEventHandler) {
        return this._pointInsertedMultiEvent.subscribe(handler);
    }

    unsubscribePointInsertedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._pointInsertedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribePointsInsertedEvent(handler: HistorySequenceSeriesInterface.PointsInsertedEventHandler) {
        return this._pointsInsertedMultiEvent.subscribe(handler);
    }

    unsubscribePointsInsertedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._pointsInsertedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribePointUpdatedEvent(handler: HistorySequenceSeriesInterface.PointUpdatedEventHandler) {
        return this._pointUpdatedMultiEvent.subscribe(handler);
    }

    unsubscribePointUpdatedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._pointUpdatedMultiEvent.unsubscribe(subscriptionId);
    }

    protected notifyPointInserted(idx: Integer) {
        if (!this.sequencer.allSeriesLoading) {
            const handlers = this._pointInsertedMultiEvent.copyHandlers();
            for (const handler of handlers) {
                handler(idx);
            }
        }
    }

    protected notifyPointsInserted(idx: Integer, count: Integer) {
        if (!this.sequencer.allSeriesLoading) {
            const handlers = this._pointsInsertedMultiEvent.copyHandlers();
            for (const handler of handlers) {
                handler(idx, count);
            }
        }
    }

    protected notifyPointUpdated(idx: Integer) {
        if (!this.sequencer.allSeriesLoading) {
            const handlers = this._pointUpdatedMultiEvent.copyHandlers();
            for (const handler of handlers) {
                handler(idx);
            }
        }
    }

    protected getPointCount() {
        return this._sequencer.pointCount;
    }

    abstract clear(): void;
    abstract initialiseWithNullPoints(): void;

    abstract stageOhlcTick(tickDateTime: Date, tickDateTimeRepeatIndex: Integer,
        open: number, high: number, low: number, close: number | undefined): void;
    abstract stageValueTick(tickDateTime: Date, tickDateTimeRepeatIndex: Integer, value: number | undefined): void;
}

export namespace HistorySequenceSeries {
    export interface Point extends HistorySequenceSeriesInterface.Point {

    }
}
