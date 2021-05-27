/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { NumberUiAction } from 'src/core/internal-api';
import { NumberInput as NumberInputApi } from '../../../api/extension-api';
import { FactoryComponent, FactoryComponentRef } from '../component/internal-api';
import { NumberUiActionImplementation } from '../core/internal-api';

export class NumberInputImplementation extends NumberUiActionImplementation implements NumberInputApi, FactoryComponent {
    get factoryComponentRef() { return this._factoryComponentRef; }
    get rootHtmlElement() { return this._factoryComponentRef.rootHtmlElement; }

    constructor(private readonly _factoryComponentRef: FactoryComponentRef, uiAction: NumberUiAction) {
        super(uiAction);
    }
}
