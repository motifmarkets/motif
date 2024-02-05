/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeSubscribableComparableList, PriceSubbedScanField, ScanField, ScanFieldCondition, ScanFormula, UnreachableCaseError } from '@motifmarkets/motif-core';
import { HasValueNumericScanFieldConditionEditorFrame, NumericScanFieldConditionEditorFrame, RangeNumericScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame, ValueNumericScanFieldConditionEditorFrame } from './condition/internal-api';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class PriceSubbedScanFieldEditorFrame extends ScanFieldEditorFrame implements PriceSubbedScanField {
    declare readonly typeId: PriceSubbedScanFieldEditorFrame.TypeId;
    declare readonly fieldId: PriceSubbedScanFieldEditorFrame.FieldId;
    declare readonly subFieldId: PriceSubbedScanFieldEditorFrame.SubFieldId;
    declare readonly conditions: PriceSubbedScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: PriceSubbedScanFieldEditorFrame.ConditionTypeId;

    constructor(
        subFieldId: PriceSubbedScanFieldEditorFrame.SubFieldId,
        name: string,
        removeMeEventer: ScanFieldEditorFrame.RemoveMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
    ) {
        super(
            PriceSubbedScanFieldEditorFrame.typeId,
            PriceSubbedScanFieldEditorFrame.fieldId,
            subFieldId,
            name,
            new PriceSubbedScanFieldEditorFrame.conditions(),
            PriceSubbedScanFieldEditorFrame.conditionTypeId,
            removeMeEventer,
            changedEventer,
        );
    }

    override get supportedOperatorIds() { return NumericScanFieldConditionEditorFrame.supportedOperatorIds; }

    override addCondition(operatorId: PriceSubbedScanFieldEditorFrame.OperatorId) {
        const conditionEditorFrame = this.createCondition(operatorId);
        this.conditions.add(conditionEditorFrame);
    }

    private createCondition(operatorId: PriceSubbedScanFieldEditorFrame.OperatorId): NumericScanFieldConditionEditorFrame {
        const { removeMeEventer, changedEventer } = this.createConditionEditorFrameEventers();
        switch (operatorId) {
            case ScanFieldCondition.OperatorId.HasValue:
            case ScanFieldCondition.OperatorId.NotHasValue:
                return new HasValueNumericScanFieldConditionEditorFrame(operatorId, removeMeEventer, changedEventer);
            case ScanFieldCondition.OperatorId.Equals:
            case ScanFieldCondition.OperatorId.NotEquals:
                return new ValueNumericScanFieldConditionEditorFrame(operatorId, undefined, removeMeEventer, changedEventer);
            case ScanFieldCondition.OperatorId.InRange:
            case ScanFieldCondition.OperatorId.NotInRange:
                return new RangeNumericScanFieldConditionEditorFrame(operatorId, undefined, undefined, removeMeEventer, changedEventer);
            default:
                throw new UnreachableCaseError('PSSSFEFCC22298', operatorId);
        }
    }
}

export namespace PriceSubbedScanFieldEditorFrame {
    export type TypeId = ScanField.TypeId.PriceSubbed;
    export const typeId = ScanField.TypeId.PriceSubbed;
    export type FieldId = ScanFormula.FieldId.PriceSubbed;
    export const fieldId = ScanFormula.FieldId.PriceSubbed;
    export type SubFieldId = ScanFormula.PriceSubFieldId;
    export type Conditions = ChangeSubscribableComparableList<NumericScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export const conditions = ChangeSubscribableComparableList<NumericScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.Numeric;
    export const conditionTypeId = ScanFieldCondition.TypeId.Numeric;
    export type OperatorId = NumericScanFieldConditionEditorFrame.OperatorId;
}
