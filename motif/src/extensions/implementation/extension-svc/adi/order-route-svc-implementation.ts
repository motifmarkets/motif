/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { OrderRoute } from 'src/adi/internal-api';
import {
    Json as JsonApi,
    MarketOrderRoute as MarketOrderRouteApi,
    OrderRoute as OrderRouteApi,
    OrderRouteSvc
} from '../../../api/extension-api';
import { OrderRouteImplementation } from '../../exposed/internal-api';

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

    tryCreateFromJson(json: JsonApi): OrderRouteApi | undefined {
        const orderRoute = OrderRoute.tryCreateFromJson(json as OrderRoute.PersistJson);
        if (orderRoute === undefined) {
            return undefined;
        } else {
            return OrderRouteImplementation.toApi(orderRoute);
        }
    }
}

