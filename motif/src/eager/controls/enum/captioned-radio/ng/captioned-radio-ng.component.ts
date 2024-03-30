/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy } from '@angular/core';
import { Integer, UiAction } from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { IntegerEnumElementComponentBaseNgDirective } from '../../ng/ng-api';

@Component({
    selector: 'app-captioned-radio',
    templateUrl: './captioned-radio-ng.component.html',
    styleUrls: ['./captioned-radio-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CaptionedRadioNgComponent extends IntegerEnumElementComponentBaseNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    @Input() name = '';
    @Input() checked = false;

    public radioDisabled = true;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService
    ) {
        super(
            elRef,
            ++CaptionedRadioNgComponent.typeInstanceCreateCount,
            cdr,
            settingsNgService.service,
            ControlComponentBaseNgDirective.clickControlStateColorItemIdArray
        );
        this.inputId = 'CaptionedRadio' + this.typeInstanceId;
    }

    onChange(checked: boolean) {
        if (checked) {
            this.commitValue(this.element);
        }
    }

    protected override applyValue(value: Integer | undefined, _edited: boolean) {
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
