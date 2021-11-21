/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Directive } from '@angular/core';
import { Integer } from 'src/sys/internal-api';

@Directive()
export abstract class ComponentBaseNgDirective {
    private static _componentInstanceConstructCount = 0;

    private _componentInstanceNumber: Integer;
    private _componentInstanceId: string;

    constructor() {
        this._componentInstanceNumber = ++ComponentBaseNgDirective._componentInstanceConstructCount;
        this._componentInstanceId = this._componentInstanceNumber.toString();
    }

    protected get componentInstanceNumber() { return this._componentInstanceNumber; }
    protected get componentInstanceId() { return this._componentInstanceId; }

    protected generateInstancedRadioName(name: string) {
        return this.componentInstanceId + name;
    }
}
