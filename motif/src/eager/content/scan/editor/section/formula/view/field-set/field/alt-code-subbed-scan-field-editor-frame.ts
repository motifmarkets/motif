/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AltCodeSubbedScanField, ChangeSubscribableComparableList, ScanField, ScanFieldCondition, ScanFormula } from '@motifmarkets/motif-core';
import { ScanFieldConditionEditorFrame, TextHasValueContainsScanFieldConditionEditorFrame } from './condition/internal-api';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class AltCodeSubbedScanFieldEditorFrame extends ScanFieldEditorFrame implements AltCodeSubbedScanField {
    declare readonly typeId: AltCodeSubbedScanFieldEditorFrame.TypeId;
    declare readonly fieldId: AltCodeSubbedScanFieldEditorFrame.FieldId;
    declare readonly subFieldId: AltCodeSubbedScanFieldEditorFrame.SubFieldId;
    declare readonly conditions: AltCodeSubbedScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: AltCodeSubbedScanFieldEditorFrame.ConditionTypeId;

    constructor(
        subFieldId: AltCodeSubbedScanFieldEditorFrame.SubFieldId,
        name: string,
        removeMeEventer: ScanFieldEditorFrame.RemoveMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
    ) {
        super(
            AltCodeSubbedScanFieldEditorFrame.typeId,
            AltCodeSubbedScanFieldEditorFrame.fieldId,
            subFieldId,
            name,
            new AltCodeSubbedScanFieldEditorFrame.conditions(),
            AltCodeSubbedScanFieldEditorFrame.conditionTypeId,
            removeMeEventer,
            changedEventer,
        );
    }
}

export namespace AltCodeSubbedScanFieldEditorFrame {
    export type TypeId = ScanField.TypeId.AltCodeSubbed;
    export const typeId = ScanField.TypeId.AltCodeSubbed;
    export type FieldId = ScanFormula.FieldId.AltCodeSubbed;
    export const fieldId = ScanFormula.FieldId.AltCodeSubbed;
    export type SubFieldId = ScanFormula.AltCodeSubFieldId;
    export type Conditions = ChangeSubscribableComparableList<TextHasValueContainsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export const conditions = ChangeSubscribableComparableList<TextHasValueContainsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.TextHasValueContains;
    export const conditionTypeId = ScanFieldCondition.TypeId.TextHasValueContains;
}
