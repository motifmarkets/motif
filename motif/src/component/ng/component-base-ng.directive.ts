/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Directive, ElementRef } from '@angular/core';
import { Integer } from '@motifmarkets/motif-core';

@Directive()
export abstract class ComponentBaseNgDirective {
    readonly rootHtmlElement: HTMLElement;
    readonly typeName: string;
    readonly typeInstanceId: string;

    constructor(readonly elRef: ElementRef<HTMLElement>, readonly typeInstanceCreateId: Integer, generateUniqueId = false) {
        this.rootHtmlElement = elRef.nativeElement;
        this.typeName = this.rootHtmlElement.tagName.toLowerCase();
        this.typeInstanceId  = this.typeName + typeInstanceCreateId.toString(10);
        if (generateUniqueId) {
            this.rootHtmlElement.id = this.typeInstanceId;
        }
    }

    protected generateInstancedRadioName(name: string) {
        return this.typeInstanceId + '_' + name;
    }
}
