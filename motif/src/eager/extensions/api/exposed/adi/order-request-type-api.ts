/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Handle } from '../sys/extension-api';

/** @public */
export const enum OrderRequestTypeEnum {
    Place = 'Place',
    Amend = 'Amend',
    Cancel = 'Cancel',
    Move = 'Move',
}

/** @public */
export type OrderRequestType = keyof typeof OrderRequestTypeEnum;

/** @public */
export type OrderRequestTypeHandle = Handle;
