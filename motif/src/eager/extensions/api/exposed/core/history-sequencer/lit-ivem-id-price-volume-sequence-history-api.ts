/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../../adi/lit-ivem-id-api';
import { HistorySequenceSeries } from './history-sequence-series-api';
import { HistorySequencer } from './history-sequencer-api';
import { SequenceHistory } from './sequence-history-api';

/** @public */
export interface LitIvemIdPriceVolumeSequenceHistory extends SequenceHistory {

    readonly active: boolean;
    readonly litIvemId: LitIvemId;

    registerSeries(series: HistorySequenceSeries, seriesType: LitIvemIdPriceVolumeSequenceHistory.SeriesType): void;
    deregisterSeries(series: HistorySequenceSeries, seriesType: LitIvemIdPriceVolumeSequenceHistory.SeriesType): void;

    activate(litIvemId: LitIvemId): void;

    setSequencer(sequencer: HistorySequencer | undefined): void;
}

/** @public */
export namespace LitIvemIdPriceVolumeSequenceHistory {
    export const enum SeriesTypeEnum {
        Price = 'Price',
        Volume = 'Volume',
    }
    export type SeriesType = keyof typeof SeriesTypeEnum;
}
