/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExchangeId, ExchangeIdHandle, MarketId, MarketIdHandle } from '../../exposed/extension-api';

/** @public */
export interface ExchangeIdSvc {
    toName(id: ExchangeId): string;
    fromName(name: string): ExchangeId | undefined;
    toJsonValue(id: ExchangeId): string;
    fromJsonValue(id: string): ExchangeId | undefined;
    toAbbreviatedDisplay(id: ExchangeId): string;
    toDisplay(id: ExchangeId): string;
    toLocalMarketIds(id: ExchangeId): MarketId[];
    toDefaultMarketId(id: ExchangeId): MarketId;

    toHandle(id: ExchangeId): ExchangeIdHandle;
    fromHandle(handle: ExchangeIdHandle): ExchangeId | undefined;

    handleToName(handle: ExchangeIdHandle): string;
    handleFromName(name: string): ExchangeIdHandle | undefined;
    handleToAbbreviatedDisplay(handle: ExchangeIdHandle): string;
    handleToDisplay(handle: ExchangeIdHandle): string;
    handleToLocalMarketIds(handle: ExchangeIdHandle): readonly MarketIdHandle[];
    handleToDefaultMarketId(handle: ExchangeIdHandle): MarketIdHandle;
}
