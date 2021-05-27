/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, Renderer2 } from '@angular/core';
import { SettingsNgService } from 'src/component-services/ng-api';
import { UiAction } from 'src/core/internal-api';
import { concatenateElementToArrayUniquely, Integer, subtractElementFromArrayUniquely } from 'src/sys/internal-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { EnumArrayElementComponentBaseNgDirective } from '../../ng/enum-array-element-component-base-ng.directive';

@Component({
    selector: 'app-enum-array-checkbox',
    templateUrl: './enum-array-checkbox-ng.component.html',
    styleUrls: ['./enum-array-checkbox-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnumArrayCheckboxNgComponent extends EnumArrayElementComponentBaseNgDirective implements OnDestroy {
    @Input() checked = false;

    public checkboxDisabled = true;

    constructor(private _renderer: Renderer2, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(cdr, settingsNgService.settingsService, ControlComponentBaseNgDirective.clickControlStateColorItemIdArray);
        this.inputId = 'EnumArrayCheckbox' + this.instanceNumber.toString(10);
    }

    ngOnDestroy() {
        this.finalise();
    }

    onChange(checked: boolean) {
        const oldValue = this.uiAction.value;
        let newValue: Integer[];
        if (checked) {
            if (oldValue === undefined) {
                newValue = [this.element];
            } else {
                newValue = concatenateElementToArrayUniquely(oldValue, this.element);
            }
        } else {
            if (oldValue === undefined) {
                newValue = []; // control always makes value defined
            } else {
                newValue = subtractElementFromArrayUniquely(oldValue, this.element);
            }
        }

        this.commitValue(newValue);
    }

    protected applyValue(value: Integer[] | undefined) {
        super.applyValue(value);
        const newChecked = value === undefined ? false : value.includes(this.element);

        if (newChecked !== this.checked) {
            this.checked = newChecked;
            this.markForCheck();
        }
    }

    protected applyStateId(newStateId: UiAction.StateId) {
        super.applyStateId(newStateId);
    }

    protected applyFilter(filter: Integer[] | undefined) {
        super.applyFilter(filter);
        this.updateCheckboxDisabled();
    }

    protected applyElements() {
        super.applyElements();
        this.updateCheckboxDisabled();
    }

    protected finalise() {
        super.finalise();
    }

    private updateCheckboxDisabled() {
        const filter = this.uiAction.filter;
        this.checkboxDisabled = this.disabled || (filter !== undefined && !filter.includes(this.element));
    }
}
