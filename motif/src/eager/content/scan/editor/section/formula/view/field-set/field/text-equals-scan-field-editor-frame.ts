/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ScanField, ScanFieldCondition, ScanFormula, TextEqualsScanField, UiBadnessComparableList, UnreachableCaseError } from '@motifmarkets/motif-core';
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
        deleteMeEventer: ScanFieldEditorFrame.DeleteMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ValidChangedEventHandler,
    ) {
        super(
            TextEqualsScanFieldEditorFrame.typeId,
            fieldId,
            name,
            new TextEqualsScanFieldEditorFrame.conditions(),
            TextEqualsScanFieldEditorFrame.conditionTypeId,
            deleteMeEventer,
            changedEventer,
        );
    }

    override get supportedOperatorIds() { return TextEqualsScanFieldConditionEditorFrame.supportedOperatorIds; }

    override addCondition(operatorId: TextEqualsScanFieldEditorFrame.OperatorId) {
        const conditionEditorFrame = this.createCondition(operatorId);
        this.conditions.add(conditionEditorFrame);
    }

    private createCondition(operatorId: TextEqualsScanFieldEditorFrame.OperatorId): TextEqualsScanFieldConditionEditorFrame {
        const { deleteMeEventer, changedEventer } = this.createConditionEditorFrameEventers();
        switch (operatorId) {
            case ScanFieldCondition.OperatorId.Equals:
            case ScanFieldCondition.OperatorId.NotEquals:
                return new TextEqualsScanFieldConditionEditorFrame(operatorId, undefined, deleteMeEventer, changedEventer);
            default:
                throw new UnreachableCaseError('TESFEFCC22298', operatorId);
        }
    }
}

export namespace TextEqualsScanFieldEditorFrame {
    export const typeId = ScanField.TypeId.TextEquals;
    export type ScanFieldTypeId = typeof typeId;
    export type ScanFormulaFieldId = ScanFormula.TextEqualsFieldId;
    export type Conditions = UiBadnessComparableList<TextEqualsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export const conditions = UiBadnessComparableList<TextEqualsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.TextEquals;
    export const conditionTypeId = ScanFieldCondition.TypeId.TextEquals;
    export type OperatorId = TextEqualsScanFieldConditionEditorFrame.OperatorId;
}
