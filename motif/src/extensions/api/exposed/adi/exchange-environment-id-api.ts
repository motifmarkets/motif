/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

/** @public */
export const enum ExchangeEnvironmentIdEnum {
    Production = 'Production',
    DelayedProduction = 'DelayedProduction',
    Demo = 'Demo',
}

/** @public */
export type ExchangeEnvironmentId = keyof typeof ExchangeEnvironmentIdEnum;
