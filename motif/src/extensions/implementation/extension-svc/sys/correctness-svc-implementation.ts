/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Correctness } from '@motifmarkets/motif-core';
import { Correctness as CorrectnessApi, CorrectnessSvc } from '../../../api/extension-api';
import { CorrectnessImplementation } from '../../exposed/internal-api';

export class CorrectnessSvcImplementation implements CorrectnessSvc {
    isUsable(correctness: CorrectnessApi) {
        return Correctness.idIsUsable(CorrectnessImplementation.fromApi(correctness));
    }

    isUnusable(correctness: CorrectnessApi) {
        return Correctness.idIsUnusable(CorrectnessImplementation.fromApi(correctness));
    }

    isIncubated(correctness: CorrectnessApi) {
        return Correctness.idIsIncubated(CorrectnessImplementation.fromApi(correctness));
    }
}
