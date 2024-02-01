/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AttributeSubbedScanField, ChangeSubscribableComparableList, ScanField, ScanFieldCondition, ScanFormula } from '@motifmarkets/motif-core';
import { ScanFieldConditionEditorFrame, TextHasValueContainsScanFieldConditionEditorFrame } from './condition/internal-api';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class AttributeSubbedScanFieldEditorFrame extends ScanFieldEditorFrame implements AttributeSubbedScanField {
    declare readonly typeId: AttributeSubbedScanFieldEditorFrame.TypeId;
    declare readonly fieldId: AttributeSubbedScanFieldEditorFrame.FieldId;
    declare readonly subFieldId: AttributeSubbedScanFieldEditorFrame.SubFieldId;
    declare readonly conditionTypeId: AttributeSubbedScanFieldEditorFrame.ConditionTypeId;

    override conditions =
        new ChangeSubscribableComparableList<TextHasValueContainsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>()

    constructor(subFieldId: AttributeSubbedScanFieldEditorFrame.SubFieldId,
        removeMeEventer: ScanFieldEditorFrame.RemoveMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
    ) {
        super(
            AttributeSubbedScanFieldEditorFrame.typeId,
            AttributeSubbedScanFieldEditorFrame.fieldId,
            subFieldId,
            AttributeSubbedScanFieldEditorFrame.conditionTypeId,
            removeMeEventer,
            changedEventer,
        );
    }
}

export namespace AttributeSubbedScanFieldEditorFrame {
    export type TypeId = ScanField.TypeId.AttributeSubbed;
    export const typeId = ScanField.TypeId.AttributeSubbed;
    export type FieldId = ScanFormula.FieldId.AttributeSubbed;
    export const fieldId = ScanFormula.FieldId.AttributeSubbed;
    export type SubFieldId = ScanFormula.AttributeSubFieldId;
    export type ConditionTypeId = ScanFieldCondition.TypeId.TextHasValueContains;
    export const conditionTypeId = ScanFieldCondition.TypeId.TextHasValueContains;
}
