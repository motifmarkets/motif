/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Directive } from '@angular/core';
import { Integer } from '@motifmarkets/motif-core';

@Directive()
export abstract class ComponentBaseNgDirective {
    private static _componentInstanceConstructCount = 0;

    protected readonly componentInstanceNumber: Integer;
    protected readonly componentInstanceId: string;

    constructor() {
        this.componentInstanceNumber = ++ComponentBaseNgDirective._componentInstanceConstructCount;
        this.componentInstanceId = this.componentInstanceNumber.toString();
    }

    protected generateInstancedRadioName(name: string) {
        return this.componentInstanceId + name;
    }
}
