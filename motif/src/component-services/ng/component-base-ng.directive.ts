/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Directive } from '@angular/core';
import { Integer } from 'src/sys/internal-api';

@Directive()
export abstract class ComponentBaseNgDirective {
    private static _instanceConstructCount = 0;

    private _instanceNumber: Integer;

    protected get instanceNumber() { return this._instanceNumber; }

    constructor() {
        this._instanceNumber = ++ComponentBaseNgDirective._instanceConstructCount;
    }
}
