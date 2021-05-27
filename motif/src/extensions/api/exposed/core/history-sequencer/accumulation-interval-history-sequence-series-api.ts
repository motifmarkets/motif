/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

// import { Integer } from '../../sys/extension-api';
import { IntervalHistorySequenceSeries } from './interval-history-sequence-series-api';
import { NumberHistorySequenceSeriesInterface } from './number-history-sequence-series-interface-api';

/** @public */
export interface AccumulationIntervalHistorySequenceSeries extends IntervalHistorySequenceSeries, NumberHistorySequenceSeriesInterface {
    // finalise(): void;
    // getNumberPoint(idx: Integer): AccumulationIntervalHistorySequenceSeries.Point;
    // stageOhlcTick(tickDateTime: Date, tickDateTimeRepeatCount: Integer,
    //     open: number, high: number, low: number, close: number | undefined
    // ): void;

    // stageValueTick(tickDateTime: Date, tickDateTimeRepeatCount: Integer, value: number | undefined): void;
    // clear(): void;
    // initialiseWithNullPoints(): void;
}

/** @public */
export namespace AccumulationIntervalHistorySequenceSeries {
    export interface Point extends IntervalHistorySequenceSeries.Point {
        value: number;
    }

    // export interface StagedTick {
    //     value: number | undefined;
    // }
}
