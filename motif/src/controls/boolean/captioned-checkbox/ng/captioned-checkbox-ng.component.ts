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
import { BooleanUiAction, MultiEvent, UiAction } from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
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
        this.inputId = 'CaptionedCheckbox' + this.componentInstanceId;
    }

    public override get uiAction() { return super.uiAction as BooleanUiAction; }

    ngOnInit() {
        this.setInitialiseReady();
    }

    override ngOnDestroy() {
        this.finalise();
    }

    onChange(checked: boolean) {
        this.commitValue(checked);
    }

    protected override setUiAction(action: BooleanUiAction) {
        super.setUiAction(action);

        const pushEventHandlersInterface: BooleanUiAction.PushEventHandlersInterface = {
            value: (value, edited) => this.handleValuePushEvent(value, edited),
        };
        this._pushCheckboxEventsSubscriptionId = this.uiAction.subscribePushEvents(
            pushEventHandlersInterface
        );

        this.applyValue(action.value, action.edited);
    }

    protected override finalise() {
        this.uiAction.unsubscribePushEvents(
            this._pushCheckboxEventsSubscriptionId
        );
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
