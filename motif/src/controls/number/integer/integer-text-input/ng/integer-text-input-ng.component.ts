/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Integer } from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
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
    private static typeInstanceCreateCount = 0;

    @Input() inputId: string;
    @Input() size = '12';

    @ViewChild('numberInput', { static: true }) private _numberInput: ElementRef<HTMLInputElement>;

    private _numberInputElement: HTMLInputElement;
    private _oldText: string | undefined;
    private _oldSelectionStart: Integer | null;
    private _oldSelectionEnd: Integer | null;

    constructor(elRef: ElementRef<HTMLElement>, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(
            elRef,
            ++IntegerTextInputNgComponent.typeInstanceCreateCount,
            cdr,
            settingsNgService.service,
            ControlComponentBaseNgDirective.textControlStateColorItemIdArray
        );
        this.inputId = 'IntegerInput' + this.typeInstanceId;
    }

    ngOnInit() {
        this.setNumberInputElement(this._numberInput.nativeElement);
        this.setInitialiseReady();
    }

    protected override applyValue(value: number | undefined, edited: boolean) {
        if (!edited) {
            let numberAsStr: string;
            if (value === undefined) {
                numberAsStr = NumberUiActionComponentBaseNgDirective.emptyNumberStr;
            } else {
                numberAsStr = this.numberFormat.format(value);
                this.numberAsStr = numberAsStr;
            }

            this.applyValueAsString(numberAsStr);
        }
    }

    protected testInputValue(text?: string): boolean {
        text = (text === undefined) ? this._numberInputElement.value : text;
        if (text.length === 0 || this.isTextOk(text)) {
            this._oldText = text;
            this._oldSelectionStart = this._numberInputElement.selectionStart;
            this._oldSelectionEnd = this._numberInputElement.selectionEnd;
            return true;
        } else {
            const valueAsText = this._oldText === undefined ? '' : this._oldText;
            this.applyValueAsString(valueAsText);
            if (this._oldSelectionStart !== null && this._oldSelectionEnd !== null) {
                this._numberInputElement.setSelectionRange(this._oldSelectionStart, this._oldSelectionEnd);
            }
            return false;
        }
    }

    private applyValueAsString(numberAsStr: string) {
        // hack to get around value attribute change detection not working
        if (numberAsStr === this.numberAsStr && this._numberInputElement !== undefined) {
            this._numberInputElement.value = numberAsStr;
            // this._renderer.setProperty(this._numberInput, 'value', numberAsStr);
        }

        this._oldText = numberAsStr;
        this.numberAsStr = numberAsStr;
        this.markForCheck();
    }

    private setNumberInputElement(value: HTMLInputElement) {
        this._numberInputElement = value;
        ['keydown', 'keyup', 'mousedown', 'mouseup', 'select', 'contextmenu', 'drop'].forEach((event: string) => {
            this._numberInputElement.addEventListener(event, () => this.testInputValue());
        });
    }
}
