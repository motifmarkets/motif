/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IntervalHistorySequencer } from '../../exposed/extension-api';

/** @public */
export interface IntervalHistorySequencerSvc {
    unitToJsonValue(value: IntervalHistorySequencer.UnitEnum): string;
    unitFromJsonValue(value: string): IntervalHistorySequencer.UnitEnum | undefined;
}
