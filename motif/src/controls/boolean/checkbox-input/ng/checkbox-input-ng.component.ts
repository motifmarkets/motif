/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { BooleanUiAction, MultiEvent, UiAction } from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';

@Component({
    selector: 'app-checkbox-input', // should be xxx-checkbox
    templateUrl: './checkbox-input-ng.component.html',
    styleUrls: ['./checkbox-input-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxInputNgComponent extends ControlComponentBaseNgDirective implements OnInit {
    private static typeInstanceCreateCount = 0;

    @Input() checked = false;
    @Input() inputId: string;

    @ViewChild('checkboxInput', { static: true }) private _checkboxInput: ElementRef<HTMLInputElement>;

    private _pushCheckboxEventsSubscriptionId: MultiEvent.SubscriptionId;

    constructor(elRef: ElementRef<HTMLElement>, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(elRef, ++CheckboxInputNgComponent.typeInstanceCreateCount, cdr, settingsNgService.service, ControlComponentBaseNgDirective.clickControlStateColorItemIdArray);
        this.inputId = 'Checkbox' + this.typeInstanceId;
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
            value: (value, edited) => this.handleValuePushEvent(value, edited)
        };
        this._pushCheckboxEventsSubscriptionId = this.uiAction.subscribePushEvents(pushEventHandlersInterface);

        this.applyValue(action.value, action.edited);
    }

    protected override finalise() {
        this.uiAction.unsubscribePushEvents(this._pushCheckboxEventsSubscriptionId);
        super.finalise();
    }

    private handleValuePushEvent(value: boolean | undefined, edited: boolean) {
        this.applyValue(value, edited);
    }

    private applyValue(value: boolean | undefined, _edited: boolean) {
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
