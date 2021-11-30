/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IvemId } from '@motifmarkets/motif-core';
import {
    ComparisonResult as ComparisonResultApi,
    ExchangeId as ExchangeIdApi,
    IvemId as IvemIdApi,
    IvemIdSvc,
    Json as JsonApi
} from '../../../api/extension-api';
import { ComparisonResultImplementation, ExchangeIdImplementation, IvemIdImplementation } from '../../exposed/internal-api';

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

    tryCreateFromJson(json: JsonApi): IvemIdApi | undefined {
        const ivemId = IvemId.tryCreateFromJson(json as IvemId.PersistJson);
        if (ivemId === undefined) {
            return undefined;
        } else {
            return IvemIdImplementation.toApi(ivemId);
        }
    }

    tryCreateArrayFromJson(jsonArray: JsonApi[]): IvemIdApi[] | undefined {
        const ivemIdArray = IvemId.tryCreateArrayFromJson(jsonArray as IvemId.PersistJson[]);
        if (ivemIdArray === undefined) {
            return undefined;
        } else {
            return IvemIdImplementation.arrayToApi(ivemIdArray);
        }
    }
}
