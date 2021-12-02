/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Directive } from '@angular/core';
import { EnumArrayUiAction, Integer } from '@motifmarkets/motif-core';
import { EnumArrayComponentBaseNgDirective } from './enum-array-component-base-ng.directive';

@Directive()
export abstract class EnumArrayElementComponentBaseNgDirective extends EnumArrayComponentBaseNgDirective {
    public elementCaption = '';
    public elementTitle = '';

    private _element: Integer = EnumArrayElementComponentBaseNgDirective.undefinedElement;

    protected get element() { return this._element; }

    initialiseEnum(action: EnumArrayUiAction, element: Integer) {
        this._element = element;
        this.initialise(action);
        this.applyElements();
    }

    protected override applyElementTitle(element: Integer, title: string) {
        super.applyElementTitle(element, title);
        if (element === this.element && title !== this.elementTitle) {
            this.elementTitle = title;
            this.markForCheck();
        }
    }

    protected override applyElementCaption(element: Integer, caption: string) {
        super.applyElementCaption(element, caption);
        if (element === this.element && caption !== this.elementCaption) {
            this.elementCaption = caption;
            this.applyCaption(caption);
            this.markForCheck();
        }
    }

    protected override applyElements() {
        super.applyElements();
        const properties = this.uiAction.getElementProperties(this._element);
        if (properties === undefined) {
            this.elementCaption = '?';
            this.elementTitle = '?';
        } else {
            this.elementCaption = properties.caption;
            this.elementTitle = properties.title;
        }
        this.markForCheck();
    }
}

export namespace EnumArrayElementComponentBaseNgDirective {
    export const undefinedElement = -1;
}
