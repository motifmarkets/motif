/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IvemId, RoutedIvemId } from '@motifmarkets/motif-core';
import {
    ApiError as ApiErrorApi,
    ExchangeId as ExchangeIdApi,
    IvemId as IvemIdApi,
    JsonElement as JsonElementApi,
    OrderRoute as OrderRouteApi,
    Result as ResultApi,
    RoutedIvemId as RoutedIvemIdApi,
    RoutedIvemIdSvc
} from '../../../api/extension-api';
import {
    ApiErrorImplementation,
    ErrImplementation,
    ExchangeIdImplementation,
    IvemIdImplementation,
    JsonElementImplementation,
    OkImplementation,
    OrderRouteImplementation,
    RoutedIvemIdImplementation
} from '../../exposed/internal-api';

export class RoutedIvemIdSvcImplementation implements RoutedIvemIdSvc {
    create(codeOrIvemIdApi: string | IvemIdApi,
        exchangeIdOrRouteApi: ExchangeIdApi | OrderRouteApi,
        routeApi?: OrderRouteApi
    ): RoutedIvemIdApi {
        if (typeof codeOrIvemIdApi === 'string') {
            if (typeof exchangeIdOrRouteApi !== 'string' || routeApi === undefined) {
                throw new ApiErrorImplementation(ApiErrorApi.CodeEnum.RoutedIvemIdCreateError_InvalidParameterTypes);
            } else {
                return this.createFromCodeExchangeIdOrderRoute(codeOrIvemIdApi, exchangeIdOrRouteApi, routeApi);
            }
        } else {
            if (typeof exchangeIdOrRouteApi === 'string') {
                throw new ApiErrorImplementation(ApiErrorApi.CodeEnum.RoutedIvemIdCreateError_InvalidParameterTypes);
            } else {
                return this.createFromIvemIdOrderRoute(codeOrIvemIdApi, exchangeIdOrRouteApi);
            }
        }
    }

    isEqual(leftApi: RoutedIvemIdApi, rightApi: RoutedIvemIdApi): boolean {
        const left = RoutedIvemIdImplementation.fromApi(leftApi);
        const right = RoutedIvemIdImplementation.fromApi(rightApi);
        return RoutedIvemId.isEqual(left, right);
    }

    isUndefinableEqual(leftApi: RoutedIvemIdApi | undefined, rightApi: RoutedIvemIdApi | undefined): boolean {
        const left = leftApi === undefined ? undefined : RoutedIvemIdImplementation.fromApi(leftApi);
        const right = rightApi === undefined ? undefined : RoutedIvemIdImplementation.fromApi(rightApi);
        return RoutedIvemId.isUndefinableEqual(left, right);
    }

    tryCreateFromJson(elementApi: JsonElementApi): ResultApi<RoutedIvemIdApi> {
        const element = JsonElementImplementation.fromApi(elementApi);
        const result = RoutedIvemId.tryCreateFromJson(element);
        if (result.isErr()) {
            return new ErrImplementation(result.error);
        } else {
            const routedIvemIdApi = RoutedIvemIdImplementation.toApi(result.value);
            return new OkImplementation(routedIvemIdApi);
        }
    }

    tryCreateArrayFromJson(elementsApi: JsonElementApi[]): ResultApi<RoutedIvemIdApi[]> {
        const elements = JsonElementImplementation.arrayFromApi(elementsApi);
        const result = RoutedIvemId.tryCreateArrayFromJsonElementArray(elements);
        if (result.isErr()) {
            return new ErrImplementation(result.error);
        } else {
            const routedIvemIdArrayApi = RoutedIvemIdImplementation.arrayToApi(result.value);
            return new OkImplementation(routedIvemIdArrayApi);
        }
    }

    private createFromCodeExchangeIdOrderRoute(code: string, exchangeIdApi: ExchangeIdApi, routeApi: OrderRouteApi) {
        const exchangeId = ExchangeIdImplementation.fromApi(exchangeIdApi);
        const route = OrderRouteImplementation.fromApi(routeApi);
        const ivemId = new IvemId(code, exchangeId);
        const routedIvemId = new RoutedIvemId(ivemId, route);
        return RoutedIvemIdImplementation.toApi(routedIvemId);
    }

    private createFromIvemIdOrderRoute(ivemIdApi: IvemIdApi, routeApi: OrderRouteApi) {
        const ivemId = IvemIdImplementation.fromApi(ivemIdApi);
        const route = OrderRouteImplementation.fromApi(routeApi);
        const routedIvemId = new RoutedIvemId(ivemId, route);
        return RoutedIvemIdImplementation.toApi(routedIvemId);
    }
}
