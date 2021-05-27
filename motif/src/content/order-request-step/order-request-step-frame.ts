/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ContentFrame } from '../content-frame';

export class OrderRequestStepFrame extends ContentFrame {
    get stepId() { return this._stepId; }

    constructor(private _stepId: OrderRequestStepFrame.StepId) {
        super();
    }
}

export namespace OrderRequestStepFrame {
    export enum StepId {
        Pad,
        Review,
        Result,
    }
}
