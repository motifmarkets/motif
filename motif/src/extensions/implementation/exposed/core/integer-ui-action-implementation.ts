/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IntegerUiAction } from '@motifmarkets/motif-core';
import { IntegerUiAction as IntegerUiActionApi } from '../../../api/extension-api';
import { NumberUiActionImplementation } from './number-ui-action-implementation';

export class IntegerUiActionImplementation extends NumberUiActionImplementation implements IntegerUiActionApi {
    constructor(private readonly _integerActual: IntegerUiAction) {
        super(_integerActual);
    }

    get integerActual() { return this._integerActual; }
}
