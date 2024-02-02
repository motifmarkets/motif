/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeSubscribableComparableList, DateSubbedScanField, ScanField, ScanFieldCondition, ScanFormula } from '@motifmarkets/motif-core';
import { DateScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame } from './condition/internal-api';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class DateSubbedScanFieldEditorFrame extends ScanFieldEditorFrame implements DateSubbedScanField {
    declare readonly typeId: DateSubbedScanFieldEditorFrame.TypeId;
    declare readonly fieldId: DateSubbedScanFieldEditorFrame.FieldId;
    declare readonly subFieldId: DateSubbedScanFieldEditorFrame.SubFieldId;
    declare readonly conditions: DateSubbedScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: DateSubbedScanFieldEditorFrame.ConditionTypeId;

    constructor(
        subFieldId: DateSubbedScanFieldEditorFrame.SubFieldId,
        name: string,
        removeMeEventer: ScanFieldEditorFrame.RemoveMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
    ) {
        super(
            DateSubbedScanFieldEditorFrame.typeId,
            DateSubbedScanFieldEditorFrame.fieldId,
            subFieldId,
            name,
            new DateSubbedScanFieldEditorFrame.conditions(),
            DateSubbedScanFieldEditorFrame.conditionTypeId,
            removeMeEventer,
            changedEventer,
        );
    }
}

export namespace DateSubbedScanFieldEditorFrame {
    export type TypeId = ScanField.TypeId.DateSubbed;
    export const typeId = ScanField.TypeId.DateSubbed;
    export type FieldId = ScanFormula.FieldId.DateSubbed;
    export const fieldId = ScanFormula.FieldId.DateSubbed;
    export type SubFieldId = ScanFormula.DateSubFieldId;
    export type Conditions = ChangeSubscribableComparableList<DateScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export const conditions = ChangeSubscribableComparableList<DateScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.Date;
    export const conditionTypeId = ScanFieldCondition.TypeId.Date;
}
