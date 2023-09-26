/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Handle } from '../sys/extension-api';

/** @public */
export const enum CurrencyIdEnum {
    Aud = 'Aud',
    Usd = 'Usd',
    Myr = 'Myr',
}

/** @public */
export type CurrencyId = keyof typeof CurrencyIdEnum;

/** @public */
export type CurrencyIdHandle = Handle;
