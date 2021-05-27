/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IconButtonUiAction } from 'src/core/internal-api';
import { BuiltinIconButton as BuiltinIconButtonApi } from '../../../api/extension-api';
import { FactoryComponent, FactoryComponentRef } from '../component/internal-api';
import { BuiltinIconButtonUiActionImplementation } from '../core/internal-api';

export class BuiltinIconButtonImplementation extends BuiltinIconButtonUiActionImplementation
    implements BuiltinIconButtonApi, FactoryComponent {

    get factoryComponentRef() { return this._factoryComponentRef; }
    get rootHtmlElement() { return this._factoryComponentRef.rootHtmlElement; }

    constructor(private readonly _factoryComponentRef: FactoryComponentRef, uiAction: IconButtonUiAction) {
        super(uiAction);
    }
}
