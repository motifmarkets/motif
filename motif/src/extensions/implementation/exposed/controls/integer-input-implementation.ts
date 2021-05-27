/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IntegerUiAction } from 'src/core/internal-api';
import { IntegerInput as IntegerInputApi } from '../../../api/extension-api';
import { FactoryComponent, FactoryComponentRef } from '../component/internal-api';
import { IntegerUiActionImplementation } from '../core/internal-api';

export class IntegerInputImplementation extends IntegerUiActionImplementation implements IntegerInputApi, FactoryComponent {
    get factoryComponentRef() { return this._factoryComponentRef; }
    get rootHtmlElement() { return this._factoryComponentRef.rootHtmlElement; }

    constructor(private readonly _factoryComponentRef: FactoryComponentRef, uiAction: IntegerUiAction) {
        super(uiAction);
    }
}
