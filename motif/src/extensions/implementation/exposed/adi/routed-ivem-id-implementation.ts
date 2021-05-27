/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RoutedIvemId } from 'src/adi/internal-api';
import { Json as JsonApi, RoutedIvemId as RoutedIvemIdApi } from '../../../api/extension-api';
import { ExchangeIdImplementation } from './exchange-id-api-implementation';
import { IvemIdImplementation } from './ivem-id-implementation';
import { OrderRouteImplementation } from './order-route-implementation';

export class RoutedIvemIdImplementation implements RoutedIvemIdApi {
    get actual() { return this._actual; }

    get code() { return this._actual.ivemId.code; }
    get exchangeId() { return ExchangeIdImplementation.toApi(this._actual.ivemId.exchangeId); }
    get ivemId() { return IvemIdImplementation.toApi(this._actual.ivemId); }
    get route() { return OrderRouteImplementation.toApi(this._actual.route); }
    get name() { return this._actual.name; }

    constructor(private readonly _actual: RoutedIvemId) { }

    toJson(): JsonApi {
        return this._actual.toJson();
    }
}

export namespace RoutedIvemIdImplementation {
    export function toApi(actual: RoutedIvemId) {
        return new RoutedIvemIdImplementation(actual);
    }

    export function fromApi(routedIvemIdApi: RoutedIvemIdApi) {
        const implementation = routedIvemIdApi as RoutedIvemIdImplementation;
        return implementation.actual;
    }

    export function arrayToApi(actualArray: readonly RoutedIvemId[]): RoutedIvemIdApi[] {
        const count = actualArray.length;
        const result = new Array<RoutedIvemIdApi>(count);
        for (let i = 0; i < count; i++) {
            const actual = actualArray[i];
            result[i] = toApi(actual);
        }
        return result;
    }

    export function arrayFromApi(routedIvemIdArrayApi: readonly RoutedIvemIdApi[]): RoutedIvemId[] {
        const count = routedIvemIdArrayApi.length;
        const result = new Array<RoutedIvemId>(count);
        for (let i = 0; i < count; i++) {
            const routedIvemIdApi = routedIvemIdArrayApi[i];
            result[i] = fromApi(routedIvemIdApi);
        }
        return result;
    }
}
