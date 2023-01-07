/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { OrderRoute } from '@motifmarkets/motif-core';
import {
    JsonElement as JsonElementApi,
    OrderExtendedSide as OrderExtendedSideApi,
    OrderExtendedSideHandle as OrderExtendedSideHandleApi,
    OrderRoute as OrderRouteApi,
    OrderTimeInForce as OrderTimeInForceApi,
    OrderTimeInForceHandle as OrderTimeInForceHandleApi,
    OrderType as OrderTypeApi,
    OrderTypeHandle as OrderTypeHandleApi
} from '../../../api/extension-api';
import { JsonElementImplementation } from '../sys/internal-api';
import { MarketIdImplementation } from './market-id-api-implementation';
import { OrderExtendedSideImplementation } from './order-extended-side-api-implementation';
import { OrderRouteAlgorithmImplementation } from './order-route-algorithm-implementation';
import { OrderTimeInForceImplementation } from './order-time-in-force-api-implementation';
import { OrderTypeImplementation } from './order-type-api-implementation';

export class OrderRouteImplementation implements OrderRouteApi {
    constructor(private readonly _actual: OrderRoute) { }

    get actual() { return this._actual; }

    get algorithm() { return OrderRouteAlgorithmImplementation.toApi(this._actual.algorithmId); }
    get algorithmHandle() { return this._actual.algorithmId; }

    get code() { return this._actual.code; }
    get name() { return this._actual.name; }
    get display() { return this._actual.display; }

    createCopy() {
        const orderRoute = this._actual.createCopy();
        return OrderRouteImplementation.toApi(orderRoute);
    }

    saveToJson(elementApi: JsonElementApi): void {
        const element = JsonElementImplementation.fromApi(elementApi);
        this._actual.saveToJson(element);
    }

    getBestLitMarketId() {
        const marketId = this._actual.getBestLitMarketId();
        return MarketIdImplementation.toApi(marketId);
    }

    getAllowedOrderTypes() {
        const orderTypeIds = this._actual.getAllowedOrderTypeIds();
        return OrderTypeImplementation.arrayToApi(orderTypeIds);
    }

    isOrderTypeAllowed(orderType: OrderTypeApi) {
        const orderTypeId = OrderTypeImplementation.fromApi(orderType);
        return this._actual.isOrderTypeAllowed(orderTypeId);
    }

    getAllowedOrderExtendedSides() {
        const orderExtendedSideIds = this._actual.getAllowedOrderExtendedSideIds();
        return OrderExtendedSideImplementation.arrayToApi(orderExtendedSideIds);
    }

    isOrderExtendedSideAllowed(orderExtendedSide: OrderExtendedSideApi) {
        const orderExtendedSideId = OrderExtendedSideImplementation.fromApi(orderExtendedSide);
        return this._actual.isSideAllowed(orderExtendedSideId);
    }

    isQuantityAllowed(value: number) {
        return this._actual.isQuantityAllowed(value);
    }

    getAllowedTimeInForcesForOrderType(orderType: OrderTypeApi) {
        const orderTypeId = OrderTypeImplementation.fromApi(orderType);
        const timeInForceIds = this._actual.getAllowedTimeInForceIdsForOrderType(orderTypeId);
        return OrderTimeInForceImplementation.arrayToApi(timeInForceIds);
    }

    isTimeInForceForOrderTypeAllowed(orderType: OrderTypeApi, orderTimeInForce: OrderTimeInForceApi) {
        const orderTypeId = OrderTypeImplementation.fromApi(orderType);
        const timeInForceId = OrderTimeInForceImplementation.fromApi(orderTimeInForce);
        return this._actual.isTimeInForceForOrderTypeAllowed(orderTypeId, timeInForceId);
    }

    getBestLitMarketIdHandle() {
        return this._actual.getBestLitMarketId();
    }

    getAllowedOrderTypeHandles() {
        return this._actual.getAllowedOrderTypeIds();
    }

    isOrderTypeHandleAllowed(orderTypeHandle: OrderTypeHandleApi) {
        return this._actual.isOrderTypeAllowed(orderTypeHandle);
    }

    getAllowedOrderExtendedSideHandles() {
        return this._actual.getAllowedOrderExtendedSideIds();
    }

    isOrderExtendedSideHandleAllowed(orderExtendedSideHandle: OrderExtendedSideHandleApi) {
        return this._actual.isSideAllowed(orderExtendedSideHandle);
    }

    getAllowedTimeInForcesForOrderTypeHandle(orderTypeHandle: OrderTypeHandleApi) {
        return this._actual.getAllowedTimeInForceIdsForOrderType(orderTypeHandle);
    }

    isTimeInForceForOrderTypeHandleAllowed(orderTypeHandle: OrderTypeHandleApi, orderTimeInForceHandle: OrderTimeInForceHandleApi) {
        return this._actual.isTimeInForceForOrderTypeAllowed(orderTypeHandle, orderTimeInForceHandle);
    }
}

export namespace OrderRouteImplementation {
    export function toApi(actual: OrderRoute) {
        return new OrderRouteImplementation(actual);
    }

    export function fromApi(orderRouteApi: OrderRouteApi) {
        const implementation = orderRouteApi as OrderRouteImplementation;
        return implementation.actual;
    }

    export function arrayToApi(value: readonly OrderRoute[]): OrderRouteApi[] {
        const count = value.length;
        const result = new Array<OrderRouteApi>(count);
        for (let i = 0; i < count; i++) {
            result[i] = toApi(value[i]);
        }
        return result;
    }

    export function arrayFromApi(value: readonly OrderRouteApi[]): OrderRoute[] {
        const count = value.length;
        const result = new Array<OrderRoute>(count);
        for (let i = 0; i < count; i++) {
            result[i] = fromApi(value[i]);
        }
        return result;
    }
}
