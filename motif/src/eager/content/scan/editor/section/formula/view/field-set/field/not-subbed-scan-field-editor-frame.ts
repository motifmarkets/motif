/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeSubscribableComparableList, NotSubbedScanField, ScanField, ScanFieldCondition, ScanFormula } from '@motifmarkets/motif-core';
import { ScanFieldConditionEditorFrame } from './condition/internal-api';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export abstract class NotSubbedScanFieldEditorFrame extends ScanFieldEditorFrame implements NotSubbedScanField{
    declare readonly subFieldId: NotSubbedScanFieldEditorFrame.SubFieldId;

    constructor(
        typeId: ScanField.TypeId,
        fieldId: ScanFormula.FieldId,
        name: string,
        conditions: ChangeSubscribableComparableList<ScanFieldConditionEditorFrame>,
        conditionTypeId: ScanFieldCondition.TypeId,
        deleteMeEventer: ScanFieldEditorFrame.DeleteMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
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
    export type SubFieldId = undefined;
    export const subFieldId = undefined;
}
