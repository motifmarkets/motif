/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MarketOrderRoute } from 'src/adi/internal-api';
import { MarketOrderRoute as MarketOrderRouteApi } from '../../../api/extension-api';
import { MarketIdImplementation } from './market-id-api-implementation';
import { OrderRouteImplementation } from './order-route-implementation';

export class MarketOrderRouteImplementation extends OrderRouteImplementation implements MarketOrderRouteApi {
    get marketActual() { return this._marketActual; }

    get marketId() { return MarketIdImplementation.toApi(this._marketActual.marketId); }
    get marketIdHandle() { return this._marketActual.marketId; }

    constructor(private readonly _marketActual: MarketOrderRoute) {
        super(_marketActual);
    }

    isEqualTo(other: MarketOrderRouteApi) {
        const actualOther = MarketOrderRouteImplementation.marketFromApi(other);
        return this._marketActual.isEqual(actualOther);
    }
}

export namespace MarketOrderRouteImplementation {
    export function marketToApi(actual: MarketOrderRoute) {
        return new MarketOrderRouteImplementation(actual);
    }

    export function marketFromApi(marketOrderRouteApi: MarketOrderRouteApi) {
        const implementation = marketOrderRouteApi as MarketOrderRouteImplementation;
        return implementation.marketActual;
    }

    export function marketArrayToApi(value: readonly MarketOrderRoute[]): MarketOrderRouteApi[] {
        const count = value.length;
        const result = new Array<MarketOrderRouteApi>(count);
        for (let i = 0; i < count; i++) {
            result[i] = marketToApi(value[i]);
        }
        return result;
    }

    export function marketArrayFromApi(value: readonly MarketOrderRouteApi[]): MarketOrderRoute[] {
        const count = value.length;
        const result = new Array<MarketOrderRoute>(count);
        for (let i = 0; i < count; i++) {
            result[i] = marketFromApi(value[i]);
        }
        return result;
    }
}
