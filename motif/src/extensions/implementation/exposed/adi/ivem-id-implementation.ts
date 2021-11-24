/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IvemId } from 'adi-internal-api';
import { IvemId as IvemIdApi, Json as JsonApi } from '../../../api/extension-api';
import { ExchangeIdImplementation } from './exchange-id-api-implementation';

export class IvemIdImplementation implements IvemIdApi {
    constructor(private readonly _actual: IvemId) { }

    get actual() { return this._actual; }

    get code() { return this._actual.code; }
    get exchangeId() { return ExchangeIdImplementation.toApi(this._actual.exchangeId); }
    get name() { return this._actual.name; }

    toJson(): JsonApi {
        return this._actual.toJson();
    }
}

export namespace IvemIdImplementation {
    export function toApi(actual: IvemId) {
        return new IvemIdImplementation(actual);
    }

    export function fromApi(ivemIdApi: IvemIdApi) {
        const implementation = ivemIdApi as IvemIdImplementation;
        return implementation.actual;
    }

    export function arrayToApi(actualArray: readonly IvemId[]): IvemIdApi[] {
        const count = actualArray.length;
        const result = new Array<IvemIdApi>(count);
        for (let i = 0; i < count; i++) {
            const actual = actualArray[i];
            result[i] = toApi(actual);
        }
        return result;
    }

    export function arrayFromApi(ivemIdArrayApi: readonly IvemIdApi[]): IvemId[] {
        const count = ivemIdArrayApi.length;
        const result = new Array<IvemId>(count);
        for (let i = 0; i < count; i++) {
            const ivemIdApi = ivemIdArrayApi[i];
            result[i] = fromApi(ivemIdApi);
        }
        return result;
    }
}
