/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Json, MarketOrderRoute, OrderRoute } from '../../exposed/extension-api';

/** @public */
export interface OrderRouteSvc {
    isEqual(left: OrderRoute, right: OrderRoute): boolean;
    isUndefinableEqual(left: OrderRoute | undefined, right: OrderRoute | undefined): boolean;
    isMarketRoute(route: OrderRoute): route is MarketOrderRoute;
    tryCreateFromJson(json: Json): OrderRoute | undefined;
}
