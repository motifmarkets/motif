/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IvemId, RoutedIvemId } from 'adi-internal-api';
import {
    ApiError as ApiErrorApi,
    ExchangeId as ExchangeIdApi,
    IvemId as IvemIdApi,
    Json as JsonApi,
    OrderRoute as OrderRouteApi,
    RoutedIvemId as RoutedIvemIdApi,
    RoutedIvemIdSvc
} from '../../../api/extension-api';
import {
    ApiErrorImplementation,
    ExchangeIdImplementation,
    IvemIdImplementation,
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

    tryCreateFromJson(json: JsonApi): RoutedIvemIdApi | undefined {
        const routedIvemId = RoutedIvemId.tryCreateFromJson(json as RoutedIvemId.PersistJson);
        if (routedIvemId === undefined) {
            return undefined;
        } else {
            return RoutedIvemIdImplementation.toApi(routedIvemId);
        }
    }

    tryCreateArrayFromJson(jsonArray: JsonApi[]): RoutedIvemIdApi[] | undefined {
        const routedIvemIdArray = RoutedIvemId.tryCreateArrayFromJson(jsonArray as RoutedIvemId.PersistJson[]);
        if (routedIvemIdArray === undefined) {
            return undefined;
        } else {
            return RoutedIvemIdImplementation.arrayToApi(routedIvemIdArray);
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
