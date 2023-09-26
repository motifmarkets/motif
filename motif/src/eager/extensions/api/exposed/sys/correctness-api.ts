/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

/** @public */
export const enum CorrectnessEnum {
    Good = 'Good',
    Usable = 'Usable',
    Suspect = 'Suspect',
    Error = 'Error',
}

/** @public */
export type Correctness = keyof typeof CorrectnessEnum;
