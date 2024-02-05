/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeSubscribableComparableList, ScanField, ScanFieldCondition, ScanFormula, TextContainsScanField, UnreachableCaseError } from '@motifmarkets/motif-core';
import { ScanFieldConditionEditorFrame, TextContainsScanFieldConditionEditorFrame } from './condition/internal-api';
import { NotSubbedScanFieldEditorFrame } from './not-subbed-scan-field-editor-frame';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class TextContainsScanFieldEditorFrame extends NotSubbedScanFieldEditorFrame implements TextContainsScanField {
    declare readonly typeId: TextContainsScanFieldEditorFrame.TypeId;
    declare readonly fieldId: TextContainsScanFieldEditorFrame.FieldId;
    declare readonly conditions: TextContainsScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: TextContainsScanFieldEditorFrame.ConditionTypeId;

    constructor(
        fieldId: TextContainsScanFieldEditorFrame.FieldId,
        name: string,
        removeMeEventer: ScanFieldEditorFrame.RemoveMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
    ) {
        super(
            TextContainsScanFieldEditorFrame.typeId,
            fieldId,
            name,
            new TextContainsScanFieldEditorFrame.conditions(),
            TextContainsScanFieldEditorFrame.conditionTypeId,
            removeMeEventer,
            changedEventer,
        );
    }

    override get supportedOperatorIds() { return TextContainsScanFieldConditionEditorFrame.supportedOperatorIds; }

    override addCondition(operatorId: TextContainsScanFieldEditorFrame.OperatorId) {
        const conditionEditorFrame = this.createCondition(operatorId);
        this.conditions.add(conditionEditorFrame);
    }

    private createCondition(operatorId: TextContainsScanFieldEditorFrame.OperatorId): TextContainsScanFieldConditionEditorFrame {
        const { removeMeEventer, changedEventer } = this.createConditionEditorFrameEventers();
        switch (operatorId) {
            case ScanFieldCondition.OperatorId.Contains:
            case ScanFieldCondition.OperatorId.NotContains:
                return new TextContainsScanFieldConditionEditorFrame(operatorId, undefined, undefined, undefined, removeMeEventer, changedEventer);
            default:
                throw new UnreachableCaseError('TCSFEFCC22298', operatorId);
        }
    }
}

export namespace TextContainsScanFieldEditorFrame {
    export type TypeId = ScanField.TypeId.TextContains;
    export const typeId = ScanField.TypeId.TextContains;
    export type FieldId = ScanFormula.TextContainsFieldId;
    export type Conditions = ChangeSubscribableComparableList<TextContainsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export const conditions = ChangeSubscribableComparableList<TextContainsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.TextContains;
    export const conditionTypeId = ScanFieldCondition.TypeId.TextContains;
    export type OperatorId = TextContainsScanFieldConditionEditorFrame.OperatorId;
}
