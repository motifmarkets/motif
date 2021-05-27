/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ComparisonResult, Integer, Json, NotImplementedError, UnreachableCaseError } from 'src/sys/internal-api';
import {
    MarketId,
    MarketInfo, OrderRouteAlgorithm, OrderRouteAlgorithmId,
    OrderTriggerType,
    OrderTriggerTypeId,
    OrderType, OrderTypeId,
    Side, SideId, TimeInForce, TimeInForceId
} from './data-types';

export abstract class OrderRoute {
    private _upperCode: string;
    private _upperDisplay: string;

    constructor(private _algorithmId: OrderRouteAlgorithmId) { }

    get algorithmId() { return this._algorithmId; }

    get mapKey() { return this.name; }

    get upperCode() {
        if (this.upperCode === undefined) {
            this._upperCode = this.code.toUpperCase();
        }
        return this._upperCode;
    }
    get upperDisplay() {
        if (this.upperDisplay === undefined) {
            this._upperDisplay = this.display.toUpperCase();
        }
        return this._upperDisplay;
    }

    abstract get code(): string;
    abstract get name(): string;
    abstract get display(): string;

    abstract toJson(): OrderRoute.PersistJson;

    abstract createCopy(): OrderRoute;

    abstract getBestLitMarketId(): MarketId;

    abstract getAllowedOrderTypeIds(): readonly OrderTypeId[];
    abstract isOrderTypeAllowed(orderTypeId: OrderTypeId): boolean;

    abstract getAllowedSideIds(): readonly SideId[];
    abstract isSideAllowed(sideId: SideId): boolean;

    abstract getAllowedTriggerTypeIds(): readonly OrderTriggerTypeId[];

    abstract isQuantityAllowed(value: Integer): boolean;

    abstract getAllowedTimeInForceIdsForOrderType(orderTypeId: OrderTypeId): readonly TimeInForceId[];
    abstract isTimeInForceForOrderTypeAllowed(orderTypeId: OrderTypeId, timeInForceId: TimeInForceId): boolean;
}

export namespace OrderRoute {
    export const nameSeparator = '!';

    export interface PersistJson extends Json {
        algorithm: string;
    }

    export function tryCreateFromJson(value: PersistJson): OrderRoute | undefined {
        const algorithm = value.algorithm;
        if (algorithm === undefined) {
            return undefined;
        } else {
            const algorithmId = OrderRouteAlgorithm.tryJsonValueToId(algorithm);
            if (algorithmId === undefined) {
                return undefined;
            } else {
                switch (algorithmId) {
                    case OrderRouteAlgorithmId.Market:
                        return MarketOrderRoute.tryCreateFromMarketJson(value as MarketOrderRoute.PersistJson);
                    case OrderRouteAlgorithmId.BestMarket: return BestMarketOrderRoute.tryCreateFromJson(value);
                    case OrderRouteAlgorithmId.Fix: return FixOrderRoute.tryCreateFromJson(value);
                    default:
                        const neverAlgorithmId: never = algorithmId;
                        return undefined;
                }
            }
        }
    }

    export function isUndefinableEqual(left: OrderRoute | undefined, right: OrderRoute | undefined) {
        if (left === undefined) {
            return right === undefined;
        } else {
            if (right === undefined) {
                return false;
            } else {
                return isEqual(left, right);
            }
        }
    }

    export function isEqual(left: OrderRoute, right: OrderRoute) {
        if (left.algorithmId !== right.algorithmId) {
            return false;
        } else {
            switch (left.algorithmId) {
                case OrderRouteAlgorithmId.Market:
                    const marketLeft = left as MarketOrderRoute;
                    const marketRight = right as MarketOrderRoute;
                    return marketLeft.isEqual(marketRight);
                case OrderRouteAlgorithmId.BestMarket:
                    const bestMarketLeft = left as BestMarketOrderRoute;
                    const bestMarketRight = right as BestMarketOrderRoute;
                    return bestMarketLeft.isEqual(bestMarketRight);
                case OrderRouteAlgorithmId.Fix:
                    const fixLeft = left as FixOrderRoute;
                    const fixRight = right as FixOrderRoute;
                    return fixLeft.isEqual(fixRight);
                default:
                    throw new UnreachableCaseError('ORRIE396887', left.algorithmId);
            }
        }
    }

    export function compareByDisplayPriority(left: OrderRoute, right: OrderRoute) {
        const result = OrderRouteAlgorithm.compareId(left.algorithmId, right.algorithmId);
        if (result !== ComparisonResult.LeftEqualsRight) {
            return result;
        } else {
            switch (left.algorithmId) {
                case OrderRouteAlgorithmId.Market:
                    return MarketOrderRoute.compareMarketByDisplayPriority(left as MarketOrderRoute, right as MarketOrderRoute);
                case OrderRouteAlgorithmId.BestMarket:
                    return BestMarketOrderRoute.compareBestByDisplayPriority(left as BestMarketOrderRoute, right as BestMarketOrderRoute);
                case OrderRouteAlgorithmId.Fix:
                    return FixOrderRoute.compareFixByDisplayPriority(left as FixOrderRoute, right as FixOrderRoute);
                default:
                    throw new UnreachableCaseError('ORC393226887', left.algorithmId);
            }
        }
    }

    export function cloneArray(srcArray: readonly OrderRoute[]) {
        const result = new Array<OrderRoute>(srcArray.length);
        for (let i = 0; i < srcArray.length; i++) {
            result[i] = srcArray[i].createCopy();
        }
        return result;
    }

    export function arrayIncludes(array: readonly OrderRoute[], route: OrderRoute) {
        for (const element of array) {
            if (OrderRoute.isEqual(element, route)) {
                return true;
            }
        }
        return false;
    }

    export function isMarketRoute(route: OrderRoute): route is MarketOrderRoute {
        return route.algorithmId === OrderRouteAlgorithmId.Market;
    }
}

export class MarketOrderRoute extends OrderRoute {
    constructor(private _marketId: MarketId) {
        super(OrderRouteAlgorithmId.Market);
    }

    get marketId() { return this._marketId; }

    get code() {
        return MarketInfo.idToDefaultPscGlobalCode(this.marketId);
    }

    get name() {
        return OrderRouteAlgorithm.idToName(this.algorithmId) + OrderRoute.nameSeparator + MarketInfo.idToName(this.marketId);
    }

    get display() {
        return MarketInfo.idToDisplay(this.marketId);
    }

    toJson() {
        const result: MarketOrderRoute.PersistJson = {
            algorithm: OrderRouteAlgorithm.idToJsonValue(this.algorithmId),
            market: MarketInfo.idToJsonValue(this._marketId),
        } as const;
        return result;
    }

    isEqual(other: MarketOrderRoute) {
        return this.marketId === other.marketId;
    }

    createCopy() {
        return new MarketOrderRoute(this.marketId);
    }

    getBestLitMarketId() {
        return MarketInfo.idToBestLitId(this.marketId);
    }

    getAllowedOrderTypeIds() {
        return MarketInfo.getAllowedOrderTypeArray(this.marketId);
    }

    isOrderTypeAllowed(orderTypeId: OrderTypeId) {
        return MarketInfo.isOrderTypeAllowed(this.marketId, orderTypeId);
    }

    getAllowedSideIds() {
        return MarketInfo.GetAllowedSideIdArray(this.marketId);
    }

    isSideAllowed(sideId: SideId) {
        return MarketInfo.isSideAllowed(this.marketId, sideId);
    }

    getAllowedTriggerTypeIds() {
        return MarketInfo.GetAllowedOrderTriggerTypeIdArray(this.marketId);
    }

    isQuantityAllowed(value: Integer) {
        return MarketInfo.isQuantityAllowed(this.marketId, value);
    }

    getAllowedTimeInForceIdsForOrderType(orderTypeId: OrderTypeId) {
        return MarketInfo.getAllowedTimeInForceIdArrayForOrderType(this.marketId, orderTypeId);
    }

    isTimeInForceForOrderTypeAllowed(orderTypeId: OrderTypeId, timeInForceId: TimeInForceId) {
        return MarketInfo.isTimeInForceForOrderTypeAllowed(this.marketId, orderTypeId, timeInForceId);
    }
}

export namespace MarketOrderRoute {
    export interface PersistJson extends OrderRoute.PersistJson {
        market: string;
    }

    export function compareMarketByDisplayPriority(left: MarketOrderRoute, right: MarketOrderRoute) {
        return MarketInfo.compareDisplayPriority(left.marketId, right.marketId);
    }

    export function tryCreateFromMarketJson(value: PersistJson) {
        const market = value.market;
        if (market === undefined) {
            return undefined;
        } else {
            const marketId = MarketInfo.tryJsonValueToId(market);
            if (marketId === undefined) {
                return undefined;
            } else {
                return new MarketOrderRoute(marketId);
            }
        }
    }
}

export class BestMarketOrderRoute extends OrderRoute {
    constructor() {
        super(OrderRouteAlgorithmId.BestMarket);
    }

    get code() {
        return 'Best';
    }

    get name() {
        return OrderRouteAlgorithm.idToName(this.algorithmId);
    }

    get display() {
        return 'Best';
    }

    toJson() {
        const result: OrderRoute.PersistJson = {
            algorithm: OrderRouteAlgorithm.idToJsonValue(this.algorithmId),
        } as const;
        return result;
    }

    isEqual(other: BestMarketOrderRoute) {
        return true;
    }

    createCopy() {
        return new BestMarketOrderRoute();
    }

    getBestLitMarketId(): MarketId {
        throw new NotImplementedError('ORBMORGBLMI1654439');
    }

    getAllowedOrderTypeIds() {
        return OrderType.all;
    }

    isOrderTypeAllowed(orderTypeId: OrderTypeId) {
        return true; // not sure what else to do here
    }

    getAllowedSideIds() {
        return Side.all;
    }

    isSideAllowed(sideId: SideId) {
        return true;
    }

    isQuantityAllowed(value: Integer) {
        return true;
    }

    getAllowedTimeInForceIdsForOrderType(orderTypeId: OrderTypeId) {
        return TimeInForce.all;
    }

    isTimeInForceForOrderTypeAllowed(orderTypeId: OrderTypeId, timeInForceId: TimeInForceId) {
        return true;
    }

    getAllowedTriggerTypeIds() {
        return OrderTriggerType.all;
    }
}

export namespace BestMarketOrderRoute {
    export function compareBestByDisplayPriority(left: BestMarketOrderRoute, right: BestMarketOrderRoute) {
        return ComparisonResult.LeftEqualsRight;
    }

    export function tryCreateFromJson(value: OrderRoute.PersistJson) {
        return new BestMarketOrderRoute();
    }
}

export class FixOrderRoute extends OrderRoute {
    constructor() {
        super(OrderRouteAlgorithmId.Fix);
    }

    get code() {
        return 'FIX';
    }

    get name() {
        return OrderRouteAlgorithm.idToName(this.algorithmId);
    }

    get display() {
        return 'FIX';
    }

    toJson() {
        const result: OrderRoute.PersistJson = {
            algorithm: OrderRouteAlgorithm.idToJsonValue(this.algorithmId),
        } as const;
        return result;
    }

    isEqual(other: FixOrderRoute) {
        return true;
    }

    createCopy() {
        return new FixOrderRoute();
    }

    getBestLitMarketId(): MarketId {
        throw new NotImplementedError('ORBFORGBLMI9875463');
    }

    getAllowedOrderTypeIds() {
        return OrderType.all;
    }

    isOrderTypeAllowed(orderTypeId: OrderTypeId) {
        return true; // not sure what else to do here
    }

    getAllowedSideIds() {
        return Side.all;
    }

    isSideAllowed(sideId: SideId) {
        return true;
    }

    isQuantityAllowed(value: Integer) {
        return true;
    }

    getAllowedTimeInForceIdsForOrderType(orderTypeId: OrderTypeId) {
        return TimeInForce.all;
    }

    isTimeInForceForOrderTypeAllowed(orderTypeId: OrderTypeId, timeInForceId: TimeInForceId) {
        return true;
    }

    getAllowedTriggerTypeIds() {
        return OrderTriggerType.all;
    }
}

export namespace FixOrderRoute {
    export function compareFixByDisplayPriority(left: FixOrderRoute, right: FixOrderRoute) {
        return ComparisonResult.LeftEqualsRight;
    }

    export function tryCreateFromJson(value: OrderRoute.PersistJson): OrderRoute | undefined {
        return new FixOrderRoute();
    }
}
