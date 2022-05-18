/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Json } from '../sys/extension-api';
import { DataEnvironmentId } from './data-environment-id-api';
import { MarketId } from './market-id-api';

/** @public */
export interface LitIvemId {
    readonly code: string;
    readonly litId: MarketId;
    readonly environmentId: DataEnvironmentId;
    readonly explicitEnvironmentId: DataEnvironmentId | undefined;

    readonly name: string;

    readonly persistKey: string;

    toJson(): Json;
}
