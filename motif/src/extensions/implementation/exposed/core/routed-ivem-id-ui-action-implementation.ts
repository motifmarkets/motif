/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RoutedIvemIdUiAction } from 'core-internal-api';
import { RoutedIvemId as RoutedIvemIdApi, RoutedIvemIdUiAction as RoutedIvemIdUiActionApi } from '../../../api/extension-api';
import { RoutedIvemIdImplementation } from '../adi/internal-api';
import { RoutedIvemIdParseDetailsImplementation } from './routed-ivem-id-parse-details-implementation';
import { UiActionImplementation } from './ui-action-api-implementation';

export class RoutedIvemIdUiActionImplementation extends UiActionImplementation implements RoutedIvemIdUiActionApi {
    constructor(private readonly _routedIvemIdActual: RoutedIvemIdUiAction) {
        super(_routedIvemIdActual);
    }

    get routedIvemIdActual() { return this._routedIvemIdActual; }

    get value() {
        const routedIvemId = this._routedIvemIdActual.value;
        if (routedIvemId === undefined) {
            return undefined;
        } else {
            return RoutedIvemIdImplementation.toApi(routedIvemId);
        }
    }

    get definedValue() {
        const routedIvemId = this._routedIvemIdActual.definedValue;
        return RoutedIvemIdImplementation.toApi(routedIvemId);
    }

    get parseDetails() {
        const parseDetails = this._routedIvemIdActual.parseDetails;
        if (parseDetails === undefined) {
            return undefined;
        } else {
            return RoutedIvemIdParseDetailsImplementation.toApi(parseDetails);
        }
    }

    public pushValue(value: RoutedIvemIdApi | undefined) {
        const routedIvemId = value === undefined ? undefined : RoutedIvemIdImplementation.fromApi(value);
        this._routedIvemIdActual.pushValue(routedIvemId);
    }
}
