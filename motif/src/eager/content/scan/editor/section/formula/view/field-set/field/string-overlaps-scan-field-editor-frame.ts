/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeSubscribableComparableList, ScanField, ScanFieldCondition, ScanFormula, StringOverlapsScanField } from '@motifmarkets/motif-core';
import { ScanFieldConditionEditorFrame, StringOverlapsScanFieldConditionEditorFrame } from './condition/internal-api';
import { NotSubbedScanFieldEditorFrame } from './not-subbed-scan-field-editor-frame';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class StringOverlapsScanFieldEditorFrame extends NotSubbedScanFieldEditorFrame implements StringOverlapsScanField {
    declare readonly typeId: StringOverlapsScanFieldEditorFrame.TypeId;
    declare readonly fieldId: StringOverlapsScanFieldEditorFrame.FieldId;
    declare readonly conditionTypeId: StringOverlapsScanFieldEditorFrame.ConditionTypeId;

    override conditions =
        new ChangeSubscribableComparableList<StringOverlapsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>()

    constructor(fieldId: StringOverlapsScanFieldEditorFrame.FieldId,
        removeMeEventer: ScanFieldEditorFrame.RemoveMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
    ) {
        super(
            StringOverlapsScanFieldEditorFrame.typeId,
            fieldId,
            StringOverlapsScanFieldEditorFrame.conditionTypeId,
            removeMeEventer,
            changedEventer,
        );
    }
}

export namespace StringOverlapsScanFieldEditorFrame {
    export type TypeId = ScanField.TypeId.StringOverlaps;
    export const typeId = ScanField.TypeId.StringOverlaps;
    export type FieldId = ScanFormula.StringOverlapsFieldId;
    export type ConditionTypeId = ScanFieldCondition.TypeId.StringOverlaps;
    export const conditionTypeId = ScanFieldCondition.TypeId.StringOverlaps;
}
