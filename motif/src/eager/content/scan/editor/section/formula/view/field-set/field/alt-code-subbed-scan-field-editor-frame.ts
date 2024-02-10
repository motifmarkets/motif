/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AltCodeSubbedScanField, ScanField, ScanFieldCondition, ScanFormula } from '@motifmarkets/motif-core';
import { ScanFieldConditionEditorFrame, TextHasValueContainsScanFieldConditionEditorFrame } from './condition/internal-api';
import { TextHasValueContainsSubbedScanFieldEditorFrame } from './text-has-value-contains-subbed-scan-field-editor-frame';

export class AltCodeSubbedScanFieldEditorFrame extends TextHasValueContainsSubbedScanFieldEditorFrame implements AltCodeSubbedScanField {
    declare readonly typeId: AltCodeSubbedScanFieldEditorFrame.ScanFieldTypeId;
    declare readonly fieldId: AltCodeSubbedScanFieldEditorFrame.ScanFormulaFieldId;
    declare readonly subFieldId: AltCodeSubbedScanFieldEditorFrame.ScanFormulaSubFieldId;
    declare readonly conditions: AltCodeSubbedScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: AltCodeSubbedScanFieldEditorFrame.ConditionTypeId;

    constructor(
        subFieldId: AltCodeSubbedScanFieldEditorFrame.ScanFormulaSubFieldId,
        name: string,
    ) {
        super(
            AltCodeSubbedScanFieldEditorFrame.typeId,
            AltCodeSubbedScanFieldEditorFrame.fieldId,
            subFieldId,
            name,
            new AltCodeSubbedScanFieldEditorFrame.conditions(),
            AltCodeSubbedScanFieldEditorFrame.conditionTypeId,
        );
    }

    override get supportedOperatorIds() { return TextHasValueContainsScanFieldConditionEditorFrame.supportedOperatorIds; }
}

export namespace AltCodeSubbedScanFieldEditorFrame {
    export const typeId = ScanField.TypeId.AltCodeSubbed;
    export type ScanFieldTypeId = typeof typeId;
    export const fieldId = ScanFormula.FieldId.AltCodeSubbed;
    export type ScanFormulaFieldId = typeof fieldId;
    export type ScanFormulaSubFieldId = ScanFormula.AltCodeSubFieldId;
    export type Conditions = ScanFieldConditionEditorFrame.List<TextHasValueContainsScanFieldConditionEditorFrame>;
    export const conditions = ScanFieldConditionEditorFrame.List<TextHasValueContainsScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.TextHasValueContains;
    export const conditionTypeId = ScanFieldCondition.TypeId.TextHasValueContains;
}
