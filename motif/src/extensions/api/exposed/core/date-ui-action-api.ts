/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { UiAction } from './ui-action-api';

/** @public */
export interface DateUiAction extends UiAction {
    readonly value: Date | undefined;
    readonly definedValue: Date;

    pushValue(value: Date | undefined): void;
}
