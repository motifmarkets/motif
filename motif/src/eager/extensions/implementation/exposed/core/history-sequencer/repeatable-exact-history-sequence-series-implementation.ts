/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RepeatableExactHistorySequenceSeries } from '@motifmarkets/motif-core';
import {
    Integer as IntegerApi,
    RepeatableExactHistorySequenceSeries as RepeatableExactHistorySequenceSeriesApi
} from '../../../../api/extension-api';
import { HistorySequenceSeriesImplementation } from './history-sequence-series-implementation';
import { RepeatableExactHistorySequencerImplementation } from './repeatable-exact-history-sequencer-implementation';

export abstract class RepeatableExactHistorySequenceSeriesImplementation extends HistorySequenceSeriesImplementation
    implements RepeatableExactHistorySequenceSeriesApi {

    get repeatableExactSequencer() { return RepeatableExactHistorySequencerImplementation.toApi(this.actual.repeatableExactSequencer); }
    get sequencerPoints() { return RepeatableExactHistorySequencerImplementation.PointList.toApi(this.actual.sequencerPoints); }

    abstract override get actual(): RepeatableExactHistorySequenceSeries;

    getSequencerPoint(idx: IntegerApi) {
        return this.actual.getSequencerPoint(idx);
    }
}
