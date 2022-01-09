/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { SideId, UnreachableCaseError } from '@motifmarkets/motif-core';
import {
    ApiError as ApiErrorApi,
    OrderSide as OrderSideApi,
    OrderSideEnum as OrderSideEnumApi
} from '../../../api/extension-api';
import { UnreachableCaseApiErrorImplementation } from '../sys/internal-api';

export namespace OrderSideImplementation {
    export function toApi(value: SideId): OrderSideApi {
        switch (value) {
            case SideId.Buy: return OrderSideEnumApi.Buy;
            case SideId.Sell: return OrderSideEnumApi.Sell;
            case SideId.IntraDayShortSell: return OrderSideEnumApi.IntraDayShortSell;
            case SideId.RegulatedShortSell: return OrderSideEnumApi.RegulatedShortSell;
            case SideId.ProprietaryShortSell: return OrderSideEnumApi.ProprietaryShortSell;
            case SideId.ProprietaryDayTrade: return OrderSideEnumApi.ProprietaryDayTrade;
            default: throw new UnreachableCaseError('OSAITAU2400091112', value);
        }
    }

    export function fromApi(value: OrderSideApi): SideId {
        const enumValue = value as OrderSideEnumApi;
        switch (enumValue) {
            case OrderSideEnumApi.Buy: return SideId.Buy;
            case OrderSideEnumApi.Sell: return SideId.Sell;
            case OrderSideEnumApi.IntraDayShortSell: return SideId.IntraDayShortSell;
            case OrderSideEnumApi.RegulatedShortSell: return SideId.RegulatedShortSell;
            case OrderSideEnumApi.ProprietaryShortSell: return SideId.ProprietaryShortSell;
            case OrderSideEnumApi.ProprietaryDayTrade: return SideId.ProprietaryDayTrade;
            default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidOrderSide, enumValue);
        }
    }

    export function arrayToApi(value: readonly SideId[]): OrderSideApi[] {
        const count = value.length;
        const result = new Array<OrderSideApi>(count);
        for (let i = 0; i < count; i++) {
            result[i] = toApi(value[i]);
        }
        return result;
    }

    export function arrayFromApi(value: readonly OrderSideApi[]): SideId[] {
        const count = value.length;
        const result = new Array<SideId>(count);
        for (let i = 0; i < count; i++) {
            result[i] = fromApi(value[i]);
        }
        return result;
    }
}
