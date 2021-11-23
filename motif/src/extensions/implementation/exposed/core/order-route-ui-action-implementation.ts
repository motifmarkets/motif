/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { OrderRouteUiAction } from 'src/core/internal-api';
import { OrderRoute as OrderRouteApi, OrderRouteUiAction as OrderRouteUiActionApi } from '../../../api/extension-api';
import { OrderRouteImplementation } from '../adi/order-route-implementation';
import { UiActionImplementation } from './ui-action-api-implementation';

export class OrderRouteUiActionImplementation extends UiActionImplementation implements OrderRouteUiActionApi {
    constructor(private readonly _orderRouteActual: OrderRouteUiAction) {
        super(_orderRouteActual);
    }

    get orderRouteActual() { return this._orderRouteActual; }

    get value() {
        const actual = this._orderRouteActual.value;
        return actual === undefined ? undefined : OrderRouteImplementation.toApi(actual);
    }
    get definedValue() { return OrderRouteImplementation.toApi(this._orderRouteActual.definedValue); }
    get allowedValues() { return OrderRouteImplementation.arrayToApi(this._orderRouteActual.allowedValues); }

    public pushValue(value: OrderRouteApi | undefined) {
        const actualOrderRoute = value === undefined ? undefined : OrderRouteImplementation.fromApi(value);
        this._orderRouteActual.pushValue(actualOrderRoute);
    }

    public pushAllowedValues(allowedValues: readonly OrderRouteApi[]) {
        const actualAllowedHandles = OrderRouteImplementation.arrayFromApi(allowedValues);
        this._orderRouteActual.pushAllowedValues(actualAllowedHandles);
    }
}
