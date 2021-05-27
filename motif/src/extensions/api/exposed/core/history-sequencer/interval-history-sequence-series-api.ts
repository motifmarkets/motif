/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

// import { Integer } from '../../sys/extension-api';
import { HistorySequenceSeries } from './history-sequence-series-api';
import { IntervalHistorySequencer } from './interval-history-sequencer-api';
// import { IntervalHistorySequencer } from './interval-history-sequencer-api';

/** @public */
export interface IntervalHistorySequenceSeries extends HistorySequenceSeries {
    readonly intervalSequencer: IntervalHistorySequencer;
    readonly sequencerPoints: IntervalHistorySequencer.PointList;
    // readonly completedIntervalsVisibleOnly: boolean;

    // getIntervalHistorySequencerPoint(idx: Integer): IntervalHistorySequencer.Point;
}

/** @public */
export namespace IntervalHistorySequenceSeries {
    export interface Point extends HistorySequenceSeries.Point {
    }
}
