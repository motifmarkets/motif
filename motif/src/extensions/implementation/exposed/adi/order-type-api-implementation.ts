/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { OrderTypeId } from 'src/adi/internal-api';
import { AssertInternalError, UnreachableCaseError } from 'src/sys/internal-api';
import {
    ApiError as ApiErrorApi,
    OrderType as OrderTypeApi,
    OrderTypeEnum as OrderTypeEnumApi
} from '../../../api/extension-api';
import { UnreachableCaseApiErrorImplementation } from '../sys/internal-api';

export namespace OrderTypeImplementation {
    export function toApi(value: OrderTypeId): OrderTypeApi {
        switch (value) {
            case OrderTypeId.Limit: return OrderTypeEnumApi.Limit;
            case OrderTypeId.Best: return OrderTypeEnumApi.Best;
            case OrderTypeId.Market: return OrderTypeEnumApi.Market;
            case OrderTypeId.MarketToLimit: return OrderTypeEnumApi.MarketToLimit;
            case OrderTypeId.Unknown: throw new AssertInternalError('OTAITAUN3444001');
            case OrderTypeId.MarketOnClose: throw new AssertInternalError('OTAITAMOC3444001');
            case OrderTypeId.WithOrWithout: throw new AssertInternalError('OTAITAWOW3444001');
            case OrderTypeId.LimitOrBetter: throw new AssertInternalError('OTAITALOB3444001');
            case OrderTypeId.LimitWithOrWithout: throw new AssertInternalError('OTAITALWOW3444001');
            case OrderTypeId.OnBasis: throw new AssertInternalError('OTAITAOB3444001');
            case OrderTypeId.OnClose: throw new AssertInternalError('OTAITAOC3444001');
            case OrderTypeId.LimitOnClose: throw new AssertInternalError('OTAITALOC3444001');
            case OrderTypeId.ForexMarket: throw new AssertInternalError('OTAITAFM3444001');
            case OrderTypeId.PreviouslyQuoted: throw new AssertInternalError('OTAITAPQ3444001');
            case OrderTypeId.PreviouslyIndicated: throw new AssertInternalError('OTAITAPI3444001');
            case OrderTypeId.ForexLimit: throw new AssertInternalError('OTAITAFL3444001');
            case OrderTypeId.ForexSwap: throw new AssertInternalError('OTAITAFS3444001');
            case OrderTypeId.ForexPreviouslyQuoted: throw new AssertInternalError('OTAITAFPQ3444001');
            case OrderTypeId.Funari: throw new AssertInternalError('OTAITAF3444001');
            case OrderTypeId.MarketIfTouched: throw new AssertInternalError('OTAITAMIT3444001');
            case OrderTypeId.PreviousFundValuationPoint: throw new AssertInternalError('OTAITAPFVP3444001');
            case OrderTypeId.NextFundValuationPoint: throw new AssertInternalError('OTAITANFVP3444001');
            case OrderTypeId.MarketAtBest: throw new AssertInternalError('OTAITAMAB3444001');
            default: throw new UnreachableCaseError('OTAITAU3444001', value);
        }
    }

    export function fromApi(value: OrderTypeApi): OrderTypeId {
        const enumValue = value as OrderTypeEnumApi;
        switch (enumValue) {
            case OrderTypeEnumApi.Limit: return OrderTypeId.Limit;
            case OrderTypeEnumApi.Best: return OrderTypeId.Best;
            case OrderTypeEnumApi.Market: return OrderTypeId.Market;
            case OrderTypeEnumApi.MarketToLimit: return OrderTypeId.MarketToLimit;
            default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidOrderType, enumValue);
        }
    }

    export function arrayToApi(value: readonly OrderTypeId[]): OrderTypeApi[] {
        const count = value.length;
        const result = new Array<OrderTypeApi>(count);
        for (let i = 0; i < count; i++) {
            result[i] = toApi(value[i]);
        }
        return result;
    }

    export function arrayFromApi(value: readonly OrderTypeApi[]): OrderTypeId[] {
        const count = value.length;
        const result = new Array<OrderTypeId>(count);
        for (let i = 0; i < count; i++) {
            result[i] = fromApi(value[i]);
        }
        return result;
    }
}
