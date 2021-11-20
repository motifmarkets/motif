/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, Renderer2 } from '@angular/core';
import { SettingsNgService } from 'src/component-services/ng-api';
import { UiAction } from 'src/core/internal-api';
import { Integer } from 'src/sys/internal-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { EnumElementComponentBaseNgDirective } from '../../ng/enum-element-component-base-ng.directive';

@Component({
    selector: 'app-radio-input', // should be xxx-radio
    templateUrl: './radio-input-ng.component.html',
    styleUrls: ['./radio-input-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioInputNgComponent extends EnumElementComponentBaseNgDirective {

    @Input() name = '';
    @Input() checked = false;

    public radioDisabled = true;

    constructor(private _renderer: Renderer2, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(cdr, settingsNgService.settingsService, ControlComponentBaseNgDirective.clickControlStateColorItemIdArray);
        this.inputId = 'Radio' + this.instanceNumber.toString(10);
    }

    onChange(checked: boolean) {
        if (checked) {
            this.commitValue(this.element);
        }
    }

    protected override applyValue(value: Integer | undefined) {
        const newChecked = value === undefined ? false : value === this.element;

        if (newChecked !== this.checked) {
            this.checked = newChecked;
            this.markForCheck();
        }
    }

    protected override applyStateId(newStateId: UiAction.StateId) {
        super.applyStateId(newStateId);
        this.updateRadioDisabled();
    }

    protected override applyFilter(filter: Integer[] | undefined) {
        super.applyFilter(filter);
        this.updateRadioDisabled();
    }

    protected override applyElements() {
        super.applyElements();
        this.updateRadioDisabled();
    }

    protected override finalise() {
        super.finalise();
    }

    private updateRadioDisabled() {
        const filter = this.uiAction.filter;
        this.radioDisabled = this.disabled || this.readonly || (filter !== undefined && !filter.includes(this.element));
    }
}
