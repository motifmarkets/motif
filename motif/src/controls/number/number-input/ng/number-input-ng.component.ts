/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { SettingsNgService } from 'src/component-services/ng-api';
import { StringId, Strings } from 'src/res/internal-api';
import { Integer, isNumberRegex } from 'src/sys/internal-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { NumberUiActionComponentBaseNgDirective } from '../../ng/number-ui-action-component-base-ng.directive';

@Component({
    selector: 'app-number-input',
    templateUrl: './number-input-ng.component.html',
    styleUrls: ['./number-input-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NumberInputNgComponent extends NumberUiActionComponentBaseNgDirective implements OnInit {

    @Input() size = '12';
    @Input() inputId: string;

    @ViewChild('numberInput', { static: true }) private _numberInput: ElementRef<HTMLInputElement>;

    private _numberInputElement: HTMLInputElement;
    private _oldText: string;
    private _oldSelectionStart: Integer | null;
    private _oldSelectionEnd: Integer | null;

    constructor(cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(cdr, settingsNgService.settingsService, ControlComponentBaseNgDirective.textControlStateColorItemIdArray);
        this.inputId = 'NumberInput' + this.instanceNumber.toString(10);
    }

    ngOnInit() {
        this.setNumberInputElement(this._numberInput.nativeElement);
        this.setInitialiseReady();
    }

    protected isTextOk(value: string) {
        return isNumberRegex.test(value);
    }

    protected parseString(value: string): NumberUiActionComponentBaseNgDirective.ParseStringResult {
        const parsedNumber = Number(value);
        if (isNaN(parsedNumber)) {
            return { errorText: Strings[StringId.InvalidNumber] };
        } else {
            return { parsedNumber };
        }
    }

    protected applyValue(value: number | undefined) {
        if (!this.uiAction.edited) {
            let numberAsStr: string;
            if (value === undefined) {
                numberAsStr = NumberUiActionComponentBaseNgDirective.emptyNumberStr;
            } else {
                numberAsStr = this.numberFormat.format(value);
                this.numberAsStr = numberAsStr;
            }

            // hack to get around value attribute change detection not working
            if (numberAsStr === this.numberAsStr && this._numberInputElement !== undefined) {
                this._numberInputElement.value = numberAsStr;
                // this._renderer.setProperty(this._numberInput, 'value', numberAsStr);
            }

            this.numberAsStr = numberAsStr;
            this.markForCheck();
        }
    }

    private setNumberInputElement(value: HTMLInputElement) {
        this._numberInputElement = value;
        ['input', 'keydown', 'keyup', 'mousedown', 'mouseup', 'select', 'contextmenu', 'drop'].forEach((event: string) => {
            this._numberInputElement.addEventListener(event, () => this.testInputValue());
        });
    }

    private testInputValue() {
        const text = this._numberInputElement.value;
        if (this.isTextOk(text) || text.length === 0) {
            this._oldText = text;
            this._oldSelectionStart = this._numberInputElement.selectionStart;
            this._oldSelectionEnd = this._numberInputElement.selectionEnd;
        } else {
            if (this._oldText !== undefined) {
                this._numberInputElement.value = this._oldText;
                if (this._oldSelectionStart !== null && this._oldSelectionEnd !== null) {
                    this._numberInputElement.setSelectionRange(this._oldSelectionStart, this._oldSelectionEnd);
                }
                this.markForCheck();
            }
        }
    }
}
