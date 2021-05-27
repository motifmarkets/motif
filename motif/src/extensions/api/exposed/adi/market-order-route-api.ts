/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MarketId, MarketIdHandle } from './market-id-api';
import { OrderRoute } from './order-route-api';

/** @public */
export interface MarketOrderRoute extends OrderRoute {
    readonly marketId: MarketId;
    readonly marketIdHandle: MarketIdHandle;

    isEqualTo(other: MarketOrderRoute): boolean;
}
