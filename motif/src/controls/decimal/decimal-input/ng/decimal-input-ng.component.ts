/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import {
    AssertInternalError,
    calculateIntlNumberFormatCharParts,
    createNumberGroupCharRemoveRegex,
    DecimalUiAction,
    Integer,
    IntlNumberFormatCharParts, isPartialIntlFormattedNumber,
    newDecimal,
    StringId,
    Strings,
    UiAction,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { Decimal } from 'decimal.js-light';
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
    private _numberFormatCharParts: IntlNumberFormatCharParts;
    private _numberGroupCharRemoveRegex: RegExp | undefined;

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

    protected override applyValue(value: Decimal | undefined, edited: boolean) {
        if (!edited) {
            super.applyValue(value, edited);

            let valueAsString: string;
            if (value === undefined) {
                valueAsString = DecimalInputNgComponent.emptyNumberStr;
            } else {
                const valueAsNumber = value.toNumber();
                valueAsString = this._numberFormat.format(valueAsNumber);
            }

            this.applyValueAsString(valueAsString);
        }
    }

    protected override applyOptions(options: DecimalUiAction.Options) {
        super.applyOptions(options);
        this.updateNumberFormat();
    }

    private applyValueAsString(valueAsString: string) {
        // hack to get around value attribute change detection not working
        if (valueAsString === this.valueAsString && this._decimalInputElement !== undefined) {
            this._decimalInputElement.value = valueAsString;
            // this._renderer.setProperty(this._numberInput, 'value', numberAsStr);
        }

        this.valueAsString = valueAsString;
        this.markForCheck();
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
                throw new UnreachableCaseError('DICCNF23238', this.uiAction.options.useGrouping);
        }

        this._numberFormat = new Intl.NumberFormat(undefined, { useGrouping });
        const partsResult = calculateIntlNumberFormatCharParts(this._numberFormat);
        if (partsResult.isErr()) {
            throw new AssertInternalError('DINCUNFP23238', partsResult.error);
        } else {
            this._numberFormatCharParts = partsResult.value;
            this._numberGroupCharRemoveRegex = createNumberGroupCharRemoveRegex(this._numberFormatCharParts.group);
        }
    }

    private testInputValue(text?: string): boolean {
        text = (text === undefined) ? this._decimalInputElement.value : text;
        if (this.isTextOk(text)) {
            this._oldText = text;
            this._oldSelectionStart = this._decimalInputElement.selectionStart;
            this._oldSelectionEnd = this._decimalInputElement.selectionEnd;
            return true;
        } else {
            const valueAsText = this._oldText === undefined ? '' : this._oldText;
            this.applyValueAsString(valueAsText);
            if (this._oldSelectionStart !== null && this._oldSelectionEnd !== null) {
                this._decimalInputElement.setSelectionRange(this._oldSelectionStart, this._oldSelectionEnd);
            }
            return false;
        }
    }

    private parseString(value: string): DecimalInputNgComponent.ParseStringResult {
        if (this._numberGroupCharRemoveRegex !== undefined) {
            value = value.replace(this._numberGroupCharRemoveRegex, '');
        }
        try {
            const parsedDecimal = newDecimal(value);
            return { parsedDecimal };
        } catch (e) {
            const errorText = `${Strings[StringId.InvalidNumber]}: ${e}`;
            return { errorText };
        }
    }

    private isTextOk(value: string) {
        return isPartialIntlFormattedNumber(value, this._numberFormatCharParts);
    }

    private setDecimalInputElement(value: HTMLInputElement) {
        this._decimalInputElement = value;
        ['keydown', 'keyup', 'mousedown', 'mouseup', 'select', 'contextmenu', 'drop'].forEach((event: string) => {
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
