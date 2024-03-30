/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Directive, ElementRef, InjectionToken } from '@angular/core';
import { Integer } from '@motifmarkets/motif-core';
import { ComponentInstanceId } from '../component-instance-id';
import { IdentifiableComponent } from '../identifiable-component';

@Directive()
export abstract class ComponentBaseNgDirective implements IdentifiableComponent {
    private static readonly invalidInstanceId = 0;
    private static _lastInstanceId: ComponentBaseNgDirective.InstanceId = ComponentBaseNgDirective.invalidInstanceId;

    readonly rootHtmlElement: HTMLElement;
    readonly instanceId: ComponentBaseNgDirective.InstanceId;
    readonly typeName: string;
    readonly typeInstanceId: string;

    constructor(readonly elRef: ElementRef<HTMLElement>, readonly typeInstanceCreateId: Integer, generateUniqueId = false) {
        this.rootHtmlElement = elRef.nativeElement;
        this.instanceId = ++ComponentBaseNgDirective._lastInstanceId;

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

export namespace ComponentBaseNgDirective {
    export type InstanceId = ComponentInstanceId;
    export const typeInstanceCreateIdInjectionToken = new InjectionToken('typeInstanceCreateIdInjectionToken');
}
