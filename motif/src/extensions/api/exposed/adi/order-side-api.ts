/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Handle } from '../sys/extension-api';

/** @public */
export const enum OrderSideEnum {
    Buy = 'Buy',
    Sell = 'Sell',
    IntraDayShortSell = 'IntraDayShortSell',
    RegulatedShortSell = 'RegulatedShortSell',
    ProprietaryShortSell = 'ProprietaryShortSell',
    ProprietaryDayTrade ='ProprietaryDayTrade',
}

/** @public */
export type OrderSide = keyof typeof OrderSideEnum;

/** @public */
export type OrderSideHandle = Handle;
