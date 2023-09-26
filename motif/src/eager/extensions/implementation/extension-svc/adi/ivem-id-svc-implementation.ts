/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IvemId } from '@motifmarkets/motif-core';
import {
    ComparisonResult as ComparisonResultApi,
    Err as ErrApi,
    ExchangeId as ExchangeIdApi,
    IvemId as IvemIdApi,
    IvemIdSvc, JsonElement as JsonElementApi,
    Ok as OkApi,
    Result as ResultApi
} from '../../../api/extension-api';
import {
    ComparisonResultImplementation,
    ExchangeIdImplementation,
    IvemIdImplementation,
    JsonElementImplementation
} from '../../exposed/internal-api';

export class IvemIdSvcImplementation implements IvemIdSvc {
    create(code: string, litIdApi: ExchangeIdApi): IvemIdApi {
        const exchangeId = ExchangeIdImplementation.fromApi(litIdApi);
        const ivemId = new IvemId(code, exchangeId);
        return IvemIdImplementation.toApi(ivemId);
    }

    isEqual(leftApi: IvemIdApi, rightApi: IvemIdApi): boolean {
        const left = IvemIdImplementation.fromApi(leftApi);
        const right = IvemIdImplementation.fromApi(rightApi);
        return IvemId.isEqual(left, right);
    }

    isUndefinableEqual(leftApi: IvemIdApi | undefined, rightApi: IvemIdApi | undefined): boolean {
        const left = leftApi === undefined ? undefined : IvemIdImplementation.fromApi(leftApi);
        const right = rightApi === undefined ? undefined : IvemIdImplementation.fromApi(rightApi);
        return IvemId.isUndefinableEqual(left, right);
    }

    compare(leftApi: IvemIdApi, rightApi: IvemIdApi): ComparisonResultApi {
        const left = IvemIdImplementation.fromApi(leftApi);
        const right = IvemIdImplementation.fromApi(rightApi);
        const result = IvemId.compare(left, right);
        return ComparisonResultImplementation.toApi(result);
    }

    tryCreateFromJson(elementApi: JsonElementApi): ResultApi<IvemIdApi> {
        const element = JsonElementImplementation.fromApi(elementApi);
        const result = IvemId.tryCreateFromJson(element);
        if (result.isErr()) {
            return new ErrApi(result.error);
        } else {
            const ivemIdApi = IvemIdImplementation.toApi(result.value);
            return new OkApi(ivemIdApi);
        }
    }

    tryCreateArrayFromJson(elementsApi: JsonElementApi[]): ResultApi<IvemIdApi[]> {
        const elements = JsonElementImplementation.arrayFromApi(elementsApi);
        const result = IvemId.tryCreateArrayFromJsonElementArray(elements);
        if (result.isErr()) {
            return new ErrApi(result.error);
        } else {
            const ivemIdArrayApi = IvemIdImplementation.arrayToApi(result.value);
            return new OkApi(ivemIdArrayApi);
        }
    }
}
