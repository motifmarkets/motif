/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExchangeEnvironmentId, Integer } from '../../exposed/extension-api';

/** @public */
export interface ExchangeEnvironmentIdSvc {
    toName(id: ExchangeEnvironmentId): string;
    fromName(name: string): ExchangeEnvironmentId | undefined;
    toJsonValue(id: ExchangeEnvironmentId): string;
    fromJsonValue(jsonValue: string): ExchangeEnvironmentId | undefined;
    toDisplay(id: ExchangeEnvironmentId): string;

    toHandle(id: ExchangeEnvironmentId): ExchangeEnvironmentIdHandle;
    fromHandle(handle: ExchangeEnvironmentIdHandle): ExchangeEnvironmentId | undefined;

    handleToName(handle: ExchangeEnvironmentIdHandle): string;
    handleFromName(name: string): ExchangeEnvironmentIdHandle | undefined;
    handleToDisplay(handle: ExchangeEnvironmentIdHandle): string;
}

/** @public */
export type ExchangeEnvironmentIdHandle = Integer;
