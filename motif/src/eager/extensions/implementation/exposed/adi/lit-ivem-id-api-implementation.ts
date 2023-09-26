/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '@motifmarkets/motif-core';
import { JsonElement as JsonElementApi, LitIvemId as LitIvemIdApi } from '../../../api/extension-api';
import { JsonElementImplementation } from '../sys/internal-api';
import { DataEnvironmentIdImplementation } from './data-environment-id-api-implementation';
import { MarketIdImplementation } from './market-id-api-implementation';

export class LitIvemIdImplementation implements LitIvemIdApi {
    constructor(private readonly _actual: LitIvemId) { }

    get actual() { return this._actual; }

    get code() { return this._actual.code; }
    get litId() { return MarketIdImplementation.toApi(this._actual.litId); }
    get environmentId() { return DataEnvironmentIdImplementation.toApi(this._actual.environmentId); }
    get explicitEnvironmentId() {
        const id = this._actual.explicitEnvironmentId;
        if (id === undefined) {
            return undefined;
        } else {
            return DataEnvironmentIdImplementation.toApi(id);
        }
    }
    get name() { return this._actual.name; }
    get mapKey() { return this._actual.mapKey; }

    saveToJson(elementApi: JsonElementApi): void {
        const element = JsonElementImplementation.fromApi(elementApi);
        this._actual.saveToJson(element);
    }
}

export namespace LitIvemIdImplementation {
    export function toApi(actual: LitIvemId) {
        return new LitIvemIdImplementation(actual);
    }

    export function fromApi(litIvemIdApi: LitIvemIdApi) {
        const implementation = litIvemIdApi as LitIvemIdImplementation;
        return implementation.actual;
    }

    export function arrayToApi(actualArray: readonly LitIvemId[]): LitIvemIdApi[] {
        const count = actualArray.length;
        const result = new Array<LitIvemIdApi>(count);
        for (let i = 0; i < count; i++) {
            const actual = actualArray[i];
            result[i] = toApi(actual);
        }
        return result;
    }

    export function arrayFromApi(litIvemIdArrayApi: readonly LitIvemIdApi[]): LitIvemId[] {
        const count = litIvemIdArrayApi.length;
        const result = new Array<LitIvemId>(count);
        for (let i = 0; i < count; i++) {
            const litIvemIdApi = litIvemIdArrayApi[i];
            result[i] = fromApi(litIvemIdApi);
        }
        return result;
    }
}
