/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TradingEnvironmentId, UnreachableCaseError } from '@motifmarkets/motif-core';
import {
    ApiError as ApiErrorApi, TradingEnvironmentId as TradingEnvironmentIdApi, TradingEnvironmentIdEnum as TradingEnvironmentIdEnumApi
} from '../../../api/extension-api';
import { UnreachableCaseApiErrorImplementation } from '../sys/internal-api';

export namespace TradingEnvironmentIdImplementation {
    export function toApi(value: TradingEnvironmentId): TradingEnvironmentIdApi {
        switch (value) {
            case TradingEnvironmentId.Production: return TradingEnvironmentIdEnumApi.Production;
            case TradingEnvironmentId.Demo: return TradingEnvironmentIdEnumApi.Demo;
            default: throw new UnreachableCaseError('EEIAITAU87773331', value);
        }
    }

    export function fromApi(value: TradingEnvironmentIdApi): TradingEnvironmentId {
        const enumValue = value as TradingEnvironmentIdEnumApi;
        switch (enumValue) {
            case TradingEnvironmentIdEnumApi.Production: return TradingEnvironmentId.Production;
            case TradingEnvironmentIdEnumApi.Demo: return TradingEnvironmentId.Demo;
            default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidExchangeEnvironmentId, enumValue);
        }
    }
}
