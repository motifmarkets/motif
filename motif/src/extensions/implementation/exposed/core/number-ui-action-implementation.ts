/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { NumberUiAction } from 'core-internal-api';
import { NumberUiAction as NumberUiActionApi } from '../../../api/extension-api';
import { UiActionImplementation } from './ui-action-api-implementation';

export class NumberUiActionImplementation extends UiActionImplementation implements NumberUiActionApi {
    constructor(private readonly _numberActual: NumberUiAction) {
        super(_numberActual);
    }

    get numberActual() { return this._numberActual; }

    get value() { return this._numberActual.value; }
    get definedValue() { return this._numberActual.definedValue; }
    get options() { return this._numberActual.options; }

    public pushValue(value: number | undefined) {
        this._numberActual.pushValue(value);
    }

    public pushOptions(options: NumberUiActionApi.Options) {
        this._numberActual.pushOptions(options);
    }
}
