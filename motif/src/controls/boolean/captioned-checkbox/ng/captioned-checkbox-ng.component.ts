/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    Renderer2,
    ViewChild
} from '@angular/core';
import { SettingsNgService } from 'src/component-services/ng-api';
import { BooleanUiAction, UiAction } from 'src/core/internal-api';
import { MultiEvent } from 'src/sys/internal-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';

@Component({
    selector: 'app-captioned-checkbox',
    templateUrl: './captioned-checkbox-ng.component.html',
    styleUrls: ['./captioned-checkbox-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaptionedCheckboxNgComponent
    extends ControlComponentBaseNgDirective
    implements OnInit, OnDestroy {
    @Input() checked = false;
    @Input() inputId: string;

    @ViewChild('checkboxInput', { static: true })
    private _checkboxInput: ElementRef;

    private _pushCheckboxEventsSubscriptionId: MultiEvent.SubscriptionId;

    public get uiAction() {
        return super.uiAction as BooleanUiAction;
    }

    constructor(
        private _renderer: Renderer2,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService
    ) {
        super(
            cdr,
            settingsNgService.settingsService,
            ControlComponentBaseNgDirective.clickControlStateColorItemIdArray
        );
        this.inputId = 'CaptionedCheckbox' + this.instanceNumber.toString(10);
    }

    ngOnInit() {
        this.setInitialiseReady();
    }

    ngOnDestroy() {
        this.finalise();
    }

    onChange(checked: boolean) {
        this.commitValue(checked);
    }

    protected setUiAction(action: BooleanUiAction) {
        super.setUiAction(action);

        const pushEventHandlersInterface: BooleanUiAction.PushEventHandlersInterface = {
            value: (value) => this.handleValuePushEvent(value),
        };
        this._pushCheckboxEventsSubscriptionId = this.uiAction.subscribePushEvents(
            pushEventHandlersInterface
        );

        this.applyValue(action.value);
    }

    protected finalise() {
        this.uiAction.unsubscribePushEvents(
            this._pushCheckboxEventsSubscriptionId
        );
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
