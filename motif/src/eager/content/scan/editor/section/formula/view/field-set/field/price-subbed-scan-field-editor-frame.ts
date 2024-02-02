/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeSubscribableComparableList, PriceSubbedScanField, ScanField, ScanFieldCondition, ScanFormula } from '@motifmarkets/motif-core';
import { NumericScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame } from './condition/internal-api';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class PriceSubbedScanFieldEditorFrame extends ScanFieldEditorFrame implements PriceSubbedScanField {
    declare readonly typeId: PriceSubbedScanFieldEditorFrame.TypeId;
    declare readonly fieldId: PriceSubbedScanFieldEditorFrame.FieldId;
    declare readonly subFieldId: PriceSubbedScanFieldEditorFrame.SubFieldId;
    declare readonly conditionTypeId: PriceSubbedScanFieldEditorFrame.ConditionTypeId;

    override conditions =
        new ChangeSubscribableComparableList<NumericScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>()

    constructor(
        subFieldId: PriceSubbedScanFieldEditorFrame.SubFieldId,
        name: string,
        removeMeEventer: ScanFieldEditorFrame.RemoveMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
    ) {
        super(
            PriceSubbedScanFieldEditorFrame.typeId,
            PriceSubbedScanFieldEditorFrame.fieldId,
            subFieldId,
            name,
            PriceSubbedScanFieldEditorFrame.conditionTypeId,
            removeMeEventer,
            changedEventer,
        );
    }
}

export namespace PriceSubbedScanFieldEditorFrame {
    export type TypeId = ScanField.TypeId.PriceSubbed;
    export const typeId = ScanField.TypeId.PriceSubbed;
    export type FieldId = ScanFormula.FieldId.PriceSubbed;
    export const fieldId = ScanFormula.FieldId.PriceSubbed;
    export type SubFieldId = ScanFormula.PriceSubFieldId;
    export type ConditionTypeId = ScanFieldCondition.TypeId.Numeric;
    export const conditionTypeId = ScanFieldCondition.TypeId.Numeric;
}
