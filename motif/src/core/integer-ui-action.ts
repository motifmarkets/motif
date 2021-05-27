/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { NumberUiAction } from './number-ui-action';

export class IntegerUiAction extends NumberUiAction {
    constructor(required?: boolean) {
        super(required);
        this.pushOptions(IntegerUiAction.defaultIntegerOptions);
    }
}

export namespace IntegerUiAction {
    export const defaultIntegerOptions: NumberUiAction.Options = {
        integer: true,
        max: undefined,
        min: undefined,
        step: 1,
        useGrouping: undefined,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    };
}
