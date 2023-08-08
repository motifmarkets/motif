/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AdaptedRevgridBehavioredColumnSettings, AssertInternalError, GridField, Integer } from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { DataServer, DatalessViewCell } from 'revgrid';
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

    declare rootHtmlElement: HTMLInputElement;

    dataServer: DataServer<GridField> | undefined;

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

    override tryOpenCell(cell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>, openingKeyDownEvent: KeyboardEvent | undefined, _openingClickEvent: MouseEvent | undefined) {
        const dataServer = this.dataServer;
        if (dataServer === undefined) {
            throw new AssertInternalError('ITINCTOCDU10008')
        } else {
            if (dataServer.getEditValue === undefined) {
                return false;
            } else {
                const key = openingKeyDownEvent !== undefined ? openingKeyDownEvent.key : undefined;
                if (key !== undefined) {
                    // trying to open from key down event
                    const isPrintableKey = key.length === 1 || key === 'Unidentified';
                    if (!isPrintableKey) {
                        return false; // only open if relevant key have been pushed down
                    }
                }

                const result = super.tryOpenCell(cell, openingKeyDownEvent, _openingClickEvent);

                if (result) {
                    if (key !== undefined) {
                        // was opened by keyboard
                        this.rootHtmlElement.value = key;
                    } else {
                        // was not opened by keyboard
                        const value = dataServer.getEditValue(cell.viewLayoutColumn.column.field, cell.viewLayoutRow.subgridRowIndex);
                        if (typeof value !== 'number') {
                            throw new AssertInternalError('ITINCTOCGE10008', typeof value);
                        } else {
                            this.rootHtmlElement.valueAsNumber = value;
                            this.rootHtmlElement.setSelectionRange(0, this.rootHtmlElement.value.length); // selectAll
                        }
                    }
                }

                return result;
            }
        }
    }

    override closeCell(field: GridField, subgridRowIndex: number, cancel: boolean) {
        if (!cancel && !this.readonly) {
            const dataServer = this.dataServer;
            if (dataServer === undefined) {
                throw new AssertInternalError('ITINGCL10008');
            } else {
                if (dataServer.setEditValue !== undefined) {
                    dataServer.setEditValue(field, subgridRowIndex, this.rootHtmlElement.valueAsNumber);
                }
            }
        }
        return super.closeCell(field, subgridRowIndex, cancel);
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
