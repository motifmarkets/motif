/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer, TradingEnvironmentId } from '../../exposed/extension-api';

/** @public */
export interface TradingEnvironmentIdSvc {
    toName(id: TradingEnvironmentId): string;
    fromName(name: string): TradingEnvironmentId | undefined;
    toJsonValue(id: TradingEnvironmentId): string;
    fromJsonValue(jsonValue: string): TradingEnvironmentId | undefined;
    toDisplay(id: TradingEnvironmentId): string;

    toHandle(id: TradingEnvironmentId): TradingEnvironmentIdHandle;
    fromHandle(handle: TradingEnvironmentIdHandle): TradingEnvironmentId | undefined;

    handleToName(handle: TradingEnvironmentIdHandle): string;
    handleFromName(name: string): TradingEnvironmentIdHandle | undefined;
    handleToDisplay(handle: TradingEnvironmentIdHandle): string;
}

/** @public */
export type TradingEnvironmentIdHandle = Integer;
