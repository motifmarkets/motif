/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ScanField, ScanFieldCondition, ScanFormula, TextEqualsScanField, UnreachableCaseError } from '@motifmarkets/motif-core';
import { ScanFieldConditionEditorFrame, TextEqualsScanFieldConditionEditorFrame } from './condition/internal-api';
import { NotSubbedScanFieldEditorFrame } from './not-subbed-scan-field-editor-frame';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class TextEqualsScanFieldEditorFrame extends NotSubbedScanFieldEditorFrame implements TextEqualsScanField {
    declare readonly typeId: TextEqualsScanFieldEditorFrame.ScanFieldTypeId;
    declare readonly fieldId: TextEqualsScanFieldEditorFrame.ScanFormulaFieldId;
    declare readonly conditions: TextEqualsScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: TextEqualsScanFieldEditorFrame.ConditionTypeId;

    constructor(
        fieldId: TextEqualsScanFieldEditorFrame.ScanFormulaFieldId,
        name: string,
    ) {
        super(
            TextEqualsScanFieldEditorFrame.typeId,
            fieldId,
            name,
            new TextEqualsScanFieldEditorFrame.conditions(),
            TextEqualsScanFieldEditorFrame.conditionTypeId,
        );
    }

    override get supportedOperatorIds() { return TextEqualsScanFieldConditionEditorFrame.supportedOperatorIds; }

    override addCondition(operatorId: TextEqualsScanFieldEditorFrame.OperatorId, modifier: ScanFieldEditorFrame.Modifier) {
        const conditionEditorFrame = this.createCondition(operatorId);
        this.conditions.add(conditionEditorFrame, modifier);
    }

    private createCondition(operatorId: TextEqualsScanFieldEditorFrame.OperatorId): TextEqualsScanFieldConditionEditorFrame {
        switch (operatorId) {
            case ScanFieldCondition.OperatorId.Equals:
            case ScanFieldCondition.OperatorId.NotEquals:
                return new TextEqualsScanFieldConditionEditorFrame(operatorId, '');
            default:
                throw new UnreachableCaseError('TESFEFCC22298', operatorId);
        }
    }
}

export namespace TextEqualsScanFieldEditorFrame {
    export const typeId = ScanField.TypeId.TextEquals;
    export type ScanFieldTypeId = typeof typeId;
    export type ScanFormulaFieldId = ScanFormula.TextEqualsFieldId;
    export type Conditions = ScanFieldConditionEditorFrame.List<TextEqualsScanFieldConditionEditorFrame>;
    export const conditions = ScanFieldConditionEditorFrame.List<TextEqualsScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.TextEquals;
    export const conditionTypeId = ScanFieldCondition.TypeId.TextEquals;
    export type OperatorId = TextEqualsScanFieldConditionEditorFrame.OperatorId;
}
