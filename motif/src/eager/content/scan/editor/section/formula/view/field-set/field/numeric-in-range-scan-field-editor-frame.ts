/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeSubscribableComparableList, NumericInRangeScanField, ScanField, ScanFieldCondition, ScanFormula, UnreachableCaseError } from '@motifmarkets/motif-core';
import { HasValueNumericComparisonScanFieldConditionEditorFrame, NumericComparisonScanFieldConditionEditorFrame, RangeNumericComparisonScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame, ValueNumericComparisonScanFieldConditionEditorFrame } from './condition/internal-api';
import { NotSubbedScanFieldEditorFrame } from './not-subbed-scan-field-editor-frame';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class NumericInRangeScanFieldEditorFrame extends NotSubbedScanFieldEditorFrame implements NumericInRangeScanField {
    declare readonly typeId: NumericInRangeScanFieldEditorFrame.TypeId;
    declare readonly fieldId: NumericInRangeScanFieldEditorFrame.FieldId;
    declare readonly conditions: NumericInRangeScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: NumericInRangeScanFieldEditorFrame.ConditionTypeId;

    constructor(
        fieldId: NumericInRangeScanFieldEditorFrame.FieldId,
        name: string,
        deleteMeEventer: ScanFieldEditorFrame.DeleteMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
    ) {
        super(
            NumericInRangeScanFieldEditorFrame.typeId,
            fieldId,
            name,
            new NumericInRangeScanFieldEditorFrame.conditions(),
            NumericInRangeScanFieldEditorFrame.conditionTypeId,
            deleteMeEventer,
            changedEventer,
        );
    }

    override get supportedOperatorIds() { return NumericComparisonScanFieldConditionEditorFrame.supportedOperatorIds; }

    override addCondition(operatorId: ScanFieldCondition.OperatorId) {
        const conditionEditorFrame = this.createCondition(operatorId as NumericInRangeScanFieldEditorFrame.OperatorId);
        this.conditions.add(conditionEditorFrame);
    }

    private createCondition(operatorId: NumericInRangeScanFieldEditorFrame.OperatorId): NumericComparisonScanFieldConditionEditorFrame {
        const { deleteMeEventer, changedEventer } = this.createConditionEditorFrameEventers();
        switch (operatorId) {
            case ScanFieldCondition.OperatorId.HasValue:
            case ScanFieldCondition.OperatorId.NotHasValue:
                return new HasValueNumericComparisonScanFieldConditionEditorFrame(operatorId, deleteMeEventer, changedEventer);
            case ScanFieldCondition.OperatorId.Equals:
            case ScanFieldCondition.OperatorId.NotEquals:
            case ScanFieldCondition.OperatorId.GreaterThan:
            case ScanFieldCondition.OperatorId.GreaterThanOrEqual:
            case ScanFieldCondition.OperatorId.LessThan:
            case ScanFieldCondition.OperatorId.LessThanOrEqual:
                return new ValueNumericComparisonScanFieldConditionEditorFrame(operatorId, undefined, deleteMeEventer, changedEventer);
            case ScanFieldCondition.OperatorId.InRange:
            case ScanFieldCondition.OperatorId.NotInRange:
                return new RangeNumericComparisonScanFieldConditionEditorFrame(operatorId, undefined, undefined, deleteMeEventer, changedEventer);
            default:
                throw new UnreachableCaseError('NIRSFEFCC22298', operatorId);
        }
    }
}

export namespace NumericInRangeScanFieldEditorFrame {
    export type TypeId = ScanField.TypeId.NumericInRange;
    export const typeId = ScanField.TypeId.NumericInRange;
    export type FieldId = ScanFormula.NumericRangeFieldId;
    export type Conditions = ChangeSubscribableComparableList<NumericComparisonScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export const conditions = ChangeSubscribableComparableList<NumericComparisonScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.NumericComparison;
    export const conditionTypeId = ScanFieldCondition.TypeId.NumericComparison;
    export type OperatorId = NumericComparisonScanFieldConditionEditorFrame.OperatorId;
}
