/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { OrderRouteUiAction } from 'src/core/internal-api';
import { OrderRouteSelect as OrderRouteSelectApi } from '../../../api/extension-api';
import { FactoryComponent, FactoryComponentRef } from '../component/internal-api';
import { OrderRouteUiActionImplementation } from '../core/internal-api';

export class OrderRouteSelectImplementation extends OrderRouteUiActionImplementation implements OrderRouteSelectApi, FactoryComponent {
    get factoryComponentRef() { return this._factoryComponentRef; }
    get rootHtmlElement() { return this._factoryComponentRef.rootHtmlElement; }

    constructor(private readonly _factoryComponentRef: FactoryComponentRef, uiAction: OrderRouteUiAction) {
        super(uiAction);
    }
}
