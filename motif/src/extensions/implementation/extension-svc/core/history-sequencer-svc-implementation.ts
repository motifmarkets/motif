/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from 'src/adi/internal-api';
import {
    AccumulationIntervalHistorySequenceSeries,
    CloseIntervalHistorySequenceSeries,
    CurrentRepeatableExactHistorySequenceSeries,
    HistorySequencer,
    IntervalHistorySequencer,
    LastIntervalHistorySequenceSeries,
    LitIvemIdPriceVolumeSequenceHistory,
    OhlcIntervalHistorySequenceSeries,
    RepeatableExactHistorySequencer,
    SymbolsService
} from 'src/core/internal-api';
import {
    HistorySequencer as HistorySequencerApi,
    HistorySequencerSvc,
    IntervalHistorySequencer as IntervalHistorySequencerApi,
    LitIvemId as LitIvemIdApi,
    RepeatableExactHistorySequencer as RepeatableExactHistorySequencerApi
} from '../../../api/extension-api';
import { HistorySequencerImplementation } from '../../exposed/core/history-sequencer/history-sequencer-implementation';
import {
    AccumulationIntervalHistorySequenceSeriesImplementation,
    CloseIntervalHistorySequenceSeriesImplementation,
    CurrentRepeatableExactHistorySequenceSeriesImplementation,
    IntervalHistorySequencerImplementation,
    LastIntervalHistorySequenceSeriesImplementation,
    LitIvemIdImplementation,
    LitIvemIdPriceVolumeSequenceHistoryImplementation,
    OhlcIntervalHistorySequenceSeriesImplementation,
    RepeatableExactHistorySequencerImplementation
} from '../../exposed/internal-api';

export class HistorySequencerSvcImplementation implements HistorySequencerSvc {
    constructor(private readonly _adiService: AdiService, private readonly _symbolsService: SymbolsService) { }

    createIntervalHistorySequencer(): IntervalHistorySequencerApi {
        const actual = new IntervalHistorySequencer();
        return IntervalHistorySequencerImplementation.toApi(actual);
    }

    createRepeatableExactHistorySequencer(): RepeatableExactHistorySequencerApi {
        const actual = new RepeatableExactHistorySequencer();
        return RepeatableExactHistorySequencerImplementation.toApi(actual);
    }

    createOhlcIntervalHistorySequenceSeries(sequencer: IntervalHistorySequencerApi) {
        const actualSequencer = IntervalHistorySequencerImplementation.fromApi(sequencer);
        const actual = new OhlcIntervalHistorySequenceSeries(actualSequencer);
        return OhlcIntervalHistorySequenceSeriesImplementation.toApi(actual);
    }

    createCloseIntervalHistorySequenceSeries(sequencer: IntervalHistorySequencerApi) {
        const actualSequencer = IntervalHistorySequencerImplementation.fromApi(sequencer);
        const actual = new CloseIntervalHistorySequenceSeries(actualSequencer);
        return CloseIntervalHistorySequenceSeriesImplementation.toApi(actual);
    }

    createLastIntervalHistorySequenceSeries(sequencer: IntervalHistorySequencerApi) {
        const actualSequencer = IntervalHistorySequencerImplementation.fromApi(sequencer);
        const actual = new LastIntervalHistorySequenceSeries(actualSequencer);
        return LastIntervalHistorySequenceSeriesImplementation.toApi(actual);
    }

    createAccumulationIntervalHistorySequenceSeries(sequencer: IntervalHistorySequencerApi) {
        const actualSequencer = IntervalHistorySequencerImplementation.fromApi(sequencer);
        const actual = new AccumulationIntervalHistorySequenceSeries(actualSequencer);
        return AccumulationIntervalHistorySequenceSeriesImplementation.toApi(actual);
    }

    createCurrentRepeatableExactHistorySequenceSeries(sequencer: RepeatableExactHistorySequencerApi) {
        const actualSequencer = RepeatableExactHistorySequencerImplementation.fromApi(sequencer);
        const actual = new CurrentRepeatableExactHistorySequenceSeries(actualSequencer);
        return CurrentRepeatableExactHistorySequenceSeriesImplementation.toApi(actual);
    }

    createLitIvemIdPriceVolumeSequenceHistory(litIvemId: LitIvemIdApi) {
        const actualLitIvemId = LitIvemIdImplementation.fromApi(litIvemId);
        const actual = new LitIvemIdPriceVolumeSequenceHistory(this._symbolsService, this._adiService, actualLitIvemId);
        return LitIvemIdPriceVolumeSequenceHistoryImplementation.toApi(actual);
    }

    typeToJsonValue(value: HistorySequencerApi.TypeEnum): string {
        const typeId = HistorySequencerImplementation.TypeId.fromApi(value);
        return HistorySequencer.Type.idToJsonValue(typeId);
    }

    typeFromJsonValue(value: string): HistorySequencerApi.TypeEnum | undefined {
        const typeId = HistorySequencer.Type.tryJsonValueToId(value as HistorySequencer.Type.JsonValue);
        if (typeId === undefined) {
            return undefined;
        } else {
            return HistorySequencerImplementation.TypeId.toApi(typeId);
        }
    }
}
