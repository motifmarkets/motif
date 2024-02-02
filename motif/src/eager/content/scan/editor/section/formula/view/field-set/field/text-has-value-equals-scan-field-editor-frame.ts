/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeSubscribableComparableList, ScanField, ScanFieldCondition, ScanFormula, TextHasValueEqualsScanField } from '@motifmarkets/motif-core';
import { ScanFieldConditionEditorFrame, TextHasValueEqualsScanFieldConditionEditorFrame } from './condition/internal-api';
import { NotSubbedScanFieldEditorFrame } from './not-subbed-scan-field-editor-frame';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class TextHasValueEqualsScanFieldEditorFrame extends NotSubbedScanFieldEditorFrame implements TextHasValueEqualsScanField {
    declare readonly typeId: TextHasValueEqualsScanFieldEditorFrame.TypeId;
    declare readonly fieldId: TextHasValueEqualsScanFieldEditorFrame.FieldId;
    declare readonly conditions: TextHasValueEqualsScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: TextHasValueEqualsScanFieldEditorFrame.ConditionTypeId;

    constructor(
        fieldId: TextHasValueEqualsScanFieldEditorFrame.FieldId,
        name: string,
        removeMeEventer: ScanFieldEditorFrame.RemoveMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
    ) {
        super(
            TextHasValueEqualsScanFieldEditorFrame.typeId,
            fieldId,
            name,
            new TextHasValueEqualsScanFieldEditorFrame.conditions(),
            TextHasValueEqualsScanFieldEditorFrame.conditionTypeId,
            removeMeEventer,
            changedEventer,
        );
    }
}

export namespace TextHasValueEqualsScanFieldEditorFrame {
    export type TypeId = ScanField.TypeId.TextHasValueEquals;
    export const typeId = ScanField.TypeId.TextHasValueEquals;
    export type FieldId = ScanFormula.TextHasValueEqualsFieldId;
    export type Conditions = ChangeSubscribableComparableList<TextHasValueEqualsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export const conditions = ChangeSubscribableComparableList<TextHasValueEqualsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.TextHasValueEquals;
    export const conditionTypeId = ScanFieldCondition.TypeId.TextHasValueEquals;
}
