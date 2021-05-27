/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BooleanUiAction } from 'src/core/internal-api';
import { CaptionedCheckbox as CaptionedCheckboxApi } from '../../../api/extension-api';
import { FactoryComponent, FactoryComponentRef } from '../component/internal-api';
import { BooleanUiActionImplementation } from '../core/internal-api';

export class CaptionedCheckboxImplementation extends BooleanUiActionImplementation implements CaptionedCheckboxApi, FactoryComponent {
    get factoryComponentRef() { return this._factoryComponentRef; }
    get rootHtmlElement() { return this._factoryComponentRef.rootHtmlElement; }

    constructor(private readonly _factoryComponentRef: FactoryComponentRef, uiAction: BooleanUiAction) {
        super(uiAction);
    }
}
