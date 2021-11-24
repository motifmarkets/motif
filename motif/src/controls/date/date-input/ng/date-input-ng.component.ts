/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { SettingsNgService } from 'component-services-ng-api';
import { DateUiAction, UiAction } from 'core-internal-api';
import { StringId, Strings } from 'res-internal-api';
import { DateText, MultiEvent } from 'sys-internal-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';

@Component({
    selector: 'app-date-input',
    templateUrl: './date-input-ng.component.html',
    styleUrls: ['./date-input-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateInputNgComponent extends ControlComponentBaseNgDirective {
    @Input() size = '12';
    @Input() inputId: string;

    @ViewChild('dateInput', { static: true }) private _dateInput: ElementRef;

    public dateAsStr = DateInputNgComponent.emptyDateStr;

    private _pushDateEventsSubscriptionId: MultiEvent.SubscriptionId;

    constructor(cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(cdr, settingsNgService.settingsService, ControlComponentBaseNgDirective.textControlStateColorItemIdArray);
        this.inputId = 'DateInput' + this.componentInstanceId;
    }

    public override get uiAction() { return super.uiAction as DateUiAction; }

    onInput(value: string): void {
        this.input(value);
        this.setInitialiseReady();
    }

    onEnterKeyDown(text: string): void {
        this.tryCommitText(text, UiAction.CommitTypeId.Explicit);
    }

    onBlur(text: string): void {
        this.tryCommitText(text, UiAction.CommitTypeId.Implicit);
    }

    protected override pushSettings() {
        super.pushSettings();
        this.applyValue(this.uiAction.value);
    }

    protected override setUiAction(action: DateUiAction) {
        super.setUiAction(action);

        const pushEventHandlersInterface: DateUiAction.PushEventHandlersInterface = {
            value: (value) => this.handleValuePushEvent(value)
        };
        this._pushDateEventsSubscriptionId = this.uiAction.subscribePushEvents(pushEventHandlersInterface);

        this.applyValue(action.value);
    }

    protected override finalise() {
        this.uiAction.unsubscribePushEvents(this._pushDateEventsSubscriptionId);
        super.finalise();
    }

    private handleValuePushEvent(value: Date | undefined) {
        this.applyValue(value);
    }

    private applyValue(value: Date | undefined) {
        if (!this.uiAction.edited) {
            let dateAsStr: string;
            if (value === undefined) {
                dateAsStr = DateInputNgComponent.emptyDateStr;
            } else {
                dateAsStr = DateText.toStr(value);
            }

            // hack to get around value attribute change detection not working
            if (dateAsStr === this.dateAsStr) {
                this._dateInput.nativeElement.value = dateAsStr;
                // this._renderer.setProperty(this._dateInput, 'value', dateAsStr);
            }

            this.dateAsStr = dateAsStr;
            this.markForCheck();
        }
    }

    private parseString(value: string): DateInputNgComponent.ParseStringResult {
        const parsedDate = DateText.toDate(value);
        if (parsedDate === undefined) {
            return { errorText: Strings[StringId.InvalidDate] };
        } else {
            return { date: new Date(parsedDate) };
        }
    }

    private input(text: string) {
        let valid: boolean;
        let missing: boolean;
        let value: Date | undefined;
        let errorText: string | undefined;
        if (text !== DateInputNgComponent.emptyDateStr) {
            const parseResult = this.parseString(text);
            value = parseResult.date;
            valid = value !== undefined;
            missing = false;
            errorText = parseResult.errorText;
        } else {
            value = undefined;
            missing = this.uiAction.valueRequired;
            if (missing) {
                valid = false;
                errorText = Strings[StringId.ValueRequired];
            } else {
                valid = true;
                errorText = undefined;
            }
        }

        this.uiAction.input(text, valid, missing, errorText);

        if (valid && this.uiAction.commitOnAnyValidInput) {
            this.commitValue(value, UiAction.CommitTypeId.Input);
        }
    }

    private commitValue(value: Date | undefined, typeId: UiAction.CommitTypeId) {
        this.uiAction.commitValue(value, typeId);
    }

    private tryCommitText(text: string, typeId: UiAction.CommitType.NotInputId) {
        if (text === DateInputNgComponent.emptyDateStr) {
            if (!this.uiAction.valueRequired) {
                this.commitValue(undefined, typeId);
            }
        } else {
            const parseResult = this.parseString(text);
            if (parseResult.date !== undefined) {
                this.commitValue(parseResult.date, typeId);
            }
        }
    }
}

export namespace DateInputNgComponent {
    export const emptyDateStr = '';

    export interface ParseStringResult {
        date?: Date;
        errorText?: string;
    }
}
