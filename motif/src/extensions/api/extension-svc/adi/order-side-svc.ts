/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { OrderSide, OrderSideHandle } from '../../exposed/extension-api';

/** @public */
export interface OrderSideSvc {
    toName(id: OrderSide): string;
    fromName(name: string): OrderSide | undefined;
    toDisplay(id: OrderSide): string;

    toHandle(id: OrderSide): OrderSideHandle;
    fromHandle(handle: OrderSideHandle): OrderSide | undefined;

    handleToName(handle: OrderSideHandle): string;
    handleFromName(name: string): OrderSideHandle | undefined;
    handleToDisplay(handle: OrderSideHandle): string;
}
