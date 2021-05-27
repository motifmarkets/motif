/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectorRef, Directive } from '@angular/core';
import { OrderRequestStepFrame } from '../order-request-step-frame';

@Directive()
export abstract class OrderRequestStepComponentNgDirective {
    constructor(private _cdr: ChangeDetectorRef) { }

    abstract get frame(): OrderRequestStepFrame;

    protected markForCheck() {
        this._cdr.markForCheck();
    }
}
