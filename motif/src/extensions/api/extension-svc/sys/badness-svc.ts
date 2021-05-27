/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness, Correctness } from '../../exposed/extension-api';

/** @public */
export interface BadnessSvc {
    create(reason: Badness.Reason, reasonExtra: string): Badness;
    createCopy(badness: Badness): Badness;
    createNotBad(): Badness;
    createInactive(): Badness;
    createCustomUsable(text: string): Badness;
    createCustomSuspect(text: string): Badness;
    createCustomError(text: string): Badness;
    getCorrectness(badness: Badness): Correctness;
    isGood(badness: Badness): boolean;
    isUsable(badness: Badness): boolean;
    isUnusable(badness: Badness): boolean;
    isSuspect(badness: Badness): boolean;
    isError(badness: Badness): boolean;
    isEqual(left: Badness, right: Badness): boolean;
    generateText(badness: Badness): string;
    reasonToDisplay(reason: Badness.Reason): string;
}
