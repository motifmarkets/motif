/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Directive } from '@angular/core';
import { EnumExplicitElementsArrayUiAction, Integer } from '@motifmarkets/motif-core';
import { EnumExplicitElementsArrayUiActionNgDirective } from './enum-explicit-elements-array-ui-action-ng.directive';

@Directive()
export abstract class EnumExplicitElementsArrayElementUiActionNgDirective extends EnumExplicitElementsArrayUiActionNgDirective {
    public elementCaption = '';
    public elementTitle = '';

    private _element: Integer = EnumExplicitElementsArrayElementUiActionNgDirective.undefinedElement;

    protected get element() { return this._element; }

    initialiseEnum(action: EnumExplicitElementsArrayUiAction, element: Integer) {
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

export namespace EnumExplicitElementsArrayElementUiActionNgDirective {
    export const undefinedElement = -1;
}
