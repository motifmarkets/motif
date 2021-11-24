/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MarketInfo } from 'adi-internal-api';
import {
    MarketId as MarketIdApi,
    MarketIdHandle as MarketIdHandleApi,
    MarketIdSvc,
    OrderType as OrderTypeApi,
    OrderTypeHandle as OrderTypeHandleApi
} from '../../../api/extension-api';
import {
    ExchangeIdImplementation,
    FeedIdImplementation,
    MarketIdImplementation,
    OrderSideImplementation,
    OrderTimeInForceImplementation,
    OrderTypeImplementation
} from '../../exposed/internal-api';

export class MarketIdSvcImplementation implements MarketIdSvc {
    public isLit(id: MarketIdApi) {
        const marketId = MarketIdImplementation.fromApi(id);
        return MarketInfo.idIsLit(marketId);
    }

    public isRoutable(id: MarketIdApi) {
        const marketId = MarketIdImplementation.fromApi(id);
        return MarketInfo.idToIsRoutable(marketId);
    }

    public toName(id: MarketIdApi) {
        const marketId = MarketIdImplementation.fromApi(id);
        return MarketInfo.idToName(marketId);
    }

    public toJsonValue(id: MarketIdApi): string {
        const marketId = MarketIdImplementation.fromApi(id);
        return MarketInfo.idToJsonValue(marketId);
    }

    public fromJsonValue(jsonValue: string): MarketIdApi | undefined {
        const marketId = MarketInfo.tryJsonValueToId(jsonValue);
        if (marketId === undefined) {
            return undefined;
        } else {
            return MarketIdImplementation.toApi(marketId);
        }
    }

    public toDisplay(id: MarketIdApi) {
        const marketId = MarketIdImplementation.fromApi(id);
        return MarketInfo.idToDisplay(marketId);
    }

    public fromDisplay(display: string) {
        const marketId = MarketInfo.tryDisplayToId(display);
        if (marketId === undefined) {
            return undefined;
        } else {
            return MarketIdImplementation.toApi(marketId);
        }
    }

    public toFeedId(id: MarketIdApi) {
        const marketId = MarketIdImplementation.fromApi(id);
        const feedId = MarketInfo.idToFeedId(marketId);
        return FeedIdImplementation.toApi(feedId);
    }

    public toExchangeId(id: MarketIdApi) {
        const marketId = MarketIdImplementation.fromApi(id);
        const exchangeId = MarketInfo.idToExchangeId(marketId);
        return ExchangeIdImplementation.toApi(exchangeId);
    }

    public toSupportedExchangeIds(id: MarketIdApi) {
        const marketId = MarketIdImplementation.fromApi(id);
        const exchangeIds = MarketInfo.idToSupportedExchanges(marketId);
        return ExchangeIdImplementation.arrayToApi(exchangeIds);
    }

    public toBestLitId(id: MarketIdApi) {
        const marketId = MarketIdImplementation.fromApi(id);
        const bestListId = MarketInfo.idToBestLitId(marketId);
        return MarketIdImplementation.toApi(bestListId);
    }

    public toAllowedOrderTypes(id: MarketIdApi) {
        const marketId = MarketIdImplementation.fromApi(id);
        const allowedOrderTypeIds = MarketInfo.getAllowedOrderTypeArray(marketId);
        return OrderTypeImplementation.arrayToApi(allowedOrderTypeIds);
    }

    public toAllowedOrderTimeInForces(id: MarketIdApi) {
        const marketId = MarketIdImplementation.fromApi(id);
        const allowedTimeinForceIds = MarketInfo.getAllowedTimeInForceIdArray(marketId);
        return OrderTimeInForceImplementation.arrayToApi(allowedTimeinForceIds);
    }

    public toAllowedOrderTimeInForcesForOrderType(id: MarketIdApi, orderType: OrderTypeApi) {
        const marketId = MarketIdImplementation.fromApi(id);
        const orderTypeId = OrderTypeImplementation.fromApi(orderType);
        const allowedTimeinForceIds = MarketInfo.getAllowedTimeInForceIdArrayForOrderType(marketId, orderTypeId);
        return OrderTimeInForceImplementation.arrayToApi(allowedTimeinForceIds);
    }

    public toAllowedOrderSides(id: MarketIdApi) {
        const marketId = MarketIdImplementation.fromApi(id);
        const allowedSideIds = MarketInfo.GetAllowedSideIdArray(marketId);
        return OrderSideImplementation.arrayToApi(allowedSideIds);
    }

    public toHandle(id: MarketIdApi) {
        return MarketIdImplementation.fromApi(id);
    }

    public fromHandle(handle: MarketIdHandleApi) {
        return MarketIdImplementation.toApi(handle);
    }

    public handleIsLit(handle: MarketIdHandleApi) {
        return MarketInfo.idIsLit(handle);
    }

    public handleIsRoutable(handle: MarketIdHandleApi) {
        return MarketInfo.idToIsRoutable(handle);
    }

    public handleToName(handle: MarketIdHandleApi) {
        return MarketInfo.idToName(handle);
    }

    public handleToDisplay(handle: MarketIdHandleApi) {
        return MarketInfo.idToDisplay(handle);
    }

    public handleFromDisplay(display: string) {
        return MarketInfo.tryDisplayToId(display);
    }

    public handleToFeedId(handle: MarketIdHandleApi) {
        return MarketInfo.idToFeedId(handle);
    }

    public handleToExchangeId(handle: MarketIdHandleApi) {
        return MarketInfo.idToExchangeId(handle);
    }

    public handleToSupportedExchangeIds(handle: MarketIdHandleApi) {
        return MarketInfo.idToSupportedExchanges(handle);
    }

    public handleToBestLitId(handle: MarketIdHandleApi) {
        return MarketInfo.idToBestLitId(handle);
    }

    public handleToAllowedOrderTypes(handle: MarketIdHandleApi) {
        return MarketInfo.getAllowedOrderTypeArray(handle);
    }

    public handleToAllowedOrderTimeInForces(handle: MarketIdHandleApi) {
        return MarketInfo.getAllowedTimeInForceIdArray(handle);
    }

    public handleToAllowedOrderTimeInForcesForOrderType(marketIdHandle: MarketIdHandleApi, orderTypeHandle: OrderTypeHandleApi) {
        return MarketInfo.getAllowedTimeInForceIdArrayForOrderType(marketIdHandle, orderTypeHandle);
    }

    public handleToAllowedOrderSides(handle: MarketIdHandleApi) {
        return MarketInfo.GetAllowedSideIdArray(handle);
    }

    public handleAreArraysUniquelyEqual(left: readonly MarketIdHandleApi[], right: readonly MarketIdHandleApi[]) {
        return MarketInfo.uniqueElementIdArraysAreSame(left, right);
    }
}
