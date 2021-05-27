/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RoutedIvemIdUiAction } from 'src/core/internal-api';
import { RoutedIvemIdSelect as RoutedIvemIdSelectApi } from '../../../api/extension-api';
import { FactoryComponent, FactoryComponentRef } from '../component/internal-api';
import { RoutedIvemIdUiActionImplementation } from '../core/internal-api';

export class RoutedIvemIdSelectImplementation extends RoutedIvemIdUiActionImplementation
    implements RoutedIvemIdSelectApi, FactoryComponent {

    get factoryComponentRef() { return this._factoryComponentRef; }
    get rootHtmlElement() { return this._factoryComponentRef.rootHtmlElement; }

    constructor(private readonly _factoryComponentRef: FactoryComponentRef, uiAction: RoutedIvemIdUiAction) {
        super(uiAction);
    }
}
