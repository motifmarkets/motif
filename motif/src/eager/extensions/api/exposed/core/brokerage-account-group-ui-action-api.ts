/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BrokerageAccountGroup } from '../adi/extension-api';
import { UiAction } from './ui-action-api';

/** @public */
export interface BrokerageAccountGroupUiAction extends UiAction {
    readonly value: BrokerageAccountGroup | undefined;
    readonly definedValue: BrokerageAccountGroup;
    readonly options: BrokerageAccountGroupUiAction.Options;

    pushValue(value: BrokerageAccountGroup | undefined): void;
    pushOptions(options: BrokerageAccountGroupUiAction.Options): void;
}

/** @public */
export namespace BrokerageAccountGroupUiAction {
    export interface Options {
        allAllowed: boolean;
    }
}
