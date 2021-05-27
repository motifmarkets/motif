/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Json } from '../sys/extension-api';
import { ExchangeId } from './extension-api';
import { IvemId } from './ivem-id-api';
import { OrderRoute } from './order-route-api';

/** @public */
export interface RoutedIvemId {
    readonly code: string;
    readonly exchangeId: ExchangeId;
    readonly ivemId: IvemId;
    readonly route: OrderRoute;

    readonly name: string;

    toJson(): Json;
}
