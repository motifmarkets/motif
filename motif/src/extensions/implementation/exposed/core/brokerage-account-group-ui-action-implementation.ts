/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BrokerageAccountGroupUiAction } from 'src/core/internal-api';
import {
    BrokerageAccountGroup as BrokerageAccountGroupApi,
    BrokerageAccountGroupUiAction as BrokerageAccountGroupUiActionApi
} from '../../../api/extension-api';
import { BrokerageAccountGroupImplementation } from '../adi/internal-api';
import { UiActionImplementation } from './ui-action-api-implementation';

export class BrokerageAccountGroupUiActionImplementation extends UiActionImplementation implements BrokerageAccountGroupUiActionApi {
    constructor(private readonly _brokerageAccountGroupActual: BrokerageAccountGroupUiAction) {
        super(_brokerageAccountGroupActual);
    }

    get brokerageAccountGroupActual() { return this._brokerageAccountGroupActual; }

    get value() {
        const group = this._brokerageAccountGroupActual.value;
        return group === undefined ? undefined : BrokerageAccountGroupImplementation.toApi(group);
    }
    get definedValue() { return BrokerageAccountGroupImplementation.toApi(this._brokerageAccountGroupActual.definedValue); }
    get options() { return this._brokerageAccountGroupActual.options; }

    public pushValue(value: BrokerageAccountGroupApi | undefined) {
        const group = value === undefined ? undefined : BrokerageAccountGroupImplementation.fromApi(value);
        this._brokerageAccountGroupActual.pushValue(group);
    }

    public pushOptions(options: BrokerageAccountGroupUiActionApi.Options) {
        this._brokerageAccountGroupActual.pushOptions(options);
    }
}
