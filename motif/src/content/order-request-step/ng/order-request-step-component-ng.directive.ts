/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectorRef, Directive } from '@angular/core';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { OrderRequestStepFrame } from '../order-request-step-frame';

@Directive()
export abstract class OrderRequestStepComponentNgDirective extends ContentComponentBaseNgDirective {
    constructor(private _cdr: ChangeDetectorRef) {
        super();
    }

    abstract get frame(): OrderRequestStepFrame;

    protected markForCheck() {
        this._cdr.markForCheck();
    }
}
