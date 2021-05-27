/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { UiAction } from './ui-action-api';

/** @public */
export interface BooleanUiAction extends UiAction {
    readonly value: boolean | undefined;
    readonly definedValue: boolean;

    pushValue(value: boolean | undefined): void;
}
