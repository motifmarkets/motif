/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectorRef, Directive, ElementRef } from '@angular/core';
import { EnumUiAction, Integer, SettingsService } from '@motifmarkets/motif-core';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';
import { EnumComponentBaseNgDirective } from './enum-component-base-ng.directive';

@Directive()
export abstract class EnumElementComponentBaseNgDirective<T> extends EnumComponentBaseNgDirective<T> {
    public elementCaption = '';
    public elementTitle = '';

    private _element: T;

    constructor(
        elRef: ElementRef<HTMLElement>,
        typeInstanceCreateId: Integer,
        cdr: ChangeDetectorRef,
        settingsService: SettingsService,
        stateColorItemIdArray: ControlComponentBaseNgDirective.ReadonlyStateColorItemIdArray,
        undefinedValue: T,
    ) {
        super(elRef, typeInstanceCreateId, cdr, settingsService, stateColorItemIdArray, undefinedValue);
        this._element = undefinedValue;
    }


    protected get element() { return this._element; }

    initialiseEnum(action: EnumUiAction<T>, element: T) {
        this._element = element;
        this.initialise(action);
        this.applyElements();
    }

    protected override applyElementTitle(element: T, title: string) {
        super.applyElementTitle(element, title);
        if (element === this.element && title !== this.elementTitle) {
            this.elementTitle = title;
            this.markForCheck();
        }
    }

    protected override applyElementCaption(element: T, caption: string) {
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
