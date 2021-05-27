/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Json } from '../sys/extension-api';
import { ExchangeEnvironmentId } from './exchange-environment-id-api';
import { MarketId } from './market-id-api';

/** @public */
export interface LitIvemId {
    readonly code: string;
    readonly litId: MarketId;
    readonly environmentId: ExchangeEnvironmentId;
    readonly explicitEnvironmentId: ExchangeEnvironmentId | undefined;

    readonly name: string;

    readonly persistKey: string;

    toJson(): Json;
}
