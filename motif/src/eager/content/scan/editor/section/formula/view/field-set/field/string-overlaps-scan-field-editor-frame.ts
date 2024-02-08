/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ScanField, ScanFieldCondition, ScanFormula, StringOverlapsScanField, UiBadnessComparableList, UnreachableCaseError } from '@motifmarkets/motif-core';
import { OverlapsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame, StringOverlapsScanFieldConditionEditorFrame } from './condition/internal-api';
import { NotSubbedScanFieldEditorFrame } from './not-subbed-scan-field-editor-frame';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class StringOverlapsScanFieldEditorFrame extends NotSubbedScanFieldEditorFrame implements StringOverlapsScanField {
    declare readonly typeId: StringOverlapsScanFieldEditorFrame.ScanFieldTypeId;
    declare readonly fieldId: StringOverlapsScanFieldEditorFrame.ScanFormulaFieldId;
    declare readonly conditions: StringOverlapsScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: StringOverlapsScanFieldEditorFrame.ConditionTypeId;

    constructor(
        fieldId: StringOverlapsScanFieldEditorFrame.ScanFormulaFieldId,
        name: string,
        deleteMeEventer: ScanFieldEditorFrame.DeleteMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ValidChangedEventHandler,
    ) {
        super(
            StringOverlapsScanFieldEditorFrame.typeId,
            fieldId,
            name,
            new StringOverlapsScanFieldEditorFrame.conditions(),
            StringOverlapsScanFieldEditorFrame.conditionTypeId,
            deleteMeEventer,
            changedEventer,
        );
    }

    override get supportedOperatorIds() { return OverlapsScanFieldConditionEditorFrame.supportedOperatorIds; }

    override addCondition(operatorId: StringOverlapsScanFieldEditorFrame.OperatorId) {
        const conditionEditorFrame = this.createCondition(operatorId);
        this.conditions.add(conditionEditorFrame);
    }

    private createCondition(operatorId: StringOverlapsScanFieldEditorFrame.OperatorId): StringOverlapsScanFieldConditionEditorFrame {
        const { deleteMeEventer, changedEventer } = this.createConditionEditorFrameEventers();
        switch (operatorId) {
            case ScanFieldCondition.OperatorId.Overlaps:
            case ScanFieldCondition.OperatorId.NotOverlaps:
                return new StringOverlapsScanFieldConditionEditorFrame(operatorId, [], deleteMeEventer, changedEventer);
            default:
                throw new UnreachableCaseError('SOSFEFCC22298', operatorId);
        }
    }
}

export namespace StringOverlapsScanFieldEditorFrame {
    export const typeId = ScanField.TypeId.StringOverlaps;
    export type ScanFieldTypeId = typeof typeId;
    export type ScanFormulaFieldId = ScanFormula.StringOverlapsFieldId;
    export type Conditions = UiBadnessComparableList<StringOverlapsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export const conditions = UiBadnessComparableList<StringOverlapsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.StringOverlaps;
    export const conditionTypeId = ScanFieldCondition.TypeId.StringOverlaps;
    export type OperatorId = OverlapsScanFieldConditionEditorFrame.OperatorId;
}
