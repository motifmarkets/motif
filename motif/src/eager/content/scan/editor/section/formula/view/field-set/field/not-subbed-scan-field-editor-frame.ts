/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { NotSubbedScanField, ScanField, ScanFieldCondition, ScanFormula, UiBadnessComparableList } from '@motifmarkets/motif-core';
import { ScanFieldConditionEditorFrame } from './condition/internal-api';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export abstract class NotSubbedScanFieldEditorFrame extends ScanFieldEditorFrame implements NotSubbedScanField{
    declare readonly subFieldId: NotSubbedScanFieldEditorFrame.ScanFormulaSubFieldId;

    constructor(
        typeId: ScanField.TypeId,
        fieldId: ScanFormula.FieldId,
        name: string,
        conditions: UiBadnessComparableList<ScanFieldConditionEditorFrame>,
        conditionTypeId: ScanFieldCondition.TypeId,
        deleteMeEventer: ScanFieldEditorFrame.DeleteMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ValidChangedEventHandler,
    ) {
        super(
            typeId,
            fieldId,
            NotSubbedScanFieldEditorFrame.subFieldId,
            name,
            conditions,
            conditionTypeId,
            deleteMeEventer,
            changedEventer,
        );
    }
}

export namespace NotSubbedScanFieldEditorFrame {
    export const subFieldId = undefined;
    export type ScanFormulaSubFieldId = typeof subFieldId;
}
