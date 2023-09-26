/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { OrderTimeInForce, OrderTimeInForceHandle } from '../../exposed/extension-api';

/** @public */
export interface OrderTimeInForceSvc {
    toName(id: OrderTimeInForce): string;
    fromName(name: string): OrderTimeInForce | undefined;
    toDisplay(id: OrderTimeInForce): string;

    toHandle(id: OrderTimeInForce): OrderTimeInForceHandle;
    fromHandle(handle: OrderTimeInForceHandle): OrderTimeInForce | undefined;

    handleToName(handle: OrderTimeInForceHandle): string;
    handleFromName(name: string): OrderTimeInForceHandle | undefined;
    handleToDisplay(handle: OrderTimeInForceHandle): string;
}
