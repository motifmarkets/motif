/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { BooleanUiAction, EnumUiAction, ExplicitElementsEnumArrayUiAction, ScanFormula, StringId, Strings } from '@motifmarkets/motif-core';
import { IdentifiableComponent } from 'component-internal-api';
import { CaptionLabelNgComponent, CaptionedCheckboxNgComponent, EnumArrayInputNgComponent } from 'controls-ng-api';
import { ScanFieldConditionOperandsEditorNgDirective } from '../../ng/ng-api';
import { CurrencyOverlapsScanFieldConditionOperandsEditorFrame } from '../currency-overlaps-scan-field-condition-operands-editor-frame';
import { CommandRegisterNgService } from 'component-services-ng-api';

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
    private readonly _valuesUiAction: ExplicitElementsEnumArrayUiAction;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken) frame: CurrencyOverlapsScanFieldConditionOperandsEditorNgComponent.Frame,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.modifierRootInjectionToken) modifierRoot: IdentifiableComponent,
    ) {
        super(elRef, ++CurrencyOverlapsScanFieldConditionOperandsEditorNgComponent.typeInstanceCreateCount, cdr, commandRegisterNgService, frame, modifierRoot);

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
        const action = new ExplicitElementsEnumArrayUiAction();
        action.pushCaption(Strings[StringId.CurrencyEnumScanFieldConditionOperandsCaption_Values]);
        action.pushTitle(Strings[StringId.CurrencyEnumScanFieldConditionOperandsTitle_Values]);
        const ids = ScanFormula.IsNode.Category.allIds;
        const elementPropertiesArray = ids.map<EnumUiAction.ElementProperties>(
            (id) => ({
                    element: id,
                    caption: ScanFormula.IsNode.Category.idToCaption(id),
                    title: ScanFormula.IsNode.Category.idToTitle(id),
                }
            )
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => {
            this._frame.setValues(this._valuesUiAction.definedValue, this._modifier);
        }

        return action;
    }

    private createNotUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.Not]);
        action.pushTitle(Strings[StringId.ScanFieldConditionOperandsEditor_NotIsCategory]);
        action.commitEvent = () => {
            this._frame.negateOperator(this._modifier);
        };

        return action;
    }
}

export namespace CurrencyOverlapsScanFieldConditionOperandsEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = CurrencyOverlapsScanFieldConditionOperandsEditorFrame;
}
