/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DecimalUiAction, Integer, StringId, Strings, UiAction, UnreachableCaseError } from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import Decimal from 'decimal.js-light';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { DecimalComponentBaseNgDirective } from '../../ng/decimal-component-base-ng.directive';

@Component({
    selector: 'app-decimal-input',
    templateUrl: './decimal-input-ng.component.html',
    styleUrls: ['./decimal-input-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DecimalInputNgComponent extends DecimalComponentBaseNgDirective implements OnInit {
    @Input() size = '12';
    @Input() inputId: string;

    @ViewChild('numberInput', { static: true }) private _decimalInput: ElementRef<HTMLInputElement>;

    public valueAsString = DecimalInputNgComponent.emptyNumberStr;

    private _numberFormat: Intl.NumberFormat = new Intl.NumberFormat(undefined, { useGrouping: false });

    private _decimalInputElement: HTMLInputElement;
    private _oldText: string;
    private _oldSelectionStart: Integer | null;
    private _oldSelectionEnd: Integer | null;

    constructor(cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(cdr, settingsNgService.settingsService, ControlComponentBaseNgDirective.textControlStateColorItemIdArray);
        this.inputId = 'DecimalInput' + this.componentInstanceId;
    }

    ngOnInit() {
        this.setDecimalInputElement(this._decimalInput.nativeElement);
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

    onEscKeyDown(): void {
        this.uiAction.cancelEdit();
    }

    protected override applyValue(value: Decimal | undefined) {
        if (!this.uiAction.edited) {
            super.applyValue(value);

            let valueAsString: string;
            if (value === undefined) {
                valueAsString = DecimalInputNgComponent.emptyNumberStr;
            } else {
                const valueAsNumber = value.toNumber();
                valueAsString = this._numberFormat.format(valueAsNumber);
            }

            // hack to get around value attribute change detection not working
            if (valueAsString === this.valueAsString && this._decimalInputElement !== undefined) {
                this._decimalInputElement.value = valueAsString;
                // this._renderer.setProperty(this._numberInput, 'value', numberAsStr);
            }

            this.valueAsString = valueAsString;
            this.markForCheck();
        }
    }

    protected override applyOptions(options: DecimalUiAction.Options) {
        super.applyOptions(options);
        this._numberFormat = this.calculateNumberFormat();
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
                throw new UnreachableCaseError('DICCNF232388', this.uiAction.options.useGrouping);
        }
        return new Intl.NumberFormat(undefined, { useGrouping });
    }

    private testInputValue() {
        const text = this._decimalInputElement.value;
        if (this.isTextOk(text)) {
            this._oldText = text;
            this._oldSelectionStart = this._decimalInputElement.selectionStart;
            this._oldSelectionEnd = this._decimalInputElement.selectionEnd;
        } else {
            if (this._oldText !== undefined) {
                this._decimalInputElement.value = this._oldText;
                if (this._oldSelectionStart !== null && this._oldSelectionEnd !== null) {
                    this._decimalInputElement.setSelectionRange(this._oldSelectionStart, this._oldSelectionEnd);
                }
                this.markForCheck();
            }
        }
    }

    private parseString(value: string): DecimalInputNgComponent.ParseStringResult {
        try {
            const parsedDecimal = new Decimal(value);
            return { parsedDecimal };
        } catch (e) {
            const errorText = `${Strings[StringId.InvalidNumber]}: ${e}`;
            return { errorText };
        }
    }

    private isTextOk(text: string): boolean {
        return /^\d*\.?\d*$/.test(text);
    }

    private setDecimalInputElement(value: HTMLInputElement) {
        this._decimalInputElement = value;
        ['input', 'keydown', 'keyup', 'mousedown', 'mouseup', 'select', 'contextmenu', 'drop'].forEach((event: string) => {
            this._decimalInputElement.addEventListener(event, () => this.testInputValue());
        });
    }

    private input(text: string) {
        let valid: boolean;
        let missing: boolean;
        let value: Decimal | undefined;
        let errorText: string | undefined;
        if (text !== DecimalInputNgComponent.emptyNumberStr) {
            const parseResult = this.parseString(text);
            value = parseResult.parsedDecimal;
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

    private tryCommitText(text: string, typeId: UiAction.CommitType.NotInputId) {
        if (text === DecimalInputNgComponent.emptyNumberStr) {
            if (!this.uiAction.valueRequired) {
                this.commitValue(undefined, typeId);
            }
        } else {
            const parseResult = this.parseString(text);
            if (parseResult.parsedDecimal !== undefined) {
                this.commitValue(parseResult.parsedDecimal, typeId);
            }
        }
    }
}


export namespace DecimalInputNgComponent {
    export const emptyNumberStr = '';

    export interface ParseStringResult {
        parsedDecimal?: Decimal | undefined;
        errorText?: string;
    }
}
