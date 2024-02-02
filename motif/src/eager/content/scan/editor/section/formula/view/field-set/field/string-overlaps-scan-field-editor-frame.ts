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
    declare readonly conditions: StringOverlapsScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: StringOverlapsScanFieldEditorFrame.ConditionTypeId;

    constructor(
        fieldId: StringOverlapsScanFieldEditorFrame.FieldId,
        name: string,
        removeMeEventer: ScanFieldEditorFrame.RemoveMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
    ) {
        super(
            StringOverlapsScanFieldEditorFrame.typeId,
            fieldId,
            name,
            new StringOverlapsScanFieldEditorFrame.conditions(),
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
    export type Conditions = ChangeSubscribableComparableList<StringOverlapsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export const conditions = ChangeSubscribableComparableList<StringOverlapsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.StringOverlaps;
    export const conditionTypeId = ScanFieldCondition.TypeId.StringOverlaps;
}
