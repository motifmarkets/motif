/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectorRef, Directive } from '@angular/core';
import { MultiEvent, NumberUiAction, SettingsService, StringId, Strings, UiAction, UnreachableCaseError } from '@motifmarkets/motif-core';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';

@Directive()
export abstract class NumberUiActionComponentBaseNgDirective extends ControlComponentBaseNgDirective {
    public numberAsStr = NumberUiActionComponentBaseNgDirective.emptyNumberStr;
    public max?: number;
    public min?: number;
    public step?: number;

    private _numberFormat: Intl.NumberFormat = new Intl.NumberFormat(undefined, { useGrouping: false });
    private _pushNumberEventsSubscriptionId: MultiEvent.SubscriptionId;

    constructor(cdr: ChangeDetectorRef, settingsService: SettingsService,
        stateColorItemIdArray: ControlComponentBaseNgDirective.StateColorItemIdArray) {
        super(cdr, settingsService, stateColorItemIdArray);
    }

    public override get uiAction() { return super.uiAction as NumberUiAction; }

    protected get numberFormat() { return this._numberFormat; }

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

    onEscKeyDown(): void {
        this.uiAction.cancelEdit();
    }

    protected input(text: string) {
        if (this.isTextOk(text)) {
            // If text was not ok, then this input will discarded and the previous text will be retained in the control
            let value: number | undefined;
            let valid: boolean;
            let missing: boolean;
            let errorText: string | undefined;
            if (text !== '') {
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

    protected override markForCheck() {
        super.markForCheck();
    }

    protected override pushSettings() {
        super.pushSettings();
        this.applyOptions(this.uiAction.options);
        this.applyValue(this.uiAction.value);
    }

    protected override setUiAction(action: NumberUiAction) {
        super.setUiAction(action);

        const pushEventHandlersInterface: NumberUiAction.PushEventHandlersInterface = {
            value: (value) => this.handleValuePushEvent(value),
            options: (options) => this.handleOptionsPushEvent(options),
        };
        this._pushNumberEventsSubscriptionId = this.uiAction.subscribePushEvents(pushEventHandlersInterface);

        this.applyOptions(action.options);
        this.applyValue(action.value);
    }

    protected override finalise() {
        this.uiAction.unsubscribePushEvents(this._pushNumberEventsSubscriptionId);
        super.finalise();
    }

    private handleValuePushEvent(value: number | undefined) {
        this.applyValue(value);
    }

    private handleOptionsPushEvent(options: NumberUiAction.Options) {
        this.applyOptions(options);
        this.applyValue(this.uiAction.value);
    }

    private calculateNumberFormat() {
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
        return new Intl.NumberFormat(undefined, { useGrouping });
    }

    private applyOptions(options: NumberUiAction.Options) {
        this.max = options.max;
        this.min = options.min;
        this.step = options.step;
        this._numberFormat = this.calculateNumberFormat();
    }

    private commitValue(value: number | undefined, typeId: UiAction.CommitTypeId) {
        this.uiAction.commitValue(value, typeId);
    }

    protected abstract parseString(value: string): NumberUiActionComponentBaseNgDirective.ParseStringResult;
    protected abstract isTextOk(text: string): boolean;
    protected abstract applyValue(value: number | undefined): void;
}

export namespace NumberUiActionComponentBaseNgDirective {
    export const emptyNumberStr = '';

    export interface ParseStringResult {
        parsedNumber?: number | undefined;
        errorText?: string;
    }
}
