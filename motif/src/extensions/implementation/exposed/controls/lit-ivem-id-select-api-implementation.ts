/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemIdUiAction } from 'src/core/internal-api';
import { LitIvemIdSelect as LitIvemIdSelectApi } from '../../../api/extension-api';
import { FactoryComponent, FactoryComponentRef } from '../component/internal-api';
import { LitIvemIdUiActionImplementation } from '../core/internal-api';

export class LitIvemIdSelectImplementation extends LitIvemIdUiActionImplementation implements LitIvemIdSelectApi, FactoryComponent {
    get factoryComponentRef() { return this._factoryComponentRef; }
    get rootHtmlElement() { return this._factoryComponentRef.rootHtmlElement; }

    constructor(private readonly _factoryComponentRef: FactoryComponentRef, uiAction: LitIvemIdUiAction) {
        super(uiAction);
    }
}
