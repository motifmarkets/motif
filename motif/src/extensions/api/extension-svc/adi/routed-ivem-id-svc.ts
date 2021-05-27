/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExchangeId, IvemId, Json, OrderRoute, RoutedIvemId } from '../../exposed/extension-api';

/** @public */
export interface RoutedIvemIdSvc {
    create(code: string, exchangeId: ExchangeId, route: OrderRoute): RoutedIvemId;
    create(ivemId: IvemId, route: OrderRoute): RoutedIvemId;
    isEqual(left: RoutedIvemId, right: RoutedIvemId): boolean;
    isUndefinableEqual(left: RoutedIvemId | undefined, right: RoutedIvemId | undefined): boolean;
    tryCreateFromJson(json: Json): RoutedIvemId | undefined;
    tryCreateArrayFromJson(jsonArray: Json[]): RoutedIvemId[] | undefined;
}
