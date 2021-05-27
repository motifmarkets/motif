/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ExchangeId,
    ExchangeIdHandle,
    FeedId,
    FeedIdHandle,
    MarketId,
    MarketIdHandle,
    OrderSide,
    OrderSideHandle,
    OrderTimeInForce,
    OrderTimeInForceHandle,
    OrderType,
    OrderTypeHandle
} from '../../exposed/extension-api';

/** @public */
export interface MarketIdSvc {
    isLit(id: MarketId): boolean;
    isRoutable(id: MarketId): boolean;
    toName(id: MarketId): string;
    toJsonValue(id: MarketId): string;
    fromJsonValue(id: string): MarketId | undefined;
    toDisplay(id: MarketId): string;
    fromDisplay(display: string): MarketId | undefined;
    toFeedId(id: MarketId): FeedId;
    toExchangeId(id: MarketId): ExchangeId;
    toSupportedExchangeIds(id: MarketId): ExchangeId[];
    toBestLitId(id: MarketId): MarketId;
    toAllowedOrderTypes(id: MarketId): OrderType[];
    toAllowedOrderTimeInForces(id: MarketId): OrderTimeInForce[];
    toAllowedOrderSides(id: MarketId): OrderSide[];

    toHandle(id: MarketId): MarketIdHandle;
    fromHandle(handle: MarketIdHandle): MarketId | undefined;

    handleIsLit(handle: MarketIdHandle): boolean;
    handleIsRoutable(handle: MarketIdHandle): boolean;
    handleToName(handle: MarketIdHandle): string;
    handleToDisplay(handle: MarketIdHandle): string;
    handleFromDisplay(display: string): MarketIdHandle | undefined;
    handleToFeedId(handle: MarketIdHandle): FeedIdHandle;
    handleToExchangeId(handle: MarketIdHandle): ExchangeIdHandle;
    handleToSupportedExchangeIds(handle: MarketIdHandle): readonly ExchangeIdHandle[];
    handleToBestLitId(handle: MarketIdHandle): MarketIdHandle;
    handleToAllowedOrderTypes(handle: MarketIdHandle): readonly OrderTypeHandle[];
    handleToAllowedOrderTimeInForces(handle: MarketIdHandle): readonly OrderTimeInForceHandle[];
    handleToAllowedOrderTimeInForcesForOrderType(marketIdHandle: MarketIdHandle,
        orderTypeHandle: OrderTypeHandle
    ): readonly OrderTimeInForceHandle[];
    handleToAllowedOrderSides(handle: MarketIdHandle): readonly OrderSideHandle[];
    handleAreArraysUniquelyEqual(left: readonly MarketIdHandle[], right: readonly MarketIdHandle[]): boolean;
}
