/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DateUiAction } from 'src/core/internal-api';
import { DateUiAction as DateUiActionApi } from '../../../api/extension-api';
import { UiActionImplementation } from './ui-action-api-implementation';

export class DateUiActionImplementation extends UiActionImplementation implements DateUiActionApi {
    get dateActual() { return this._dateActual; }

    get value() { return this._dateActual.value; }
    get definedValue() { return this._dateActual.definedValue; }

    constructor(private readonly _dateActual: DateUiAction) {
        super(_dateActual);
    }

    public pushValue(value: Date | undefined) {
        this._dateActual.pushValue(value);
    }
}
