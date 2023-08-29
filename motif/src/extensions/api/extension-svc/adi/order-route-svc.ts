/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { JsonElement, MarketOrderRoute, OrderRoute, Result } from '../../exposed/extension-api';

/** @public */
export interface OrderRouteSvc {
    isEqual(left: OrderRoute, right: OrderRoute): boolean;
    isUndefinableEqual(left: OrderRoute | undefined, right: OrderRoute | undefined): boolean;
    isMarketRoute(route: OrderRoute): route is MarketOrderRoute;
    tryCreateFromJson(element: JsonElement): Result<OrderRoute>;
}
