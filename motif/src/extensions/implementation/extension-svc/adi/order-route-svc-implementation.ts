/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { OrderRoute } from '@motifmarkets/motif-core';
import {
    Err as ErrApi,
    JsonElement as JsonElementApi,
    MarketOrderRoute as MarketOrderRouteApi,
    Ok as OkApi,
    OrderRoute as OrderRouteApi,
    OrderRouteSvc,
    Result as ResultApi
} from '../../../api/extension-api';
import { JsonElementImplementation, OrderRouteImplementation } from '../../exposed/internal-api';

export class OrderRouteSvcImplementation implements OrderRouteSvc {
    isEqual(left: OrderRouteApi, right: OrderRouteApi) {
        const leftActual = OrderRouteImplementation.fromApi(left);
        const rightActual = OrderRouteImplementation.fromApi(right);
        return OrderRoute.isEqual(leftActual, rightActual);
    }

    isUndefinableEqual(left: OrderRouteApi | undefined, right: OrderRouteApi | undefined) {
        const leftActual = left === undefined ? undefined : OrderRouteImplementation.fromApi(left);
        const rightActual = right === undefined ? undefined : OrderRouteImplementation.fromApi(right);
        return OrderRoute.isUndefinableEqual(leftActual, rightActual);
    }

    isMarketRoute(route: OrderRouteApi): route is MarketOrderRouteApi {
        const actual = OrderRouteImplementation.fromApi(route);
        return OrderRoute.isMarketRoute(actual);
    }

    tryCreateFromJson(elementApi: JsonElementApi): ResultApi<OrderRouteApi> {
        const element = JsonElementImplementation.fromApi(elementApi);
        const result = OrderRoute.tryCreateFromJson(element);
        if (result.isErr()) {
            return new ErrApi(result.error);
        } else {
            const orderRouteApi = OrderRouteImplementation.toApi(result.value);
            return new OkApi(orderRouteApi);
        }
    }
}

