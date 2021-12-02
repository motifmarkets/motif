/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, Renderer2, ViewChild } from '@angular/core';
import { MultiEvent, StringUiAction, UiAction } from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';

@Component({
    selector: 'app-text-input', // should be xxx-input-control
    templateUrl: './text-input-ng.component.html',
    styleUrls: ['./text-input-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextInputNgComponent extends ControlComponentBaseNgDirective {
    @Input() inputId: string;
    @Input() size = '20'; // same as HTML default

    @ViewChild('textInput', { static: true }) private _textInput: ElementRef;

    public displayValue = '';

    private _pushTextEventsSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private _renderer: Renderer2, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(cdr, settingsNgService.settingsService, ControlComponentBaseNgDirective.textControlStateColorItemIdArray);
        this.inputId = 'TextInput' + this.componentInstanceId;
    }

    public override get uiAction() { return super.uiAction as StringUiAction; }

    focus() {
        // this does not work.  needs further investigation
        // const element = this._renderer.selectRootElement('symbolInput');
        // element.focus();
    }

    onInput(value: string): void {
        this.input(value);
    }

    onEnterKeyDown(value: string): void {
        this.commitValue(value, UiAction.CommitTypeId.Explicit);
    }

    onBlur(value: string): void {
        this.commitValue(value, UiAction.CommitTypeId.Implicit);
    }

    onEscKeyDown(): void {
        this.uiAction.cancelEdit();
    }

    protected override setUiAction(action: StringUiAction) {
        super.setUiAction(action);

        const pushEventHandlersInterface: StringUiAction.PushEventHandlersInterface = {
            value: (value) => this.handleValuePushEvent(value)
        };
        this._pushTextEventsSubscriptionId = this.uiAction.subscribePushEvents(pushEventHandlersInterface);

        this.applyValue(action.value);
    }

    protected override finalise() {
        this.uiAction.unsubscribePushEvents(this._pushTextEventsSubscriptionId);
        super.finalise();
    }

    private handleValuePushEvent(value: string | undefined) {
        this.applyValue(value);
    }

    private applyValue(value: string | undefined) {
        if (!this.uiAction.edited) {

            let displayValue: string;
            if (value === undefined) {
                displayValue = '';
            } else {
                displayValue = value;
            }

            // hack to get around value attribute change detection not working
            if (displayValue === this.displayValue) {
                this._textInput.nativeElement.value = displayValue;
                // this._renderer.setProperty(this._dateInput, 'value', dateAsStr);
            }

            this.displayValue = displayValue;
            this.markForCheck();
        }
    }

    private input(text: string) {
        this.uiAction.input(text, true, false, undefined);

        if (this.uiAction.commitOnAnyValidInput) {
            this.commitValue(text, UiAction.CommitTypeId.Input);
        }
    }

    private commitValue(value: string, typeId: UiAction.CommitTypeId) {
        this.uiAction.commitValue(value, typeId);
    }
}
