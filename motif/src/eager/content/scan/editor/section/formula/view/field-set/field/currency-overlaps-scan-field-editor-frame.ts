/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeSubscribableComparableList, CurrencyOverlapsScanField, ScanField, ScanFieldCondition, ScanFormula } from '@motifmarkets/motif-core';
import { CurrencyOverlapsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame } from './condition/internal-api';
import { NotSubbedScanFieldEditorFrame } from './not-subbed-scan-field-editor-frame';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class CurrencyOverlapsScanFieldEditorFrame extends NotSubbedScanFieldEditorFrame implements CurrencyOverlapsScanField {
    declare readonly typeId: CurrencyOverlapsScanFieldEditorFrame.TypeId;
    declare readonly fieldId: CurrencyOverlapsScanFieldEditorFrame.FieldId;
    declare readonly conditionTypeId: CurrencyOverlapsScanFieldEditorFrame.ConditionTypeId;

    override conditions =
        new ChangeSubscribableComparableList<CurrencyOverlapsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>()

    constructor(
        fieldId: CurrencyOverlapsScanFieldEditorFrame.FieldId,
        name: string,
        removeMeEventer: ScanFieldEditorFrame.RemoveMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
    ) {
        super(
            CurrencyOverlapsScanFieldEditorFrame.typeId,
            fieldId,
            name,
            CurrencyOverlapsScanFieldEditorFrame.conditionTypeId,
            removeMeEventer,
            changedEventer,
        );
    }
}

export namespace CurrencyOverlapsScanFieldEditorFrame {
    export type TypeId = ScanField.TypeId.CurrencyOverlaps;
    export const typeId = ScanField.TypeId.CurrencyOverlaps;
    export type FieldId = ScanFormula.FieldId.Currency;
    export type ConditionTypeId = ScanFieldCondition.TypeId.CurrencyOverlaps;
    export const conditionTypeId = ScanFieldCondition.TypeId.CurrencyOverlaps;
}
