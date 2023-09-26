/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataEnvironmentId, UnreachableCaseError } from '@motifmarkets/motif-core';
import {
    ApiError as ApiErrorApi, DataEnvironmentId as DataEnvironmentIdApi, DataEnvironmentIdEnum as DataEnvironmentIdEnumApi
} from '../../../api/extension-api';
import { UnreachableCaseApiErrorImplementation } from '../sys/internal-api';

export namespace DataEnvironmentIdImplementation {
    export function toApi(value: DataEnvironmentId): DataEnvironmentIdApi {
        switch (value) {
            case DataEnvironmentId.Production: return DataEnvironmentIdEnumApi.Production;
            case DataEnvironmentId.DelayedProduction: return DataEnvironmentIdEnumApi.DelayedProduction;
            case DataEnvironmentId.Demo: return DataEnvironmentIdEnumApi.Demo;
            case DataEnvironmentId.Sample: return DataEnvironmentIdEnumApi.Sample;
            default: throw new UnreachableCaseError('EEIAITAU87773331', value);
        }
    }

    export function fromApi(value: DataEnvironmentIdApi): DataEnvironmentId {
        const enumValue = value as DataEnvironmentIdEnumApi;
        switch (enumValue) {
            case DataEnvironmentIdEnumApi.Production: return DataEnvironmentId.Production;
            case DataEnvironmentIdEnumApi.DelayedProduction: return DataEnvironmentId.DelayedProduction;
            case DataEnvironmentIdEnumApi.Demo: return DataEnvironmentId.Demo;
            case DataEnvironmentIdEnumApi.Sample: return DataEnvironmentId.Sample;
            default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidExchangeEnvironmentId, enumValue);
        }
    }
}
