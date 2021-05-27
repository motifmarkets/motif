/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer } from 'src/sys/internal-api';
import { HistorySequenceSeries } from './history-sequence-series';
import { RepeatableExactHistorySequencer } from './repeatable-exact-history-sequencer';

export abstract class RepeatableExactHistorySequenceSeries extends HistorySequenceSeries {

    get repeatableExactSequencer() { return this._repeatableExactSequencer; }
    get sequencerPoints() { return this._repeatableExactSequencer.pointList; }

    constructor(private _repeatableExactSequencer: RepeatableExactHistorySequencer) {
        super(_repeatableExactSequencer);
    }

    getSequencerPoint(idx: Integer) { return this.sequencerPoints.getItem(idx); }
}

export namespace RepeatableExactHistorySequenceSeries {
    export interface Point extends HistorySequenceSeries.Point {
    }
}
