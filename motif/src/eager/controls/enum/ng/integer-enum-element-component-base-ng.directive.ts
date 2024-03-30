/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectorRef, Directive, ElementRef } from '@angular/core';
import { EnumUiAction, Integer, SettingsService } from '@motifmarkets/motif-core';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';
import { EnumElementComponentBaseNgDirective } from './enum-element-component-base-ng.directive';

@Directive()
export abstract class IntegerEnumElementComponentBaseNgDirective extends EnumElementComponentBaseNgDirective<Integer> {
    constructor(
        elRef: ElementRef<HTMLElement>,
        typeInstanceCreateId: Integer,
        cdr: ChangeDetectorRef,
        settingsService: SettingsService,
        stateColorItemIdArray: ControlComponentBaseNgDirective.ReadonlyStateColorItemIdArray,
    ) {
        super(elRef, typeInstanceCreateId, cdr, settingsService, stateColorItemIdArray, EnumUiAction.integerUndefinedValue);
    }
}
