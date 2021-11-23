/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer } from 'src/sys/internal-api';
import { HistorySequenceSeries } from './history-sequence-series';
import { IntervalHistorySequencer } from './interval-history-sequencer';

export abstract class IntervalHistorySequenceSeries extends HistorySequenceSeries {
    private _completedIntervalsVisibleOnly = false;

    constructor(private _intervalSequencer: IntervalHistorySequencer) {
        super(_intervalSequencer);
    }

    get intervalSequencer() { return this._intervalSequencer; }
    get sequencerPoints() { return this._intervalSequencer.pointList; }
    get completedIntervalsVisibleOnly() { return this._completedIntervalsVisibleOnly; }

    getSequencerPoint(idx: Integer) { return this.sequencerPoints.getItem(idx); }

    protected override getPointCount() {
        const sequencerPointCount = super.getPointCount();
        return this._completedIntervalsVisibleOnly ? sequencerPointCount - 1 : sequencerPointCount;
    }

    protected override notifyPointInserted(index: Integer) {
        if (!this._completedIntervalsVisibleOnly) {
            super.notifyPointInserted(index);
        } else {
            const sequencerPointCount = super.getPointCount();
            if (index < sequencerPointCount - 1) {
                super.notifyPointInserted(index);
            } else {
                if (index > 0) {
                    super.notifyPointInserted(index - 1); // stay one behind sequencer
                }
            }
        }
    }

    protected override notifyPointUpdated(index: Integer) {
        if (!this._completedIntervalsVisibleOnly) {
            super.notifyPointUpdated(index);
        } else {
            const sequencerPointCount = super.getPointCount();
            if (index < sequencerPointCount - 1) {
                // last point is not visible so don't fire an update event for it
                super.notifyPointUpdated(index);
            }
        }
    }
}

export namespace IntervalHistorySequenceSeries {
    export interface Point extends HistorySequenceSeries.Point {
    }
}
