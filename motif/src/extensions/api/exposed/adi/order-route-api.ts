/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Json } from '../sys/extension-api';
import { MarketId, MarketIdHandle } from './market-id-api';
import { OrderRouteAlgorithm, OrderRouteAlgorithmHandle } from './order-route-algorithm-api';
import { OrderExtendedSide, OrderExtendedSideHandle } from './order-extended-side-api';
import { OrderTimeInForce, OrderTimeInForceHandle } from './order-time-in-force-api';
import { OrderType, OrderTypeHandle } from './order-type-api';

/** @public */
export interface OrderRoute {
    readonly algorithm: OrderRouteAlgorithm;
    readonly algorithmHandle: OrderRouteAlgorithmHandle;

    readonly code: string;
    readonly name: string;
    readonly display: string;

    createCopy(): OrderRoute;
    toJson(): Json;

    getBestLitMarketId(): MarketId;
    getAllowedOrderTypes(): OrderType[];
    isOrderTypeAllowed(orderType: OrderType): boolean;
    getAllowedOrderExtendedSides(): OrderExtendedSide[];
    isOrderExtendedSideAllowed(side: OrderExtendedSide): boolean;
    isQuantityAllowed(value: number): boolean;
    getAllowedTimeInForcesForOrderType(orderType: OrderType): OrderTimeInForce[];
    isTimeInForceForOrderTypeAllowed(orderType: OrderType, orderTimeInForce: OrderTimeInForce): boolean;

    getBestLitMarketIdHandle(): MarketIdHandle;
    getAllowedOrderTypeHandles(): readonly OrderTypeHandle[];
    isOrderTypeHandleAllowed(handle: OrderTypeHandle): boolean;
    getAllowedOrderExtendedSideHandles(): readonly OrderExtendedSideHandle[];
    isOrderExtendedSideHandleAllowed(handle: OrderExtendedSideHandle): boolean;
    getAllowedTimeInForcesForOrderTypeHandle(handle: OrderTypeHandle): readonly OrderTimeInForceHandle[];
    isTimeInForceForOrderTypeHandleAllowed(orderTypeHandle: OrderTypeHandle, orderTimeInForceHandle: OrderTimeInForceHandle): boolean;
}
