/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Handle } from '../sys/extension-api';

/** @public */
export const enum ExchangeIdEnum {
    Asx = 'Asx',
    Cxa = 'Cxa',
    Myx = 'Myx',
    Nzx = 'Nzx',
    Ptx = 'Ptx',
    Fnsx = 'Fnsx',
}

/** @public */
export type ExchangeId = keyof typeof ExchangeIdEnum;

/** @public */
export type ExchangeIdHandle = Handle;
