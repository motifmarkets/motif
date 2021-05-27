/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { OrderRouteAlgorithmId } from 'src/adi/internal-api';
import { AssertInternalError, UnreachableCaseError } from 'src/sys/internal-api';
import {
    ApiError as ApiErrorApi,
    OrderRouteAlgorithm as OrderRouteAlgorithmApi,
    OrderRouteAlgorithmEnum as OrderRouteAlgorithmEnumApi
} from '../../../api/extension-api';
import { UnreachableCaseApiErrorImplementation } from '../sys/internal-api';

export namespace OrderRouteAlgorithmImplementation {
    export function toApi(value: OrderRouteAlgorithmId): OrderRouteAlgorithmApi {
        switch (value) {
            case OrderRouteAlgorithmId.Market: return OrderRouteAlgorithmEnumApi.Market;
            case OrderRouteAlgorithmId.BestMarket: throw new AssertInternalError('ORAITABM3392766');
            case OrderRouteAlgorithmId.Fix: throw new AssertInternalError('ORAITABM3392766');
            default: throw new UnreachableCaseError('ORAITAU3392766', value);
        }
    }

    export function fromApi(value: OrderRouteAlgorithmApi): OrderRouteAlgorithmId {
        const enumValue = value as OrderRouteAlgorithmEnumApi;
        switch (enumValue) {
            case OrderRouteAlgorithmEnumApi.Market: return OrderRouteAlgorithmId.Market;
            default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidOrderRouteAlgorithm, enumValue);
        }
    }
}
