/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AttributeSubbedScanField, ScanField, ScanFieldCondition, ScanFormula } from '@motifmarkets/motif-core';
import { ScanFieldConditionEditorFrame, TextHasValueContainsScanFieldConditionEditorFrame } from './condition/internal-api';
import { TextHasValueContainsSubbedScanFieldEditorFrame } from './text-has-value-contains-subbed-scan-field-editor-frame';

export class AttributeSubbedScanFieldEditorFrame extends TextHasValueContainsSubbedScanFieldEditorFrame implements AttributeSubbedScanField {
    declare readonly typeId: AttributeSubbedScanFieldEditorFrame.ScanFieldTypeId;
    declare readonly fieldId: AttributeSubbedScanFieldEditorFrame.ScanFormulaFieldId;
    declare readonly subFieldId: AttributeSubbedScanFieldEditorFrame.ScanFormulaSubFieldId;
    declare readonly conditions: AttributeSubbedScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: AttributeSubbedScanFieldEditorFrame.ConditionTypeId;

    constructor(
        subFieldId: AttributeSubbedScanFieldEditorFrame.ScanFormulaSubFieldId,
        name: string,
    ) {
        super(
            AttributeSubbedScanFieldEditorFrame.typeId,
            AttributeSubbedScanFieldEditorFrame.fieldId,
            subFieldId,
            name,
            new AttributeSubbedScanFieldEditorFrame.conditions(),
            AttributeSubbedScanFieldEditorFrame.conditionTypeId,
        );
    }

    override get supportedOperatorIds() { return TextHasValueContainsScanFieldConditionEditorFrame.supportedOperatorIds; }
}

export namespace AttributeSubbedScanFieldEditorFrame {
    export const typeId = ScanField.TypeId.AttributeSubbed;
    export type ScanFieldTypeId = typeof typeId;
    export const fieldId = ScanFormula.FieldId.AttributeSubbed;
    export type ScanFormulaFieldId = typeof fieldId;
    export type ScanFormulaSubFieldId = ScanFormula.AttributeSubFieldId;
    export type Conditions = ScanFieldConditionEditorFrame.List<TextHasValueContainsScanFieldConditionEditorFrame>;
    export const conditions = ScanFieldConditionEditorFrame.List<TextHasValueContainsScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.TextHasValueContains;
    export const conditionTypeId = ScanFieldCondition.TypeId.TextHasValueContains;
}
