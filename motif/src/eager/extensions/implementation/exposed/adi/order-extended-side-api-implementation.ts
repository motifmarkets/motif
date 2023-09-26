/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { OrderExtendedSideId, UnreachableCaseError } from '@motifmarkets/motif-core';
import {
    ApiError as ApiErrorApi,
    OrderExtendedSide as OrderExtendedSideApi,
    OrderExtendedSideEnum as OrderExtendedSideEnumApi
} from '../../../api/extension-api';
import { UnreachableCaseApiErrorImplementation } from '../sys/internal-api';

export namespace OrderExtendedSideImplementation {
    export function toApi(value: OrderExtendedSideId): OrderExtendedSideApi {
        switch (value) {
            case OrderExtendedSideId.Buy: return OrderExtendedSideEnumApi.Buy;
            case OrderExtendedSideId.Sell: return OrderExtendedSideEnumApi.Sell;
            case OrderExtendedSideId.IntraDayShortSell: return OrderExtendedSideEnumApi.IntraDayShortSell;
            case OrderExtendedSideId.RegulatedShortSell: return OrderExtendedSideEnumApi.RegulatedShortSell;
            case OrderExtendedSideId.ProprietaryShortSell: return OrderExtendedSideEnumApi.ProprietaryShortSell;
            case OrderExtendedSideId.ProprietaryDayTrade: return OrderExtendedSideEnumApi.ProprietaryDayTrade;
            default: throw new UnreachableCaseError('OSAITAU2400091112', value);
        }
    }

    export function fromApi(value: OrderExtendedSideApi): OrderExtendedSideId {
        const enumValue = value as OrderExtendedSideEnumApi;
        switch (enumValue) {
            case OrderExtendedSideEnumApi.Buy: return OrderExtendedSideId.Buy;
            case OrderExtendedSideEnumApi.Sell: return OrderExtendedSideId.Sell;
            case OrderExtendedSideEnumApi.IntraDayShortSell: return OrderExtendedSideId.IntraDayShortSell;
            case OrderExtendedSideEnumApi.RegulatedShortSell: return OrderExtendedSideId.RegulatedShortSell;
            case OrderExtendedSideEnumApi.ProprietaryShortSell: return OrderExtendedSideId.ProprietaryShortSell;
            case OrderExtendedSideEnumApi.ProprietaryDayTrade: return OrderExtendedSideId.ProprietaryDayTrade;
            default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidOrderExtendedSide, enumValue);
        }
    }

    export function arrayToApi(value: readonly OrderExtendedSideId[]): OrderExtendedSideApi[] {
        const count = value.length;
        const result = new Array<OrderExtendedSideApi>(count);
        for (let i = 0; i < count; i++) {
            result[i] = toApi(value[i]);
        }
        return result;
    }

    export function arrayFromApi(value: readonly OrderExtendedSideApi[]): OrderExtendedSideId[] {
        const count = value.length;
        const result = new Array<OrderExtendedSideId>(count);
        for (let i = 0; i < count; i++) {
            result[i] = fromApi(value[i]);
        }
        return result;
    }
}
