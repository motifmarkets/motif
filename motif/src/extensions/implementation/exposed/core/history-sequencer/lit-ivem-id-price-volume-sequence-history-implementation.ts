/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemIdPriceVolumeSequenceHistory } from 'src/core/internal-api';
import { UnreachableCaseError } from 'src/sys/internal-api';
import {
    ApiError,
    HistorySequencer as HistorySequencerApi,
    HistorySequenceSeries as HistorySequenceSeriesApi,
    LitIvemId as LitIvemIdApi,
    LitIvemIdPriceVolumeSequenceHistory as LitIvemIdPriceVolumeSequenceHistoryApi
} from '../../../../api/extension-api';
import { LitIvemIdImplementation } from '../../adi/internal-api';
import { UnreachableCaseApiErrorImplementation } from '../../sys/internal-api';
import { HistorySequenceSeriesImplementation } from './history-sequence-series-implementation';
import { HistorySequencerImplementation } from './history-sequencer-implementation';
import { SequenceHistoryImplementation } from './sequence-history-implementation';

export class LitIvemIdPriceVolumeSequenceHistoryImplementation extends SequenceHistoryImplementation
    implements LitIvemIdPriceVolumeSequenceHistoryApi {

    override get actual() { return this._actual; }

    get active() { return this._actual.active; }
    get litIvemId() { return LitIvemIdImplementation.toApi(this._actual.litIvemId); }

    constructor(private readonly _actual: LitIvemIdPriceVolumeSequenceHistory) {
        super(_actual);
    }

    override finalise() {
        this.setSequencer(undefined);
        this.deactivate();

        super.finalise();
    }

    activate(litIvemIdApi: LitIvemIdApi) {
        const litIvemId = LitIvemIdImplementation.fromApi(litIvemIdApi);
        this._actual.activate(litIvemId);
    }

    deactivate() {
        this._actual.deactivate();
    }

    setSequencer(sequencerApi: HistorySequencerApi | undefined) {
        const sequencer = sequencerApi === undefined ? undefined : HistorySequencerImplementation.baseFromApi(sequencerApi);
        this._actual.setSequencer(sequencer);
    }


    registerSeries(series: HistorySequenceSeriesApi, seriesType: LitIvemIdPriceVolumeSequenceHistoryApi.SeriesType) {
        const actualHistorySequenceSeries = HistorySequenceSeriesImplementation.baseFromApi(series);
        const actualSeriesTypeId = LitIvemIdPriceVolumeSequenceHistoryImplementation.SeriesTypeId.fromApi(seriesType);
        this._actual.registerSeries(actualHistorySequenceSeries, actualSeriesTypeId);
    }

    deregisterSeries(series: HistorySequenceSeriesApi, seriesType: LitIvemIdPriceVolumeSequenceHistoryApi.SeriesType) {
        const actualHistorySequenceSeries = HistorySequenceSeriesImplementation.baseFromApi(series);
        const actualSeriesTypeId = LitIvemIdPriceVolumeSequenceHistoryImplementation.SeriesTypeId.fromApi(seriesType);
        this._actual.deregisterSeries(actualHistorySequenceSeries, actualSeriesTypeId);
    }
}


export namespace LitIvemIdPriceVolumeSequenceHistoryImplementation {
    export function toApi(actual: LitIvemIdPriceVolumeSequenceHistory) {
        return new LitIvemIdPriceVolumeSequenceHistoryImplementation(actual);
    }

    export function fromApi(value: LitIvemIdPriceVolumeSequenceHistoryApi) {
        const implementation = value as LitIvemIdPriceVolumeSequenceHistoryImplementation;
        return implementation.actual;
    }

    export namespace SeriesTypeId {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function toApi(value: LitIvemIdPriceVolumeSequenceHistory.SeriesTypeId) {
            switch (value) {
                case LitIvemIdPriceVolumeSequenceHistory.SeriesTypeId.Price:
                    return LitIvemIdPriceVolumeSequenceHistoryApi.SeriesTypeEnum.Price;
                case LitIvemIdPriceVolumeSequenceHistory.SeriesTypeId.Volume:
                    return LitIvemIdPriceVolumeSequenceHistoryApi.SeriesTypeEnum.Volume;
                default:
                    throw new UnreachableCaseError('LIIPVSHI8555345239', value);

            }
        }

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function fromApi(value: LitIvemIdPriceVolumeSequenceHistoryApi.SeriesType) {
            const enumValue = value as LitIvemIdPriceVolumeSequenceHistoryApi.SeriesTypeEnum;
            switch (enumValue) {
                case LitIvemIdPriceVolumeSequenceHistoryApi.SeriesTypeEnum.Price:
                    return LitIvemIdPriceVolumeSequenceHistory.SeriesTypeId.Price;
                case LitIvemIdPriceVolumeSequenceHistoryApi.SeriesTypeEnum.Volume:
                    return LitIvemIdPriceVolumeSequenceHistory.SeriesTypeId.Volume;
                default:
                    const errorCode = ApiError.CodeEnum.InvalidLitIvemIdPriceVolumeSequenceHistorySeriesTypeId;
                    throw new UnreachableCaseApiErrorImplementation(errorCode, enumValue);

            }
        }
    }
}
