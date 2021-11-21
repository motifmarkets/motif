/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { SettingsNgService } from 'src/component-services/ng-api';
import { Integer } from 'src/sys/internal-api';
import { ControlComponentBaseNgDirective } from '../../../../ng/control-component-base-ng.directive';
import { NumberUiActionComponentBaseNgDirective } from '../../../ng/number-ui-action-component-base-ng.directive';
import { IntegerUiActionComponentBaseNgDirective } from '../../ng/integer-ui-action-component-base-ng.directive';

@Component({
    selector: 'app-integer-text-input', // should be xxx-integer-input
    templateUrl: './integer-text-input-ng.component.html',
    styleUrls: ['./integer-text-input-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntegerTextInputNgComponent extends IntegerUiActionComponentBaseNgDirective implements OnInit {
    @Input() inputId: string;
    @Input() size = '12';

    @ViewChild('numberInput', { static: true }) private _numberInput: ElementRef<HTMLInputElement>;

    private _numberInputElement: HTMLInputElement;
    private _oldText: string;
    private _oldSelectionStart: Integer | null;
    private _oldSelectionEnd: Integer | null;

    constructor(cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(cdr, settingsNgService.settingsService, ControlComponentBaseNgDirective.textControlStateColorItemIdArray);
        this.inputId = 'IntegerInput' + this.componentInstanceId;
    }

    ngOnInit() {
        this.setNumberInputElement(this._numberInput.nativeElement);
        this.setInitialiseReady();
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
        if (text.length === 0 || this.isTextOk(text)) {
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
