/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { BooleanUiAction, Currency, EnumMappedExplicitElementsArrayUiAction, EnumUiAction, StringId, Strings } from '@motifmarkets/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { SettingsNgService } from 'component-services-ng-api';
import { CaptionLabelNgComponent, CaptionedCheckboxNgComponent, EnumArrayInputNgComponent } from 'controls-ng-api';
import { ScanFieldConditionOperandsEditorNgDirective } from '../../ng/ng-api';
import { CurrencyOverlapsScanFieldConditionOperandsEditorFrame } from '../currency-overlaps-scan-field-condition-operands-editor-frame';

@Component({
    selector: 'app-currency-overlaps-scan-field-condition-operands-editor',
    templateUrl: './currency-overlaps-scan-field-condition-operands-editor-ng.component.html',
    styleUrls: ['./currency-overlaps-scan-field-condition-operands-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyOverlapsScanFieldConditionOperandsEditorNgComponent extends ScanFieldConditionOperandsEditorNgDirective {
    @ViewChild('notControl', { static: true }) private _notControlComponent: CaptionedCheckboxNgComponent;
    @ViewChild('currencyLabel', { static: true }) private _currencyLabelComponent: CaptionLabelNgComponent;
    @ViewChild('currencyControl', { static: true }) private _currencyControlComponent: EnumArrayInputNgComponent;

    declare readonly _frame: CurrencyOverlapsScanFieldConditionOperandsEditorNgComponent.Frame;

    private readonly _notUiAction: BooleanUiAction;
    private readonly _valuesUiAction: EnumMappedExplicitElementsArrayUiAction;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken) frame: CurrencyOverlapsScanFieldConditionOperandsEditorNgComponent.Frame,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.modifierRootInjectionToken) modifierRoot: ComponentInstanceId,
    ) {
        super(elRef, ++CurrencyOverlapsScanFieldConditionOperandsEditorNgComponent.typeInstanceCreateCount, cdr, settingsNgService, frame, modifierRoot);

        this._notUiAction = this.createNotUiAction();
        this._valuesUiAction = this.createValuesUiAction();
        this.pushAll();
    }

    protected override initialise() {
        super.initialise();
        this._notControlComponent.initialise(this._notUiAction);
        this._currencyLabelComponent.initialise(this._valuesUiAction);
        this._currencyControlComponent.initialise(this._valuesUiAction);
    }

    protected override finalise() {
        this._valuesUiAction.finalise();
        this._notUiAction.finalise();
        super.finalise();
    }


    protected override pushAll() {
        this._valuesUiAction.pushValue(this._frame.values);
        this._notUiAction.pushValue(this._frame.not);
        super.pushAll();
    }

    private createValuesUiAction() {
        const action = new EnumMappedExplicitElementsArrayUiAction();
        action.pushCaption(Strings[StringId.CurrencyOverlapsScanFieldConditionOperandsCaption_Values]);
        action.pushTitle(Strings[StringId.CurrencyOverlapsScanFieldConditionOperandsTitle_Values]);
        const ids = Currency.allIds;
        const elementPropertiesArray = ids.map<EnumUiAction.ElementProperties>(
            (id) => ({
                    element: id,
                    caption: Currency.idToCode(id),
                    title: '',
                }
            )
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => {
            if (this._frame.setValues(this._valuesUiAction.definedValue, this._modifier)) {
                this.markForCheck();
            }
        }

        return action;
    }

    private createNotUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.Not]);
        action.pushTitle(Strings[StringId.ScanFieldConditionOperandsEditor_NotOverlaps]);
        action.commitEvent = () => {
            if (this._frame.negateOperator(this._modifier)) {
                this.markForCheck();
            }
        };

        return action;
    }
}

export namespace CurrencyOverlapsScanFieldConditionOperandsEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = CurrencyOverlapsScanFieldConditionOperandsEditorFrame;
}
