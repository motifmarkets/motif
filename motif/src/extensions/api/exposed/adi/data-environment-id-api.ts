/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

/** @public */
export const enum DataEnvironmentIdEnum {
    Production = 'Production',
    DelayedProduction = 'DelayedProduction',
    Demo = 'Demo',
    Sample = 'Sample',
}

/** @public */
export type DataEnvironmentId = keyof typeof DataEnvironmentIdEnum;
