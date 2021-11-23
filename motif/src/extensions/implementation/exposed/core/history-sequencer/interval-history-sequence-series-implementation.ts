/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IntervalHistorySequenceSeries } from 'src/core/internal-api';
import {
    Integer as IntegerApi,
    IntervalHistorySequenceSeries as IntervalHistorySequenceSeriesApi
} from '../../../../api/exposed/extension-api';
import { HistorySequenceSeriesImplementation } from './history-sequence-series-implementation';
import { IntervalHistorySequencerImplementation } from './interval-history-sequencer-implementation';

export abstract class IntervalHistorySequenceSeriesImplementation extends HistorySequenceSeriesImplementation
    implements IntervalHistorySequenceSeriesApi {

    get intervalSequencer() { return IntervalHistorySequencerImplementation.toApi(this.actual.intervalSequencer); }
    get sequencerPoints() { return IntervalHistorySequencerImplementation.PointList.toApi(this.actual.sequencerPoints); }

    abstract override get actual(): IntervalHistorySequenceSeries;

    getSequencerPoint(idx: IntegerApi) {
        return this.actual.getSequencerPoint(idx);
    }
}
