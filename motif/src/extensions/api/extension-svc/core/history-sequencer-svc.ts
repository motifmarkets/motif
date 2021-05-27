/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AccumulationIntervalHistorySequenceSeries,
    CloseIntervalHistorySequenceSeries,
    CurrentRepeatableExactHistorySequenceSeries,
    HistorySequencer,
    IntervalHistorySequencer,
    LastIntervalHistorySequenceSeries,
    LitIvemId,
    LitIvemIdPriceVolumeSequenceHistory,
    OhlcIntervalHistorySequenceSeries,
    RepeatableExactHistorySequencer
} from '../../exposed/extension-api';

/** @public */
export interface HistorySequencerSvc {
    createIntervalHistorySequencer(): IntervalHistorySequencer;
    createRepeatableExactHistorySequencer(): RepeatableExactHistorySequencer;

    createOhlcIntervalHistorySequenceSeries(sequencer: IntervalHistorySequencer): OhlcIntervalHistorySequenceSeries;
    createCloseIntervalHistorySequenceSeries(sequencer: IntervalHistorySequencer): CloseIntervalHistorySequenceSeries;
    createLastIntervalHistorySequenceSeries(sequencer: IntervalHistorySequencer): LastIntervalHistorySequenceSeries;
    createAccumulationIntervalHistorySequenceSeries(sequencer: IntervalHistorySequencer): AccumulationIntervalHistorySequenceSeries;
    createCurrentRepeatableExactHistorySequenceSeries(
        sequencer: RepeatableExactHistorySequencer
    ): CurrentRepeatableExactHistorySequenceSeries;
    createLitIvemIdPriceVolumeSequenceHistory(litIvemId: LitIvemId): LitIvemIdPriceVolumeSequenceHistory;

    typeToJsonValue(value: HistorySequencer.TypeEnum): string;
    typeFromJsonValue(value: string): HistorySequencer.TypeEnum | undefined;
}
