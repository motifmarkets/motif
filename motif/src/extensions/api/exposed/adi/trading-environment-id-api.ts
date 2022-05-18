/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

/** @public */
export const enum TradingEnvironmentIdEnum {
    Production = 'Production',
    Demo = 'Demo',
}

/** @public */
export type TradingEnvironmentId = keyof typeof TradingEnvironmentIdEnum;
