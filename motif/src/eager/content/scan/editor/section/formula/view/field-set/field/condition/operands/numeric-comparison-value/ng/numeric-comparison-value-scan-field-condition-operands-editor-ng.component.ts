/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { EnumUiAction, ExplicitElementsEnumUiAction, NumberUiAction, NumericComparisonScanFieldCondition, ScanFieldCondition, StringId, Strings } from '@motifmarkets/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { SettingsNgService } from 'component-services-ng-api';
import { CaptionLabelNgComponent, EnumInputNgComponent, NumberInputNgComponent } from 'controls-ng-api';
import { ScanFieldConditionOperandsEditorNgDirective } from '../../ng/ng-api';
import { NumericComparisonValueScanFieldConditionOperandsEditorFrame } from '../numeric-comparison-value-scan-field-condition-operands-editor-frame';

@Component({
    selector: 'app-numeric-comparison-value-scan-field-condition-operands-editor',
    templateUrl: './numeric-comparison-value-scan-field-condition-operands-editor-ng.component.html',
    styleUrls: ['./numeric-comparison-value-scan-field-condition-operands-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumericComparisonValueScanFieldConditionOperandsEditorNgComponent extends ScanFieldConditionOperandsEditorNgDirective {
    // @ViewChild('operatorLabel', { static: true }) private _operatorLabelComponent: CaptionLabelNgComponent;
    @ViewChild('operatorControl', { static: true }) private _operatorControlComponent: EnumInputNgComponent;
    @ViewChild('valueLabel', { static: true }) private _valueLabelComponent: CaptionLabelNgComponent;
    @ViewChild('valueControl', { static: true }) private _valueControlComponent: NumberInputNgComponent;

    declare readonly _frame: NumericComparisonValueScanFieldConditionOperandsEditorNgComponent.Frame;

    private readonly _operatorUiAction: ExplicitElementsEnumUiAction;
    private readonly _valueUiAction: NumberUiAction;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken) frame: NumericComparisonValueScanFieldConditionOperandsEditorNgComponent.Frame,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.modifierRootInjectionToken) modifierRoot: ComponentInstanceId,
    ) {
        super(elRef, ++NumericComparisonValueScanFieldConditionOperandsEditorNgComponent.typeInstanceCreateCount, cdr, settingsNgService, frame, modifierRoot);

        this._operatorUiAction = this.createOperatorUiAction();
        this._valueUiAction = this.createValueUiAction();
        this.pushAll();
    }

    public override get affirmativeOperatorDisplayLines() { return ['']; }

    protected override initialise() {
        super.initialise();
        // this._operatorLabelComponent.initialise(this._operatorUiAction);
        this._operatorControlComponent.initialise(this._operatorUiAction);
        this._valueLabelComponent.initialise(this._valueUiAction);
        this._valueControlComponent.initialise(this._valueUiAction);
    }

    protected override finalise() {
        this._valueUiAction.finalise();
        this._operatorUiAction.finalise();
        super.finalise();
    }


    protected override pushAll() {
        this._valueUiAction.pushValue(this._frame.value);
        this._operatorUiAction.pushValue(this._frame.operatorId);
        super.pushAll();
    }

    private createValueUiAction() {
        const action = new NumberUiAction();
        action.pushCaption(Strings[StringId.ValueScanFieldConditionOperandsCaption_Value]);
        action.pushTitle(Strings[StringId.NumericValueScanFieldConditionOperandsTitle_Value]);
        action.commitEvent = () => {
            if (this._frame.setValue(this._valueUiAction.value, this._modifier)) {
                this.markForCheck();
            }
        }

        return action;
    }

    private createOperatorUiAction() {
        const action = new ExplicitElementsEnumUiAction(false);
        action.pushCaption(Strings[StringId.NumericComparisonValueScanFieldConditionOperandsCaption_Operator]);
        action.pushTitle(Strings[StringId.NumericComparisonValueScanFieldConditionOperandsTitle_Operator]);
        const ids = NumericComparisonScanFieldCondition.ValueOperands.supportedOperatorIds;
        const elementPropertiesArray = ids.map<EnumUiAction.ElementProperties>(
            (id) => ({
                    element: id,
                    caption: ScanFieldCondition.Operator.idToCode(id),
                    title: ScanFieldCondition.Operator.idToDescription(id),
                }
            )
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => {
            if (this._frame.setOperatorId(this._operatorUiAction.definedValue, this._modifier)) {
                this.markForCheck();
            }
        }

        return action;
    }
}

export namespace NumericComparisonValueScanFieldConditionOperandsEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = NumericComparisonValueScanFieldConditionOperandsEditorFrame;
}
