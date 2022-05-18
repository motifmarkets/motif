/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataEnvironmentId, LitIvemId } from '@motifmarkets/motif-core';
import {
    ComparisonResult as ComparisonResultApi,
    DataEnvironmentId as ExchangeEnvironmentIdApi,
    Json as JsonApi,
    LitIvemId as LitIvemIdApi,
    LitIvemIdSvc,
    MarketId as MarketIdApi
} from '../../../api/extension-api';
import {
    ComparisonResultImplementation,
    DataEnvironmentIdImplementation,
    LitIvemIdImplementation,
    MarketIdImplementation
} from '../../exposed/internal-api';

export class LitIvemIdSvcImplementation implements LitIvemIdSvc {
    create(code: string, litIdApi: MarketIdApi, environmentIdApi?: ExchangeEnvironmentIdApi): LitIvemIdApi {
        const litId = MarketIdImplementation.fromApi(litIdApi);
        let environmentId: DataEnvironmentId;
        let litIvemId: LitIvemId;
        if (environmentIdApi === undefined) {
            litIvemId = new LitIvemId(code, litId);
        } else {
            environmentId = DataEnvironmentIdImplementation.fromApi(environmentIdApi);
            litIvemId = new LitIvemId(code, litId, environmentId);
        }
        return LitIvemIdImplementation.toApi(litIvemId);
    }

    isEqual(leftApi: LitIvemIdApi, rightApi: LitIvemIdApi): boolean {
        const left = LitIvemIdImplementation.fromApi(leftApi);
        const right = LitIvemIdImplementation.fromApi(rightApi);
        return LitIvemId.isEqual(left, right);
    }

    isUndefinableEqual(leftApi: LitIvemIdApi | undefined, rightApi: LitIvemIdApi | undefined): boolean {
        const left = leftApi === undefined ? undefined : LitIvemIdImplementation.fromApi(leftApi);
        const right = rightApi === undefined ? undefined : LitIvemIdImplementation.fromApi(rightApi);
        return LitIvemId.isUndefinableEqual(left, right);
    }

    compare(leftApi: LitIvemIdApi, rightApi: LitIvemIdApi): ComparisonResultApi {
        const left = LitIvemIdImplementation.fromApi(leftApi);
        const right = LitIvemIdImplementation.fromApi(rightApi);
        const result = LitIvemId.compare(left, right);
        return ComparisonResultImplementation.toApi(result);
    }

    tryCreateFromJson(json: JsonApi): LitIvemIdApi | undefined {
        const litIvemId = LitIvemId.tryCreateFromJson(json as LitIvemId.Json, false);
        if (litIvemId === undefined) {
            return undefined;
        } else {
            return LitIvemIdImplementation.toApi(litIvemId);
        }
    }

    tryCreateArrayFromJson(jsonArray: JsonApi[]): LitIvemIdApi[] | undefined {
        const litIvemIdArray = LitIvemId.tryCreateArrayFromJson(jsonArray as LitIvemId.Json[], false);
        if (litIvemIdArray === undefined) {
            return undefined;
        } else {
            return LitIvemIdImplementation.arrayToApi(litIvemIdArray);
        }
    }
}
