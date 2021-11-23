/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DecimalUiAction } from 'src/core/internal-api';
import { Decimal as DecimalApi, DecimalUiAction as DecimalUiActionApi } from '../../../api/extension-api';
import { DecimalImplementation } from '../sys/decimal-implementation';
import { UiActionImplementation } from './ui-action-api-implementation';

export class DecimalUiActionImplementation extends UiActionImplementation implements DecimalUiActionApi {
    constructor(private readonly _decimalActual: DecimalUiAction) {
        super(_decimalActual);
    }

    get decimalActual() { return this._decimalActual; }

    get value() {
        const actual = this._decimalActual.value;
        return actual === undefined ? undefined : DecimalImplementation.toApi(actual);
    }
    get definedValue() { return DecimalImplementation.toApi(this._decimalActual.definedValue); }
    get options() { return this._decimalActual.options; }

    public pushValue(value: DecimalApi | undefined) {
        const actualDecimal = value === undefined ? undefined : DecimalImplementation.fromApi(value);
        this._decimalActual.pushValue(actualDecimal);
    }

    public pushOptions(options: DecimalUiAction.Options) {
        this._decimalActual.pushOptions(options);
    }
}
