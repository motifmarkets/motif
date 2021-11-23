/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AccumulationIntervalHistorySequenceSeries } from 'src/core/internal-api';
import {
    AccumulationIntervalHistorySequenceSeries as AccumulationIntervalHistorySequenceSeriesApi, Integer as IntegerApi
} from '../../../../api/extension-api';
import { IntervalHistorySequenceSeriesImplementation } from './interval-history-sequence-series-implementation';

export class AccumulationIntervalHistorySequenceSeriesImplementation extends IntervalHistorySequenceSeriesImplementation
    implements AccumulationIntervalHistorySequenceSeriesApi {

    constructor(private readonly _actual: AccumulationIntervalHistorySequenceSeries) {
        super();
    }

    get actual() { return this._actual; }

    getNumberPoint(idx: IntegerApi): AccumulationIntervalHistorySequenceSeriesApi.Point {
        return this._actual.getNumberPoint(idx);
    }
}

export namespace AccumulationIntervalHistorySequenceSeriesImplementation {
    export function toApi(actual: AccumulationIntervalHistorySequenceSeries) {
        return new AccumulationIntervalHistorySequenceSeriesImplementation(actual);
    }

    export function fromApi(value: AccumulationIntervalHistorySequenceSeriesApi) {
        const implementation = value as AccumulationIntervalHistorySequenceSeriesImplementation;
        return implementation.actual;
    }
}
