/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness } from '@motifmarkets/motif-core';
import { Badness as BadnessApi, BadnessSvc } from '../../../api/extension-api';
import { BadnessImplementation, CorrectnessImplementation } from '../../exposed/internal-api';

export class BadnessSvcImplementation implements BadnessSvc {
    create(reason: BadnessApi.ReasonEnum, reasonExtra: string): BadnessApi {
        const reasonId = BadnessImplementation.ReasonId.fromApi(reason);
        const badness: Badness = {
            reasonId,
            reasonExtra,
        };
        return BadnessImplementation.toApi(badness);
    }

    createCopy(badness: BadnessApi) {
        const actual = BadnessImplementation.fromApi(badness);
        const copy = Badness.createCopy(actual);
        return BadnessImplementation.toApi(copy);
    }

    createNotBad() {
        const badness = Badness.createCopy(Badness.notBad);
        return BadnessImplementation.toApi(badness);
    }

    createInactive() {
        const badness = Badness.createCopy(Badness.inactive);
        return BadnessImplementation.toApi(badness);
    }

    createCustomUsable(text: string): BadnessApi {
        const badness: Badness = {
            reasonId: Badness.ReasonId.Custom_Usable,
            reasonExtra: text,
        };
        return BadnessImplementation.toApi(badness);
    }

    createCustomSuspect(text: string): BadnessApi {
        const badness: Badness = {
            reasonId: Badness.ReasonId.Custom_Suspect,
            reasonExtra: text,
        };
        return BadnessImplementation.toApi(badness);
    }

    createCustomError(text: string): BadnessApi {
        const badness: Badness = {
            reasonId: Badness.ReasonId.Custom_Error,
            reasonExtra: text,
        };
        return BadnessImplementation.toApi(badness);
    }

    getCorrectness(badness: BadnessApi) {
        const actual = BadnessImplementation.fromApi(badness);
        const correctnessId = Badness.getCorrectnessId(actual);
        return CorrectnessImplementation.toApi(correctnessId);
    }

    isGood(badness: BadnessApi) {
        const actual = BadnessImplementation.fromApi(badness);
        return Badness.isGood(actual);
    }

    isUsable(badness: BadnessApi) {
        const actual = BadnessImplementation.fromApi(badness);
        return Badness.isUsable(actual);
    }

    isUnusable(badness: BadnessApi) {
        const actual = BadnessImplementation.fromApi(badness);
        return Badness.isUnusable(actual);
    }

    isSuspect(badness: BadnessApi) {
        const actual = BadnessImplementation.fromApi(badness);
        return Badness.isSuspect(actual);
    }

    isError(badness: BadnessApi) {
        const actual = BadnessImplementation.fromApi(badness);
        return Badness.isError(actual);
    }

    isEqual(left: BadnessApi, right: BadnessApi) {
        const actualLeft = BadnessImplementation.fromApi(left);
        const actualRight = BadnessImplementation.fromApi(right);
        return Badness.isEqual(actualLeft, actualRight);
    }

    generateText(badness: BadnessApi) {
        const actual = BadnessImplementation.fromApi(badness);
        return Badness.generateText(actual);
    }

    reasonToDisplay(reasonApi: BadnessApi.Reason): string {
        const reasonId = BadnessImplementation.ReasonId.fromApi(reasonApi);
        return Badness.Reason.idToDisplay(reasonId);
    }
}
