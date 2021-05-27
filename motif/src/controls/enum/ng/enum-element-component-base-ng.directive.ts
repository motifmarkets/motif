/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Directive } from '@angular/core';
import { EnumUiAction } from 'src/core/internal-api';
import { Integer } from 'src/sys/internal-api';
import { EnumComponentBaseNgDirective } from './enum-component-base-ng.directive';

@Directive()
export abstract class EnumElementComponentBaseNgDirective extends EnumComponentBaseNgDirective {
    public elementCaption = '';
    public elementTitle = '';

    private _element: Integer = EnumUiAction.undefinedElement;

    protected get element() { return this._element; }

    initialiseEnum(action: EnumUiAction, element: Integer) {
        this._element = element;
        this.initialise(action);
        this.applyElements();
    }

    protected applyElementTitle(element: Integer, title: string) {
        super.applyElementTitle(element, title);
        if (element === this.element && title !== this.elementTitle) {
            this.elementTitle = title;
            this.markForCheck();
        }
    }

    protected applyElementCaption(element: Integer, caption: string) {
        super.applyElementCaption(element, caption);
        if (element === this.element && caption !== this.elementCaption) {
            this.elementCaption = caption;
            this.applyCaption(caption);
            this.markForCheck();
        }
    }

    protected applyElements() {
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
