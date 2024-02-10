/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { NumericInRangeScanField, ScanField, ScanFieldCondition, ScanFormula, UnreachableCaseError } from '@motifmarkets/motif-core';
import { HasValueNumericComparisonScanFieldConditionEditorFrame, NumericComparisonScanFieldConditionEditorFrame, RangeNumericComparisonScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame, ValueNumericComparisonScanFieldConditionEditorFrame } from './condition/internal-api';
import { NotSubbedScanFieldEditorFrame } from './not-subbed-scan-field-editor-frame';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class NumericInRangeScanFieldEditorFrame extends NotSubbedScanFieldEditorFrame implements NumericInRangeScanField {
    declare readonly typeId: NumericInRangeScanFieldEditorFrame.ScanFieldTypeId;
    declare readonly fieldId: NumericInRangeScanFieldEditorFrame.ScanFormulaFieldId;
    declare readonly conditions: NumericInRangeScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: NumericInRangeScanFieldEditorFrame.ConditionTypeId;

    constructor(
        fieldId: NumericInRangeScanFieldEditorFrame.ScanFormulaFieldId,
        name: string,
    ) {
        super(
            NumericInRangeScanFieldEditorFrame.typeId,
            fieldId,
            name,
            new NumericInRangeScanFieldEditorFrame.conditions(),
            NumericInRangeScanFieldEditorFrame.conditionTypeId,
        );
    }

    override get supportedOperatorIds() { return NumericComparisonScanFieldConditionEditorFrame.supportedOperatorIds; }

    override addCondition(operatorId: ScanFieldCondition.OperatorId, modifier: ScanFieldEditorFrame.Modifier) {
        const conditionEditorFrame = this.createCondition(operatorId as NumericInRangeScanFieldEditorFrame.OperatorId);
        this.conditions.add(conditionEditorFrame, modifier);
    }

    private createCondition(operatorId: NumericInRangeScanFieldEditorFrame.OperatorId): NumericComparisonScanFieldConditionEditorFrame {
        switch (operatorId) {
            case ScanFieldCondition.OperatorId.HasValue:
            case ScanFieldCondition.OperatorId.NotHasValue:
                return new HasValueNumericComparisonScanFieldConditionEditorFrame(operatorId);
            case ScanFieldCondition.OperatorId.Equals:
            case ScanFieldCondition.OperatorId.NotEquals:
            case ScanFieldCondition.OperatorId.GreaterThan:
            case ScanFieldCondition.OperatorId.GreaterThanOrEqual:
            case ScanFieldCondition.OperatorId.LessThan:
            case ScanFieldCondition.OperatorId.LessThanOrEqual:
                return new ValueNumericComparisonScanFieldConditionEditorFrame(operatorId, undefined);
            case ScanFieldCondition.OperatorId.InRange:
            case ScanFieldCondition.OperatorId.NotInRange:
                return new RangeNumericComparisonScanFieldConditionEditorFrame(operatorId, undefined, undefined);
            default:
                throw new UnreachableCaseError('NIRSFEFCC22298', operatorId);
        }
    }
}

export namespace NumericInRangeScanFieldEditorFrame {
    export const typeId = ScanField.TypeId.NumericInRange;
    export type ScanFieldTypeId = typeof typeId;
    export type ScanFormulaFieldId = ScanFormula.NumericRangeFieldId;
    export type Conditions = ScanFieldConditionEditorFrame.List<NumericComparisonScanFieldConditionEditorFrame>;
    export const conditions = ScanFieldConditionEditorFrame.List<NumericComparisonScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.NumericComparison;
    export const conditionTypeId = ScanFieldCondition.TypeId.NumericComparison;
    export type OperatorId = NumericComparisonScanFieldConditionEditorFrame.OperatorId;
}
