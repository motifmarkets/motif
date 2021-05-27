/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Json } from '../sys/extension-api';
import { ExchangeId } from './exchange-id-api';

/** @public */
export interface IvemId {
    readonly code: string;
    readonly exchangeId: ExchangeId;

    readonly name: string;

    toJson(): Json;
}
