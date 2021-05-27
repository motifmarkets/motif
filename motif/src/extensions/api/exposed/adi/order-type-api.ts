/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Handle } from '../sys/extension-api';

/** @public */
export const enum OrderTypeEnum {
    Limit = 'Limit',
    Best = 'Best',
    Market = 'Market',
    MarketToLimit = 'MarketToLimit',
}

/** @public */
export type OrderType = keyof typeof OrderTypeEnum;

/** @public */
export type OrderTypeHandle = Handle;
