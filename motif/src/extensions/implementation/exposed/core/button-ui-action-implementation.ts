/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ButtonUiAction } from 'src/core/internal-api';
import { ButtonUiAction as ButtonUiActionApi } from '../../../api/extension-api';
import { CommandUiActionImplementation } from './command-ui-action-api-implementation';

export class ButtonUiActionImplementation extends CommandUiActionImplementation implements ButtonUiActionApi {
    constructor(private readonly _buttonActual: ButtonUiAction) {
        super(_buttonActual);
    }

    get buttonActual() { return this._buttonActual; }

    public pushUnselected() {
        this._buttonActual.pushValue(false);
    }

    public pushSelected() {
        this._buttonActual.pushValue(true);
    }
}
