/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AltCodeSubbedScanField, ScanField, ScanFieldCondition, ScanFormula, UiBadnessComparableList } from '@motifmarkets/motif-core';
import { ScanFieldConditionEditorFrame, TextHasValueContainsScanFieldConditionEditorFrame } from './condition/internal-api';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';
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
        deleteMeEventer: ScanFieldEditorFrame.DeleteMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ValidChangedEventHandler,
    ) {
        super(
            AltCodeSubbedScanFieldEditorFrame.typeId,
            AltCodeSubbedScanFieldEditorFrame.fieldId,
            subFieldId,
            name,
            new AltCodeSubbedScanFieldEditorFrame.conditions(),
            AltCodeSubbedScanFieldEditorFrame.conditionTypeId,
            deleteMeEventer,
            changedEventer,
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
    export type Conditions = UiBadnessComparableList<TextHasValueContainsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export const conditions = UiBadnessComparableList<TextHasValueContainsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.TextHasValueContains;
    export const conditionTypeId = ScanFieldCondition.TypeId.TextHasValueContains;
}
