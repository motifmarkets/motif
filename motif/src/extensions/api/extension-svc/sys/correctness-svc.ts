/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Correctness } from '../../exposed/extension-api';

/** @public */
export interface CorrectnessSvc {
    isUsable(correctness: Correctness): boolean;
    isUnusable(correctness: Correctness): boolean;
    isIncubated(correctness: Correctness): boolean;
}
