/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DateText, DateUiAction, Err, MultiEvent, Ok, Result, StringId, Strings, UiAction } from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';

@Component({
    selector: 'app-date-input',
    templateUrl: './date-input-ng.component.html',
    styleUrls: ['./date-input-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateInputNgComponent extends ControlComponentBaseNgDirective implements OnInit{
    private static typeInstanceCreateCount = 0;

    @Input() size = '12';
    @Input() inputId: string;

    @ViewChild('dateInput', { static: true }) private _dateInput: ElementRef<HTMLInputElement>;

    public dateAsStr = DateInputNgComponent.emptyDateStr;

    private _utc = true;
    private _pushDateEventsSubscriptionId: MultiEvent.SubscriptionId;

    constructor(elRef: ElementRef<HTMLElement>, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(elRef, ++DateInputNgComponent.typeInstanceCreateCount, cdr, settingsNgService.service, ControlComponentBaseNgDirective.textControlStateColorItemIdArray);
        this.inputId = 'DateInput' + this.typeInstanceId;
    }

    get utc() { return this._utc; }

    public override get uiAction() { return super.uiAction as DateUiAction; }

    ngOnInit() {
        this.setInitialiseReady();
    }

    onInput(value: string): void {
        if (this.uiAction.stateId !== UiAction.StateId.Readonly) {
            this.input(value);
        }
    }

    onEnterKeyDown(text: string): void {
        if (this.uiAction.stateId !== UiAction.StateId.Readonly) {
            this.tryCommitText(text, UiAction.CommitTypeId.Explicit);
        }
    }

    onBlur(text: string): void {
        if (this.uiAction.stateId !== UiAction.StateId.Readonly) {
            this.tryCommitText(text, UiAction.CommitTypeId.Implicit);
        }
    }

    onChange(text: string): void {
        if (this.uiAction.stateId !== UiAction.StateId.Readonly) {
            this.tryCommitText(text, UiAction.CommitTypeId.Implicit);
        }
    }

    protected override pushSettings() {
        super.pushSettings();
        this.applyValue(this.uiAction.value, this.uiAction.edited);
    }

    protected override setUiAction(action: DateUiAction) {
        super.setUiAction(action);

        const pushEventHandlersInterface: DateUiAction.PushEventHandlersInterface = {
            value: (value, edited) => this.handleValuePushEvent(value, edited)
        };
        this._pushDateEventsSubscriptionId = this.uiAction.subscribePushEvents(pushEventHandlersInterface);

        this.applyValue(action.value, action.edited);
    }

    protected override finalise() {
        this.uiAction.unsubscribePushEvents(this._pushDateEventsSubscriptionId);
        super.finalise();
    }

    private handleValuePushEvent(value: Date | undefined, edited: boolean) {
        this.applyValue(value, edited);
    }

    private applyValue(value: Date | undefined, edited: boolean) {
        if (!edited) {
            let dateAsStr: string;
            if (value === undefined) {
                dateAsStr = DateInputNgComponent.emptyDateStr;
            } else {
                dateAsStr = DateText.fromDate(value, this._utc);
            }

            this.applyValueAsString(dateAsStr);
        }
    }

    private applyValueAsString(dateAsStr: string) {
            // hack to get around value attribute change detection not working
            if (dateAsStr === this.dateAsStr) {
                this._dateInput.nativeElement.value = dateAsStr;
                // this._renderer.setProperty(this._dateInput, 'value', dateAsStr);
            }

            this.dateAsStr = dateAsStr;
            this.markForCheck();
    }

    private parseString(value: string): Result<Date> {
        const parsedDate = DateText.toDate(value, this._utc);
        if (parsedDate === undefined) {
            return new Err(Strings[StringId.InvalidDate]);
        } else {
            return new Ok(parsedDate);
        }
    }

    private input(text: string) {
        let valid: boolean;
        let missing: boolean;
        let value: Date | undefined;
        let errorText: string | undefined;
        if (text !== DateInputNgComponent.emptyDateStr) {
            const parseResult = this.parseString(text);
            if (parseResult.isErr()) {
                errorText = parseResult.error;
            } else {
                value = parseResult.value
            }
            valid = value !== undefined;
            missing = false;
        } else {
            missing = this.uiAction.valueRequired;
            if (missing) {
                valid = false;
                errorText = Strings[StringId.ValueRequired];
            } else {
                valid = true;
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
            if (parseResult.isOk()) {
                this.commitValue(parseResult.value, typeId);
            }
        }
    }
}

export namespace DateInputNgComponent {
    export const emptyDateStr = '';
}
