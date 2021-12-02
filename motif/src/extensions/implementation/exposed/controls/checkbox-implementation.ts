/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BooleanUiAction } from '@motifmarkets/motif-core';
import { Checkbox as CheckboxApi } from '../../../api/extension-api';
import { FactoryComponent, FactoryComponentRef } from '../component/internal-api';
import { BooleanUiActionImplementation } from '../core/internal-api';

export class CheckboxImplementation extends BooleanUiActionImplementation implements CheckboxApi, FactoryComponent {
    constructor(private readonly _factoryComponentRef: FactoryComponentRef, uiAction: BooleanUiAction) {
        super(uiAction);
    }

    get factoryComponentRef() { return this._factoryComponentRef; }
    get rootHtmlElement() { return this._factoryComponentRef.rootHtmlElement; }
}
