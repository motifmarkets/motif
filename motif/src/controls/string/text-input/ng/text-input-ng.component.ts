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
    private static typeInstanceCreateCount = 0;

    @Input() inputId: string;
    @Input() size = '20'; // same as HTML default

    @ViewChild('textInput', { static: true }) private _textInput: ElementRef<HTMLInputElement>;

    public displayValue = '';

    private _pushTextEventsSubscriptionId: MultiEvent.SubscriptionId;

    constructor(elRef: ElementRef<HTMLElement>, private _renderer: Renderer2, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(elRef, ++TextInputNgComponent.typeInstanceCreateCount, cdr, settingsNgService.service, ControlComponentBaseNgDirective.textControlStateColorItemIdArray);
        this.inputId = 'TextInput' + this.typeInstanceId;
    }

    public override get uiAction() { return super.uiAction as StringUiAction; }

    focus() {
        // this does not work.  needs further investigation
        // const element = this._renderer.selectRootElement('symbolInput');
        // element.focus();
    }

    onInput(value: string): void {
        if (this.uiAction.stateId !== UiAction.StateId.Readonly) {
            this.input(value);
        }
    }

    onEnterKeyDown(value: string): void {
        if (this.uiAction.stateId !== UiAction.StateId.Readonly) {
            this.commitValue(value, UiAction.CommitTypeId.Explicit);
        }
    }

    onBlur(value: string): void {
        if (this.uiAction.stateId !== UiAction.StateId.Readonly) {
            this.commitValue(value, UiAction.CommitTypeId.Implicit);
        }
    }

    onEscKeyDown(): void {
        this.uiAction.cancelEdit();
    }

    protected override setUiAction(action: StringUiAction) {
        super.setUiAction(action);

        const pushEventHandlersInterface: StringUiAction.PushEventHandlersInterface = {
            value: (value, edited) => this.handleValuePushEvent(value, edited)
        };
        this._pushTextEventsSubscriptionId = this.uiAction.subscribePushEvents(pushEventHandlersInterface);

        this.applyValue(action.value, action.edited);
    }

    protected override finalise() {
        this.uiAction.unsubscribePushEvents(this._pushTextEventsSubscriptionId);
        super.finalise();
    }

    private handleValuePushEvent(value: string | undefined, edited: boolean) {
        this.applyValue(value, edited);
    }

    private applyValue(value: string | undefined, edited: boolean) {
        if (!edited) {
            let displayValue: string;
            if (value === undefined) {
                displayValue = '';
            } else {
                displayValue = value;
            }

            this.applyValueAsString(displayValue);
        }
    }

    private applyValueAsString(displayValue: string) {
        // hack to get around value attribute change detection not working
        if (displayValue === this.displayValue) {
            this._textInput.nativeElement.value = displayValue;
            // this._renderer.setProperty(this._dateInput, 'value', dateAsStr);
        }

        this.displayValue = displayValue;
        this.markForCheck();
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
