/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DecimalUiAction } from 'src/core/internal-api';
import { DecimalInput as DecimalInputApi } from '../../../api/extension-api';
import { FactoryComponent, FactoryComponentRef } from '../component/internal-api';
import { DecimalUiActionImplementation } from '../core/internal-api';

export class DecimalInputImplementation extends DecimalUiActionImplementation implements DecimalInputApi, FactoryComponent {
    get factoryComponentRef() { return this._factoryComponentRef; }
    get rootHtmlElement() { return this._factoryComponentRef.rootHtmlElement; }

    constructor(private readonly _factoryComponentRef: FactoryComponentRef, uiAction: DecimalUiAction) {
        super(uiAction);
    }
}
