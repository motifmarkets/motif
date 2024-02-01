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
    declare readonly conditionTypeId: TextHasValueEqualsScanFieldEditorFrame.ConditionTypeId;

    override conditions =
        new ChangeSubscribableComparableList<TextHasValueEqualsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>()

    constructor(fieldId: TextHasValueEqualsScanFieldEditorFrame.FieldId,
        removeMeEventer: ScanFieldEditorFrame.RemoveMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
    ) {
        super(
            TextHasValueEqualsScanFieldEditorFrame.typeId,
            fieldId,
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
    export type ConditionTypeId = ScanFieldCondition.TypeId.TextHasValueEquals;
    export const conditionTypeId = ScanFieldCondition.TypeId.TextHasValueEquals;
}
