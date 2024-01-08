/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LastIntervalHistorySequenceSeries } from '@motifmarkets/motif-core';
import {
    Integer as IntegerApi,
    LastIntervalHistorySequenceSeries as LastIntervalHistorySequenceSeriesApi
} from '../../../../api/extension-api';
import { IntervalHistorySequenceSeriesImplementation } from './interval-history-sequence-series-implementation';

export class LastIntervalHistorySequenceSeriesImplementation extends IntervalHistorySequenceSeriesImplementation
    implements LastIntervalHistorySequenceSeriesApi {

    constructor(private readonly _actual: LastIntervalHistorySequenceSeries) {
        super();
    }

    get actual() { return this._actual; }

    getNumberPoint(idx: IntegerApi): LastIntervalHistorySequenceSeriesApi.Point {
        return this._actual.getNumberPoint(idx);
    }
}

export namespace LastIntervalHistorySequenceSeriesImplementation {
    export function toApi(actual: LastIntervalHistorySequenceSeries) {
        return new LastIntervalHistorySequenceSeriesImplementation(actual);
    }

    export function fromApi(value: LastIntervalHistorySequenceSeriesApi) {
        const implementation = value as LastIntervalHistorySequenceSeriesImplementation;
        return implementation.actual;
    }
}
