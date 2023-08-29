/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExchangeId, IvemId, JsonElement, OrderRoute, Result, RoutedIvemId } from '../../exposed/extension-api';

/** @public */
export interface RoutedIvemIdSvc {
    create(code: string, exchangeId: ExchangeId, route: OrderRoute): RoutedIvemId;
    create(ivemId: IvemId, route: OrderRoute): RoutedIvemId;
    isEqual(left: RoutedIvemId, right: RoutedIvemId): boolean;
    isUndefinableEqual(left: RoutedIvemId | undefined, right: RoutedIvemId | undefined): boolean;
    tryCreateFromJson(element: JsonElement): Result<RoutedIvemId>;
    tryCreateArrayFromJson(elementsApi: JsonElement[]): Result<RoutedIvemId[]>;
}
