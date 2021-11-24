/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer } from 'sys-internal-api';
import { HistorySequenceSeries } from './history-sequence-series';
import { HistorySequencer } from './history-sequencer';

export interface NumberHistorySequenceSeriesInterface extends HistorySequenceSeries {
    getSequencerPoint(idx: Integer): HistorySequencer.Point;
    getNumberPoint(idx: Integer): NumberHistorySequenceSeriesInterface.Point;
}

export namespace NumberHistorySequenceSeriesInterface {
    export interface Point extends HistorySequenceSeries.Point {
        value: number;
    }
}
