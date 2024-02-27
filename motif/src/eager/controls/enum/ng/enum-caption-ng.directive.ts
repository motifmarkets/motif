/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectorRef, Directive, ElementRef, Input, OnDestroy } from '@angular/core';
import { Integer, SettingsService } from '@motifmarkets/motif-core';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';
import { EnumComponentBaseNgDirective } from './enum-component-base-ng.directive';

@Directive()
export class EnumCaptionNgComponent<T> extends EnumComponentBaseNgDirective<T> implements OnDestroy {
    @Input() for: string;

    constructor(elRef: ElementRef<HTMLElement>, typeInstanceCreateId: Integer, cdr: ChangeDetectorRef, settingsService: SettingsService, undefinedValue: T,) {
        super(
            elRef,
            typeInstanceCreateId,
            cdr,
            settingsService,
            ControlComponentBaseNgDirective.labelStateColorItemIdArray,
            undefinedValue,
        );
    }

    override ngOnDestroy() {
        this.finalise();
    }

    protected override applyValue(_value: T | undefined, _edited: boolean) {
        this.markForCheck();
    }
}
