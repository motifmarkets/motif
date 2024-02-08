/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ScanField, ScanFieldCondition, ScanFormula, TextContainsScanField, UiBadnessComparableList, UnreachableCaseError } from '@motifmarkets/motif-core';
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
        deleteMeEventer: ScanFieldEditorFrame.DeleteMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ValidChangedEventHandler,
    ) {
        super(
            TextContainsScanFieldEditorFrame.typeId,
            fieldId,
            name,
            new TextContainsScanFieldEditorFrame.conditions(),
            TextContainsScanFieldEditorFrame.conditionTypeId,
            deleteMeEventer,
            changedEventer,
        );
    }

    override get supportedOperatorIds() { return TextContainsScanFieldConditionEditorFrame.supportedOperatorIds; }

    override addCondition(operatorId: TextContainsScanFieldEditorFrame.OperatorId) {
        const conditionEditorFrame = this.createCondition(operatorId);
        this.conditions.add(conditionEditorFrame);
    }

    private createCondition(operatorId: TextContainsScanFieldEditorFrame.OperatorId): TextContainsScanFieldConditionEditorFrame {
        const { deleteMeEventer, changedEventer } = this.createConditionEditorFrameEventers();
        switch (operatorId) {
            case ScanFieldCondition.OperatorId.Contains:
            case ScanFieldCondition.OperatorId.NotContains:
                return new TextContainsScanFieldConditionEditorFrame(operatorId, undefined, undefined, undefined, deleteMeEventer, changedEventer);
            default:
                throw new UnreachableCaseError('TCSFEFCC22298', operatorId);
        }
    }
}

export namespace TextContainsScanFieldEditorFrame {
    export const typeId = ScanField.TypeId.TextContains;
    export type ScanFieldTypeId = typeof typeId;
    export type ScanFormulaFieldId = ScanFormula.TextContainsFieldId;
    export type Conditions = UiBadnessComparableList<TextContainsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export const conditions = UiBadnessComparableList<TextContainsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.TextContains;
    export const conditionTypeId = ScanFieldCondition.TypeId.TextContains;
    export type OperatorId = TextContainsScanFieldConditionEditorFrame.OperatorId;
}
