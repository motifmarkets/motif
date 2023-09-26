/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Handle } from '../sys/extension-api';

/** @public */
export const enum OrderRouteAlgorithmEnum {
    Market = 'Market',
}

/** @public */
export type OrderRouteAlgorithm = keyof typeof OrderRouteAlgorithmEnum;

/** @public */
export type OrderRouteAlgorithmHandle = Handle;

