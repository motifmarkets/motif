/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AttributeSubbedScanField, ChangeSubscribableComparableList, ScanField, ScanFieldCondition, ScanFormula } from '@motifmarkets/motif-core';
import { ScanFieldConditionEditorFrame, TextHasValueContainsScanFieldConditionEditorFrame } from './condition/internal-api';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';
import { TextHasValueContainsSubbedScanFieldEditorFrame } from './text-has-value-contains-subbed-scan-field-editor-frame';

export class AttributeSubbedScanFieldEditorFrame extends TextHasValueContainsSubbedScanFieldEditorFrame implements AttributeSubbedScanField {
    declare readonly typeId: AttributeSubbedScanFieldEditorFrame.TypeId;
    declare readonly fieldId: AttributeSubbedScanFieldEditorFrame.FieldId;
    declare readonly subFieldId: AttributeSubbedScanFieldEditorFrame.SubFieldId;
    declare readonly conditions: AttributeSubbedScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: AttributeSubbedScanFieldEditorFrame.ConditionTypeId;

    constructor(
        subFieldId: AttributeSubbedScanFieldEditorFrame.SubFieldId,
        name: string,
        deleteMeEventer: ScanFieldEditorFrame.DeleteMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
    ) {
        super(
            AttributeSubbedScanFieldEditorFrame.typeId,
            AttributeSubbedScanFieldEditorFrame.fieldId,
            subFieldId,
            name,
            new AttributeSubbedScanFieldEditorFrame.conditions(),
            AttributeSubbedScanFieldEditorFrame.conditionTypeId,
            deleteMeEventer,
            changedEventer,
        );
    }

    override get supportedOperatorIds() { return TextHasValueContainsScanFieldConditionEditorFrame.supportedOperatorIds; }
}

export namespace AttributeSubbedScanFieldEditorFrame {
    export type TypeId = ScanField.TypeId.AttributeSubbed;
    export const typeId = ScanField.TypeId.AttributeSubbed;
    export type FieldId = ScanFormula.FieldId.AttributeSubbed;
    export const fieldId = ScanFormula.FieldId.AttributeSubbed;
    export type SubFieldId = ScanFormula.AttributeSubFieldId;
    export type Conditions = ChangeSubscribableComparableList<TextHasValueContainsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export const conditions = ChangeSubscribableComparableList<TextHasValueContainsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.TextHasValueContains;
    export const conditionTypeId = ScanFieldCondition.TypeId.TextHasValueContains;
}
