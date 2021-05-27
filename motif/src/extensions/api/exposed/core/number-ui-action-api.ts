/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { UiAction } from './ui-action-api';

/** @public */
export interface NumberUiAction extends UiAction {
    readonly value: number | undefined;
    readonly definedValue: number;
    readonly options: NumberUiAction.Options;

    pushValue(value: number | undefined): void;
    pushOptions(options: NumberUiAction.Options): void;
}

/** @public */
export namespace NumberUiAction {
    export interface Options {
        max?: number;
        min?: number;
        step?: number;
        useGrouping?: boolean;
    }
}
