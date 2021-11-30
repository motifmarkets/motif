/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    IntervalHistorySequencer
} from '@motifmarkets/motif-core';
import {
    IntervalHistorySequencer as IntervalHistorySequencerApi,
    IntervalHistorySequencerSvc
} from '../../../api/extension-api';
import {
    IntervalHistorySequencerImplementation
} from '../../exposed/internal-api';

export class IntervalHistorySequencerSvcImplementation implements IntervalHistorySequencerSvc {
    unitToJsonValue(value: IntervalHistorySequencerApi.UnitEnum): string {
        const typeId = IntervalHistorySequencerImplementation.UnitId.fromApi(value);
        return IntervalHistorySequencer.Unit.idToJsonValue(typeId);
    }

    unitFromJsonValue(value: string): IntervalHistorySequencerApi.UnitEnum | undefined {
        const typeId = IntervalHistorySequencer.Unit.tryJsonValueToId(value as IntervalHistorySequencer.Unit.JsonValue);
        if (typeId === undefined) {
            return undefined;
        } else {
            return IntervalHistorySequencerImplementation.UnitId.toApi(typeId);
        }
    }
}
