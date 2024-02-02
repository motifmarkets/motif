/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeSubscribableComparableList, ScanField, ScanFieldCondition, ScanFormula, TextContainsScanField } from '@motifmarkets/motif-core';
import { ScanFieldConditionEditorFrame, TextContainsScanFieldConditionEditorFrame } from './condition/internal-api';
import { NotSubbedScanFieldEditorFrame } from './not-subbed-scan-field-editor-frame';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class TextContainsScanFieldEditorFrame extends NotSubbedScanFieldEditorFrame implements TextContainsScanField {
    declare readonly typeId: TextContainsScanFieldEditorFrame.TypeId;
    declare readonly fieldId: TextContainsScanFieldEditorFrame.FieldId;
    declare readonly conditionTypeId: TextContainsScanFieldEditorFrame.ConditionTypeId;

    override conditions =
        new ChangeSubscribableComparableList<TextContainsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>()

    constructor(
        fieldId: TextContainsScanFieldEditorFrame.FieldId,
        name: string,
        removeMeEventer: ScanFieldEditorFrame.RemoveMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
    ) {
        super(
            TextContainsScanFieldEditorFrame.typeId,
            fieldId,
            name,
            TextContainsScanFieldEditorFrame.conditionTypeId,
            removeMeEventer,
            changedEventer,
        );
    }
}

export namespace TextContainsScanFieldEditorFrame {
    export type TypeId = ScanField.TypeId.TextContains;
    export const typeId = ScanField.TypeId.TextContains;
    export type FieldId = ScanFormula.TextContainsFieldId;
    export type ConditionTypeId = ScanFieldCondition.TypeId.TextContains;
    export const conditionTypeId = ScanFieldCondition.TypeId.TextContains;
}
