/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeSubscribableComparableList, ScanField, ScanFieldCondition, ScanFormula, TextEqualsScanField } from '@motifmarkets/motif-core';
import { ScanFieldConditionEditorFrame, TextEqualsScanFieldConditionEditorFrame } from './condition/internal-api';
import { NotSubbedScanFieldEditorFrame } from './not-subbed-scan-field-editor-frame';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class TextEqualsScanFieldEditorFrame extends NotSubbedScanFieldEditorFrame implements TextEqualsScanField {
    declare readonly typeId: TextEqualsScanFieldEditorFrame.TypeId;
    declare readonly fieldId: TextEqualsScanFieldEditorFrame.FieldId;
    declare readonly conditionTypeId: TextEqualsScanFieldEditorFrame.ConditionTypeId;

    override conditions =
        new ChangeSubscribableComparableList<TextEqualsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>()

    constructor(fieldId: TextEqualsScanFieldEditorFrame.FieldId,
        removeMeEventer: ScanFieldEditorFrame.RemoveMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
    ) {
        super(
            TextEqualsScanFieldEditorFrame.typeId,
            fieldId,
            TextEqualsScanFieldEditorFrame.conditionTypeId,
            removeMeEventer,
            changedEventer,
        );
    }
}

export namespace TextEqualsScanFieldEditorFrame {
    export type TypeId = ScanField.TypeId.TextEquals;
    export const typeId = ScanField.TypeId.TextEquals;
    export type FieldId = ScanFormula.TextEqualsFieldId;
    export type ConditionTypeId = ScanFieldCondition.TypeId.TextEquals;
    export const conditionTypeId = ScanFieldCondition.TypeId.TextEquals;
}
