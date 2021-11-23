/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemIdUiAction } from 'src/core/internal-api';
import { LitIvemId as LitIvemIdApi, LitIvemIdUiAction as LitIvemIdUiActionApi } from '../../../api/extension-api';
import { LitIvemIdImplementation } from '../adi/internal-api';
import { LitIvemIdParseDetailsImplementation } from './lit-ivem-id-parse-details-implementation';
import { UiActionImplementation } from './ui-action-api-implementation';

export class LitIvemIdUiActionImplementation extends UiActionImplementation implements LitIvemIdUiActionApi {
    constructor(private readonly _litIvemIdActual: LitIvemIdUiAction) {
        super(_litIvemIdActual);
    }

    get litIvemIdActual() { return this._litIvemIdActual; }

    get value() {
        const litIvemId = this._litIvemIdActual.value;
        if (litIvemId === undefined) {
            return undefined;
        } else {
            return LitIvemIdImplementation.toApi(litIvemId);
        }
    }

    get definedValue() {
        const litIvemId = this._litIvemIdActual.definedValue;
        return LitIvemIdImplementation.toApi(litIvemId);
    }

    get parseDetails() {
        const parseDetails = this._litIvemIdActual.parseDetails;
        if (parseDetails === undefined) {
            return undefined;
        } else {
            return LitIvemIdParseDetailsImplementation.toApi(parseDetails);
        }
    }

    public pushValue(value: LitIvemIdApi | undefined) {
        const litIvemId = value === undefined ? undefined : LitIvemIdImplementation.fromApi(value);
        this._litIvemIdActual.pushValue(litIvemId);
    }
}
