/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { JsonElement } from '../sys/extension-api';
import { ExchangeId } from './exchange-id-api';
import { IvemId } from './ivem-id-api';
import { OrderRoute } from './order-route-api';

/** @public */
export interface RoutedIvemId {
    readonly code: string;
    readonly exchangeId: ExchangeId;
    readonly ivemId: IvemId;
    readonly route: OrderRoute;

    readonly name: string;

    saveToJson(elementApi: JsonElement): void;
}
