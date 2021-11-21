/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { SettingsNgService } from 'src/component-services/ng-api';
import { BooleanUiAction, UiAction } from 'src/core/internal-api';
import { MultiEvent } from 'src/sys/internal-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';

@Component({
  selector: 'app-checkbox-input', // should be xxx-checkbox
  templateUrl: './checkbox-input-ng.component.html',
  styleUrls: ['./checkbox-input-ng.component.scss'],

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxInputNgComponent extends ControlComponentBaseNgDirective implements OnInit {
    @Input() checked = false;
    @Input() inputId: string;

    @ViewChild('checkboxInput', { static: true }) private _checkboxInput: ElementRef;

    private _pushCheckboxEventsSubscriptionId: MultiEvent.SubscriptionId;

    constructor(cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(cdr, settingsNgService.settingsService, ControlComponentBaseNgDirective.clickControlStateColorItemIdArray);
        this.inputId = 'Checkbox' + this.componentInstanceId;
    }

    public override get uiAction() { return super.uiAction as BooleanUiAction; }

    ngOnInit() {
        this.setInitialiseReady();
    }

    onChange(checked: boolean) {
        this.commitValue(checked);
    }

    protected override setUiAction(action: BooleanUiAction) {
        super.setUiAction(action);

        const pushEventHandlersInterface: BooleanUiAction.PushEventHandlersInterface = {
            value: (value) => this.handleValuePushEvent(value)
        };
        this._pushCheckboxEventsSubscriptionId = this.uiAction.subscribePushEvents(pushEventHandlersInterface);

        this.applyValue(action.value);
    }

    protected override finalise() {
        this.uiAction.unsubscribePushEvents(this._pushCheckboxEventsSubscriptionId);
        super.finalise();
    }

    private handleValuePushEvent(value: boolean | undefined) {
        this.applyValue(value);
    }

    private applyValue(value: boolean | undefined) {
        if (value === undefined) {
            this._checkboxInput.nativeElement.indeterminate = true;
        } else {
            this._checkboxInput.nativeElement.indeterminate = false;
            this.checked = value;
        }
        this.markForCheck();
    }

    private commitValue(value: boolean) {
        this.uiAction.commitValue(value, UiAction.CommitTypeId.Explicit);
    }
}
