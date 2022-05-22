/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectorRef, Directive } from '@angular/core';
import {
    calculateNumberFormatCharParts,
    createNumberGroupCharRemoveRegex,
    MultiEvent,
    NumberUiAction,
    SettingsService,
    StringId,
    Strings,
    UiAction,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';

@Directive()
export abstract class NumberUiActionComponentBaseNgDirective extends ControlComponentBaseNgDirective {
    public numberAsStr = NumberUiActionComponentBaseNgDirective.emptyNumberStr;
    public max?: number;
    public min?: number;
    public step?: number;

    private _numberFormat: Intl.NumberFormat = new Intl.NumberFormat(undefined, { useGrouping: false });
    private _numberFormatGroupChar: string | undefined; // character used to separate thousands in numbers
    private _numberFormatDecimalChar: string; // character used as decimal point
    private _numberGroupCharRemoveRegex: RegExp | undefined;
    private _pushNumberEventsSubscriptionId: MultiEvent.SubscriptionId;

    constructor(cdr: ChangeDetectorRef, settingsService: SettingsService,
        stateColorItemIdArray: ControlComponentBaseNgDirective.StateColorItemIdArray) {
        super(cdr, settingsService, stateColorItemIdArray);
    }

    public override get uiAction() { return super.uiAction as NumberUiAction; }

    protected get numberFormat() { return this._numberFormat; }
    protected get numberFormatGroupChar() { return this._numberFormatGroupChar; }
    protected get numberFormatDecimalChar() { return this._numberFormatDecimalChar; }
    protected get numberGroupCharRemoveRegex() { return this._numberGroupCharRemoveRegex; }

    onInput(value: string): void {
        if (this.uiAction.stateId !== UiAction.StateId.Readonly && this.testInputValue(value)) {
            this.input(value);
        }
    }

    onEnterKeyDown(text: string): void {
        if (this.uiAction.stateId !== UiAction.StateId.Readonly && this.testInputValue(text)) {
            this.tryCommitText(text, UiAction.CommitTypeId.Explicit);
        }
    }

    onBlur(text: string): void {
        if (this.uiAction.stateId !== UiAction.StateId.Readonly && this.testInputValue(text)) {
            this.tryCommitText(text, UiAction.CommitTypeId.Implicit);
        }
    }

    onEscKeyDown(): void {
        this.uiAction.cancelEdit();
    }

    protected tryCommitText(text: string, typeId: UiAction.CommitType.NotInputId) {
        if (text === NumberUiActionComponentBaseNgDirective.emptyNumberStr) {
            if (!this.uiAction.valueRequired) {
                this.commitValue(undefined, typeId);
            }
        } else {
            const parseResult = this.parseString(text);
            if (parseResult.parsedNumber !== undefined) {
                this.commitValue(parseResult.parsedNumber, typeId);
            }
        }
    }

    // protected override markForCheck() {
    //     super.markForCheck();
    // }

    protected override pushSettings() {
        super.pushSettings();
        this.applyOptions(this.uiAction.options);
        this.applyValue(this.uiAction.value, this.uiAction.edited);
    }

    protected override setUiAction(action: NumberUiAction) {
        super.setUiAction(action);

        const pushEventHandlersInterface: NumberUiAction.PushEventHandlersInterface = {
            value: (value, edited) => this.handleValuePushEvent(value, edited),
            options: (options) => this.handleOptionsPushEvent(options),
        };
        this._pushNumberEventsSubscriptionId = this.uiAction.subscribePushEvents(pushEventHandlersInterface);

        this.applyOptions(action.options);
        this.applyValue(action.value, action.edited);
    }

    protected override finalise() {
        this.uiAction.unsubscribePushEvents(this._pushNumberEventsSubscriptionId);
        super.finalise();
    }

    private handleValuePushEvent(value: number | undefined, edited: boolean) {
        this.applyValue(value, edited);
    }

    private handleOptionsPushEvent(options: NumberUiAction.Options) {
        this.applyOptions(options);
        this.applyValue(this.uiAction.value, this.uiAction.edited);
    }

    private input(text: string) {
        let value: number | undefined;
        let valid: boolean;
        let missing: boolean;
        let errorText: string | undefined;
        if (text !== NumberUiActionComponentBaseNgDirective.emptyNumberStr) {
            const parseResult = this.parseString(text);
            value = parseResult.parsedNumber;
            valid = value !== undefined;
            missing = false;
            errorText = parseResult.errorText;
        } else {
            value = undefined;
            missing = this.uiAction.valueRequired;
            if (missing) {
                errorText = Strings[StringId.ValueRequired];
            } else {
                errorText = undefined;
            }
            valid = errorText === undefined;
        }

        this.uiAction.input(text, valid, missing, errorText);

        if (valid && this.uiAction.commitOnAnyValidInput) {
            this.commitValue(value, UiAction.CommitTypeId.Input);
        }
    }

    private updateNumberFormat() {
        let useGrouping: boolean;
        switch (this.uiAction.options.useGrouping) {
            case true:
                useGrouping = true;
                break;
            case false:
                useGrouping = false;
                break;
            case undefined:
                useGrouping = this.coreSettings.format_NumberGroupingActive;
                break;
            default:
                throw new UnreachableCaseError('NUAICCNF43439', this.uiAction.options.useGrouping);
        }
        const numberFormat = new Intl.NumberFormat(undefined, { useGrouping });
        this._numberFormat = numberFormat;

        const parts = calculateNumberFormatCharParts(numberFormat);
        this._numberFormatDecimalChar = parts.decimal;
        this._numberFormatGroupChar = parts.group;
        this._numberGroupCharRemoveRegex = createNumberGroupCharRemoveRegex(this._numberFormatGroupChar);
        this.updateTestRegex();
/*        const formattedDecimalNumber = numberFormat.format(2.3);
        const decimalCharCount = formattedDecimalNumber.length;
        for (let i = decimalCharCount - 1; i >= 0; i--) {
            const charCode = formattedDecimalNumber.charCodeAt(i);
            if (!isDigit(charCode)) {
                this._numberFormatDecimalChar = formattedDecimalNumber[i];
                break;
            }
        }

        if (this._numberFormatDecimalChar === undefined) {
            throw new AssertInternalError('NUACBNDUNF98332', formattedDecimalNumber);
        } else {
            this._numberFormatUseGroupingChar = undefined;
            if (useGrouping) {
                const formattedGroupableNumber = numberFormat.format(123456);
                const groupingCharCount = formattedGroupableNumber.length;
                for (let i = 0; i < groupingCharCount; i++) {
                    const charCode = formattedGroupableNumber.charCodeAt(i);
                    if (!isDigit(charCode)) {
                        this._numberFormatUseGroupingChar = formattedGroupableNumber[i];
                        break;
                    }
                }
            }

        }*/
    }

    private applyOptions(options: NumberUiAction.Options) {
        this.max = options.max;
        this.min = options.min;
        this.step = options.step;
        this.updateNumberFormat();
    }

    private commitValue(value: number | undefined, typeId: UiAction.CommitTypeId) {
        this.uiAction.commitValue(value, typeId);
    }

    protected abstract parseString(value: string): NumberUiActionComponentBaseNgDirective.ParseStringResult;
    protected abstract testInputValue(text?: string): boolean;
    protected abstract updateTestRegex(): void;
    protected abstract applyValue(value: number | undefined, edited: boolean): void;
}

export namespace NumberUiActionComponentBaseNgDirective {
    export const emptyNumberStr = '';

    export interface ParseStringResult {
        parsedNumber?: number | undefined;
        errorText?: string;
    }
}
