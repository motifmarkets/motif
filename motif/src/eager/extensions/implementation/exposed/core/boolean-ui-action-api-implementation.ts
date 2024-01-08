/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BooleanUiAction } from '@motifmarkets/motif-core';
import { BooleanUiAction as BooleanUiActionApi } from '../../../api/extension-api';
import { UiActionImplementation } from './ui-action-api-implementation';

export class BooleanUiActionImplementation extends UiActionImplementation implements BooleanUiActionApi {
    constructor(private readonly _booleanActual: BooleanUiAction) {
        super(_booleanActual);
    }

    get booleanActual() { return this._booleanActual; }

    get value() { return this._booleanActual.value; }
    get definedValue() { return this._booleanActual.definedValue; }

    public pushValue(value: boolean | undefined) {
        this._booleanActual.pushValue(value);
    }
}
