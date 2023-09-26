/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DateText, DateUiAction, MultiEvent, StringId, Strings, UiAction } from '@motifmarkets/motif-core';
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

    private _pushDateEventsSubscriptionId: MultiEvent.SubscriptionId;

    constructor(elRef: ElementRef<HTMLElement>, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(elRef, ++DateInputNgComponent.typeInstanceCreateCount, cdr, settingsNgService.service, ControlComponentBaseNgDirective.textControlStateColorItemIdArray);
        this.inputId = 'DateInput' + this.typeInstanceId;
    }

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
                dateAsStr = DateText.toStr(value);
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
