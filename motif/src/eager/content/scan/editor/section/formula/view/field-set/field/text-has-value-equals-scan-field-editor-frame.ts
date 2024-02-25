/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ScanField, ScanFieldCondition, ScanFormula, TextHasValueEqualsScanField, UnreachableCaseError } from '@motifmarkets/motif-core';
import { HasValueTextHasValueEqualsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame, TextHasValueEqualsScanFieldConditionEditorFrame, ValueTextHasValueEqualsScanFieldConditionEditorFrame } from './condition/internal-api';
import { NotSubbedScanFieldEditorFrame } from './not-subbed-scan-field-editor-frame';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class TextHasValueEqualsScanFieldEditorFrame extends NotSubbedScanFieldEditorFrame implements TextHasValueEqualsScanField {
    declare readonly typeId: TextHasValueEqualsScanFieldEditorFrame.ScanFieldTypeId;
    declare readonly fieldId: TextHasValueEqualsScanFieldEditorFrame.ScanFormulaFieldId;
    declare readonly conditions: TextHasValueEqualsScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: TextHasValueEqualsScanFieldEditorFrame.ConditionTypeId;

    constructor(
        fieldId: TextHasValueEqualsScanFieldEditorFrame.ScanFormulaFieldId,
        name: string,
    ) {
        super(
            TextHasValueEqualsScanFieldEditorFrame.typeId,
            fieldId,
            name,
            new TextHasValueEqualsScanFieldEditorFrame.conditions(),
            TextHasValueEqualsScanFieldEditorFrame.conditionTypeId,
        );
    }

    override get supportedOperatorIds() { return TextHasValueEqualsScanFieldConditionEditorFrame.supportedOperatorIds; }

    override addCondition(operatorId: TextHasValueEqualsScanFieldEditorFrame.OperatorId, modifier: ScanFieldEditorFrame.Modifier) {
        const conditionEditorFrame = this.createCondition(operatorId);
        this.conditions.add(conditionEditorFrame, modifier);
    }

    private createCondition(operatorId: TextHasValueEqualsScanFieldEditorFrame.OperatorId): TextHasValueEqualsScanFieldConditionEditorFrame {
        switch (operatorId) {
            case ScanFieldCondition.OperatorId.HasValue:
            case ScanFieldCondition.OperatorId.NotHasValue:
                return new HasValueTextHasValueEqualsScanFieldConditionEditorFrame(operatorId);
            case ScanFieldCondition.OperatorId.Equals:
            case ScanFieldCondition.OperatorId.NotEquals:
                return new ValueTextHasValueEqualsScanFieldConditionEditorFrame(operatorId, '');
            default:
                throw new UnreachableCaseError('THVESFEFCC22298', operatorId);
        }
    }
}

export namespace TextHasValueEqualsScanFieldEditorFrame {
    export const typeId = ScanField.TypeId.TextHasValueEquals;
    export type ScanFieldTypeId = typeof typeId;
    export type ScanFormulaFieldId = ScanFormula.TextHasValueEqualsFieldId;
    export type Conditions = ScanFieldConditionEditorFrame.List<TextHasValueEqualsScanFieldConditionEditorFrame>;
    export const conditions = ScanFieldConditionEditorFrame.List<TextHasValueEqualsScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.TextHasValueEquals;
    export const conditionTypeId = ScanFieldCondition.TypeId.TextHasValueEquals;
    export type OperatorId = TextHasValueEqualsScanFieldConditionEditorFrame.OperatorId;
}
