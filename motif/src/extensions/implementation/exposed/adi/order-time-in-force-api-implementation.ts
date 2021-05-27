/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TimeInForceId } from 'src/adi/internal-api';
import { AssertInternalError, UnreachableCaseError } from 'src/sys/internal-api';
import {
    ApiError as ApiErrorApi,
    OrderTimeInForce as OrderTimeInForceApi,
    OrderTimeInForceEnum as OrderTimeInForceEnumApi
} from '../../../api/extension-api';
import { UnreachableCaseApiErrorImplementation } from '../sys/internal-api';

export namespace OrderTimeInForceImplementation {
    export function toApi(value: TimeInForceId): OrderTimeInForceApi {
        switch (value) {
            case TimeInForceId.GoodTillCancel: return OrderTimeInForceEnumApi.UntilCancel;
            case TimeInForceId.GoodTillDate: return OrderTimeInForceEnumApi.UntilExpiryDate;
            case TimeInForceId.Day: return OrderTimeInForceEnumApi.Today;
            case TimeInForceId.FillAndKill: return OrderTimeInForceEnumApi.FillAndKill;
            case TimeInForceId.FillOrKill: return OrderTimeInForceEnumApi.FillOrKill;
            case TimeInForceId.AllOrNone: return OrderTimeInForceEnumApi.AllOrNone;
            case TimeInForceId.AtTheOpening: throw new AssertInternalError('OTIFAITAATO88551187');
            case TimeInForceId.GoodTillCrossing: throw new AssertInternalError('OTIFAITAGTC88551187');
            case TimeInForceId.AtTheClose: throw new AssertInternalError('OTIFAITAATC88551187');
            default: throw new UnreachableCaseError('OTIFAITAU88551187', value);
        }
    }

    export function fromApi(value: OrderTimeInForceApi): TimeInForceId {
        const enumValue = value as OrderTimeInForceEnumApi;
        switch (enumValue) {
            case OrderTimeInForceEnumApi.UntilCancel: return TimeInForceId.GoodTillCancel;
            case OrderTimeInForceEnumApi.UntilExpiryDate: return TimeInForceId.GoodTillDate;
            case OrderTimeInForceEnumApi.Today: return TimeInForceId.Day;
            case OrderTimeInForceEnumApi.FillAndKill: return TimeInForceId.FillAndKill;
            case OrderTimeInForceEnumApi.FillOrKill: return TimeInForceId.FillOrKill;
            case OrderTimeInForceEnumApi.AllOrNone: return TimeInForceId.AllOrNone;
            default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidOrderTimeInForce, enumValue);
        }
    }

    export function arrayToApi(value: readonly TimeInForceId[]): OrderTimeInForceApi[] {
        const count = value.length;
        const result = new Array<OrderTimeInForceApi>(count);
        for (let i = 0; i < count; i++) {
            result[i] = toApi(value[i]);
        }
        return result;
    }

    export function arrayFromApi(value: readonly OrderTimeInForceApi[]): TimeInForceId[] {
        const count = value.length;
        const result = new Array<TimeInForceId>(count);
        for (let i = 0; i < count; i++) {
            result[i] = fromApi(value[i]);
        }
        return result;
    }
}
