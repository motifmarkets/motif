/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { NumberHistorySequenceSeriesInterface } from './number-history-sequence-series-interface-api';
import { RepeatableExactHistorySequenceSeries } from './repeatable-exact-history-sequence-series-api';

/** @public */
export interface CurrentRepeatableExactHistorySequenceSeries
    extends RepeatableExactHistorySequenceSeries, NumberHistorySequenceSeriesInterface {

}

/** @public */
export namespace CurrentRepeatableExactHistorySequenceSeries {
    export interface Point extends RepeatableExactHistorySequenceSeries.Point {
        value: number;
    }
}
