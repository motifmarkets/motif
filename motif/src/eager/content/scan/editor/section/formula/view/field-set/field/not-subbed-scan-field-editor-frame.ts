/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { NotSubbedScanField, ScanField, ScanFieldCondition, ScanFormula } from '@motifmarkets/motif-core';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export abstract class NotSubbedScanFieldEditorFrame extends ScanFieldEditorFrame implements NotSubbedScanField{
    declare readonly subFieldId: NotSubbedScanFieldEditorFrame.SubFieldId;

    constructor(
        typeId: ScanField.TypeId,
        fieldId: ScanFormula.FieldId,
        name: string,
        conditionTypeId: ScanFieldCondition.TypeId,
        removeMeEventer: ScanFieldEditorFrame.RemoveMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
    ) {
        super(
            typeId,
            fieldId,
            NotSubbedScanFieldEditorFrame.subFieldId,
            name,
            conditionTypeId,
            removeMeEventer,
            changedEventer,
        );
    }
}

export namespace NotSubbedScanFieldEditorFrame {
    export type SubFieldId = undefined;
    export const subFieldId = undefined;
}
