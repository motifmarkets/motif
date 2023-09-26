/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { OrderExtendedSide, OrderExtendedSideHandle } from '../../exposed/extension-api';

/** @public */
export interface OrderExtendedSideSvc {
    toName(id: OrderExtendedSide): string;
    fromName(name: string): OrderExtendedSide | undefined;
    toDisplay(id: OrderExtendedSide): string;

    toHandle(id: OrderExtendedSide): OrderExtendedSideHandle;
    fromHandle(handle: OrderExtendedSideHandle): OrderExtendedSide | undefined;

    handleToName(handle: OrderExtendedSideHandle): string;
    handleFromName(name: string): OrderExtendedSideHandle | undefined;
    handleToDisplay(handle: OrderExtendedSideHandle): string;
}
