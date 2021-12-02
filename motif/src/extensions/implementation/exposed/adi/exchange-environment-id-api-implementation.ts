/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExchangeEnvironmentId, UnreachableCaseError } from '@motifmarkets/motif-core';
import {
    ApiError as ApiErrorApi,
    ExchangeEnvironmentId as ExchangeEnvironmentIdApi,
    ExchangeEnvironmentIdEnum as ExchangeEnvironmentIdEnumApi
} from '../../../api/extension-api';
import { UnreachableCaseApiErrorImplementation } from '../sys/internal-api';

export namespace ExchangeEnvironmentIdImplementation {
    export function toApi(value: ExchangeEnvironmentId): ExchangeEnvironmentIdApi {
        switch (value) {
            case ExchangeEnvironmentId.Production: return ExchangeEnvironmentIdEnumApi.Production;
            case ExchangeEnvironmentId.DelayedProduction: return ExchangeEnvironmentIdEnumApi.DelayedProduction;
            case ExchangeEnvironmentId.Demo: return ExchangeEnvironmentIdEnumApi.Demo;
            default: throw new UnreachableCaseError('EEIAITAU87773331', value);
        }
    }

    export function fromApi(value: ExchangeEnvironmentIdApi): ExchangeEnvironmentId {
        const enumValue = value as ExchangeEnvironmentIdEnumApi;
        switch (enumValue) {
            case ExchangeEnvironmentIdEnumApi.Production: return ExchangeEnvironmentId.Production;
            case ExchangeEnvironmentIdEnumApi.DelayedProduction: return ExchangeEnvironmentId.DelayedProduction;
            case ExchangeEnvironmentIdEnumApi.Demo: return ExchangeEnvironmentId.Demo;
            default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidExchangeEnvironmentId, enumValue);
        }
    }
}
