/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from 'adi-internal-api';
import { Json as JsonApi, LitIvemId as LitIvemIdApi } from '../../../api/extension-api';
import { ExchangeEnvironmentIdImplementation } from './exchange-environment-id-api-implementation';
import { MarketIdImplementation } from './market-id-api-implementation';

export class LitIvemIdImplementation implements LitIvemIdApi {
    constructor(private readonly _actual: LitIvemId) { }

    get actual() { return this._actual; }

    get code() { return this._actual.code; }
    get litId() { return MarketIdImplementation.toApi(this._actual.litId); }
    get environmentId() { return ExchangeEnvironmentIdImplementation.toApi(this._actual.environmentId); }
    get explicitEnvironmentId() {
        const id = this._actual.explicitEnvironmentId;
        if (id === undefined) {
            return undefined;
        } else {
            return ExchangeEnvironmentIdImplementation.toApi(id);
        }
    }
    get name() { return this._actual.name; }
    get persistKey() { return this._actual.persistKey; }

    toJson(): JsonApi {
        return this._actual.toJson();
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
