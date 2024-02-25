/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ScanField, ScanFieldCondition, ScanFormula, TextContainsScanField, UnreachableCaseError } from '@motifmarkets/motif-core';
import { ScanFieldConditionEditorFrame, TextContainsScanFieldConditionEditorFrame } from './condition/internal-api';
import { NotSubbedScanFieldEditorFrame } from './not-subbed-scan-field-editor-frame';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class TextContainsScanFieldEditorFrame extends NotSubbedScanFieldEditorFrame implements TextContainsScanField {
    declare readonly typeId: TextContainsScanFieldEditorFrame.ScanFieldTypeId;
    declare readonly fieldId: TextContainsScanFieldEditorFrame.ScanFormulaFieldId;
    declare readonly conditions: TextContainsScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: TextContainsScanFieldEditorFrame.ConditionTypeId;

    constructor(
        fieldId: TextContainsScanFieldEditorFrame.ScanFormulaFieldId,
        name: string,
    ) {
        super(
            TextContainsScanFieldEditorFrame.typeId,
            fieldId,
            name,
            new TextContainsScanFieldEditorFrame.conditions(),
            TextContainsScanFieldEditorFrame.conditionTypeId,
        );
    }

    override get supportedOperatorIds() { return TextContainsScanFieldConditionEditorFrame.supportedOperatorIds; }

    override addCondition(operatorId: TextContainsScanFieldEditorFrame.OperatorId, modifier: ScanFieldEditorFrame.Modifier) {
        const conditionEditorFrame = this.createCondition(operatorId);
        this.conditions.add(conditionEditorFrame, modifier);
    }

    private createCondition(operatorId: TextContainsScanFieldEditorFrame.OperatorId): TextContainsScanFieldConditionEditorFrame {
        switch (operatorId) {
            case ScanFieldCondition.OperatorId.Contains:
            case ScanFieldCondition.OperatorId.NotContains:
                return new TextContainsScanFieldConditionEditorFrame(operatorId, '', ScanFormula.TextContainsAsId.None, true);
            default:
                throw new UnreachableCaseError('TCSFEFCC22298', operatorId);
        }
    }
}

export namespace TextContainsScanFieldEditorFrame {
    export const typeId = ScanField.TypeId.TextContains;
    export type ScanFieldTypeId = typeof typeId;
    export type ScanFormulaFieldId = ScanFormula.TextContainsFieldId;
    export type Conditions = ScanFieldConditionEditorFrame.List<TextContainsScanFieldConditionEditorFrame>;
    export const conditions = ScanFieldConditionEditorFrame.List<TextContainsScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.TextContains;
    export const conditionTypeId = ScanFieldCondition.TypeId.TextContains;
    export type OperatorId = TextContainsScanFieldConditionEditorFrame.OperatorId;
}
