/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    PriceSubbedScanField,
    ScanField,
    ScanFieldCondition,
    ScanFormula,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import {
    HasValueNumericScanFieldConditionEditorFrame,
    NumericScanFieldConditionEditorFrame,
    RangeNumericScanFieldConditionEditorFrame,
    ScanFieldConditionEditorFrame,
    ValueNumericScanFieldConditionEditorFrame,
} from './condition/internal-api';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class PriceSubbedScanFieldEditorFrame extends ScanFieldEditorFrame implements PriceSubbedScanField {
    declare readonly typeId: PriceSubbedScanFieldEditorFrame.ScanFieldTypeId;
    declare readonly fieldId: PriceSubbedScanFieldEditorFrame.ScanFormulaFieldId;
    declare readonly subFieldId: PriceSubbedScanFieldEditorFrame.ScanFormulaSubFieldId;
    declare readonly conditions: PriceSubbedScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: PriceSubbedScanFieldEditorFrame.ConditionTypeId;

    constructor(
        subFieldId: PriceSubbedScanFieldEditorFrame.ScanFormulaSubFieldId,
        name: string,
    ) {
        super(
            PriceSubbedScanFieldEditorFrame.typeId,
            PriceSubbedScanFieldEditorFrame.fieldId,
            subFieldId,
            name,
            new PriceSubbedScanFieldEditorFrame.conditions(),
            PriceSubbedScanFieldEditorFrame.conditionTypeId,
        );
    }

    override get supportedOperatorIds() { return NumericScanFieldConditionEditorFrame.supportedOperatorIds; }

    override addCondition(operatorId: PriceSubbedScanFieldEditorFrame.OperatorId, modifier: ScanFieldEditorFrame.Modifier) {
        const conditionEditorFrame = this.createCondition(operatorId);
        this.conditions.add(conditionEditorFrame, modifier);
    }

    private createCondition(operatorId: PriceSubbedScanFieldEditorFrame.OperatorId): NumericScanFieldConditionEditorFrame {
        switch (operatorId) {
            case ScanFieldCondition.OperatorId.HasValue:
            case ScanFieldCondition.OperatorId.NotHasValue:
                return new HasValueNumericScanFieldConditionEditorFrame(operatorId);
            case ScanFieldCondition.OperatorId.Equals:
            case ScanFieldCondition.OperatorId.NotEquals:
                return new ValueNumericScanFieldConditionEditorFrame(operatorId, undefined);
            case ScanFieldCondition.OperatorId.InRange:
            case ScanFieldCondition.OperatorId.NotInRange:
                return new RangeNumericScanFieldConditionEditorFrame(operatorId, undefined, undefined);
            default:
                throw new UnreachableCaseError('PSSSFEFCC22298', operatorId);
        }
    }
}

export namespace PriceSubbedScanFieldEditorFrame {
    export const typeId = ScanField.TypeId.PriceSubbed;
    export type ScanFieldTypeId = typeof typeId;
    export const fieldId = ScanFormula.FieldId.PriceSubbed;
    export type ScanFormulaFieldId = typeof fieldId;
    export type ScanFormulaSubFieldId = ScanFormula.PriceSubFieldId;
    export type Conditions = ScanFieldConditionEditorFrame.List<NumericScanFieldConditionEditorFrame>;
    export const conditions = ScanFieldConditionEditorFrame.List<NumericScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.Numeric;
    export const conditionTypeId = ScanFieldCondition.TypeId.Numeric;
    export type OperatorId = NumericScanFieldConditionEditorFrame.OperatorId;
}
