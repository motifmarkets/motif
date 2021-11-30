/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { OhlcIntervalHistorySequenceSeries } from '@motifmarkets/motif-core';
import {
    Integer as IntegerApi,
    OhlcHistorySequenceSeriesInterface as OhlcHistorySequenceSeriesInterfaceApi,
    OhlcIntervalHistorySequenceSeries as OhlcIntervalHistorySequenceSeriesApi
} from '../../../../api/extension-api';
import { IntervalHistorySequenceSeriesImplementation } from './interval-history-sequence-series-implementation';

export class OhlcIntervalHistorySequenceSeriesImplementation extends IntervalHistorySequenceSeriesImplementation
    implements OhlcIntervalHistorySequenceSeriesApi {

    constructor(private readonly _actual: OhlcIntervalHistorySequenceSeries) {
        super();
    }

    get actual() { return this._actual; }

    getOhlcPoint(idx: IntegerApi): OhlcHistorySequenceSeriesInterfaceApi.Point {
        return this._actual.getOhlcPoint(idx);
    }
}

export namespace OhlcIntervalHistorySequenceSeriesImplementation {
    export function toApi(actual: OhlcIntervalHistorySequenceSeries) {
        return new OhlcIntervalHistorySequenceSeriesImplementation(actual);
    }

    export function fromApi(value: OhlcIntervalHistorySequenceSeriesApi) {
        const implementation = value as OhlcIntervalHistorySequenceSeriesImplementation;
        return implementation.actual;
    }
}
