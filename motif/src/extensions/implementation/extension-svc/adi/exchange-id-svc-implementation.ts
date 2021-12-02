/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExchangeInfo } from '@motifmarkets/motif-core';
import { ExchangeId as ExchangeIdApi, ExchangeIdHandle as ExchangeIdHandleApi, ExchangeIdSvc } from '../../../api/extension-api';
import { ExchangeIdImplementation, MarketIdImplementation } from '../../exposed/internal-api';

export class ExchangeIdSvcImplementation implements ExchangeIdSvc {
    toName(id: ExchangeIdApi) {
        const exchangeId = ExchangeIdImplementation.fromApi(id);
        return ExchangeInfo.idToName(exchangeId);
    }

    fromName(name: string) {
        const exchangeId = ExchangeInfo.tryNameToId(name);
        if (exchangeId === undefined) {
            return undefined;
        } else {
            return ExchangeIdImplementation.toApi(exchangeId);
        }
    }

    toJsonValue(id: ExchangeIdApi): string {
        const exchangeId = ExchangeIdImplementation.fromApi(id);
        return ExchangeInfo.idToJsonValue(exchangeId);
    }

    fromJsonValue(jsonValue: string): ExchangeIdApi | undefined {
        const exchangeId = ExchangeInfo.tryJsonValueToId(jsonValue);
        if (exchangeId === undefined) {
            return undefined;
        } else {
            return ExchangeIdImplementation.toApi(exchangeId);
        }
    }

    toAbbreviatedDisplay(id: ExchangeIdApi) {
        const exchangeId = ExchangeIdImplementation.fromApi(id);
        return ExchangeInfo.idToAbbreviatedDisplay(exchangeId);
    }

    toDisplay(id: ExchangeIdApi) {
        const exchangeId = ExchangeIdImplementation.fromApi(id);
        return ExchangeInfo.idToFullDisplay(exchangeId);
    }

    toLocalMarketIds(id: ExchangeIdApi) {
        const exchangeId = ExchangeIdImplementation.fromApi(id);
        const marketIds = ExchangeInfo.idToLocalMarkets(exchangeId);
        return MarketIdImplementation.arrayToApi(marketIds);
    }

    toDefaultMarketId(id: ExchangeIdApi) {
        const exchangeId = ExchangeIdImplementation.fromApi(id);
        const marketId = ExchangeInfo.idToDefaultMarketId(exchangeId);
        return MarketIdImplementation.toApi(marketId);
    }

    toHandle(id: ExchangeIdApi) {
        return ExchangeIdImplementation.fromApi(id);
    }

    fromHandle(handle: ExchangeIdHandleApi) {
        return ExchangeIdImplementation.toApi(handle);
    }

    handleToName(handle: ExchangeIdHandleApi) {
        return ExchangeInfo.idToName(handle);
    }

    handleFromName(name: string) {
        return ExchangeInfo.tryNameToId(name);
    }

    handleToAbbreviatedDisplay(handle: ExchangeIdHandleApi) {
        return ExchangeInfo.idToAbbreviatedDisplay(handle);
    }

    handleToDisplay(handle: ExchangeIdHandleApi) {
        return ExchangeInfo.idToFullDisplay(handle);
    }

    handleToLocalMarketIds(handle: ExchangeIdHandleApi) {
        return ExchangeInfo.idToLocalMarkets(handle);
    }

    handleToDefaultMarketId(handle: ExchangeIdHandleApi) {
        return ExchangeInfo.idToDefaultMarketId(handle);
    }
}
