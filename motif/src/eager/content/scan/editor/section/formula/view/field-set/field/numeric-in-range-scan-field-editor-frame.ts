/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeSubscribableComparableList, NumericInRangeScanField, ScanField, ScanFieldCondition, ScanFormula } from '@motifmarkets/motif-core';
import { NumericComparisonScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame } from './condition/internal-api';
import { NotSubbedScanFieldEditorFrame } from './not-subbed-scan-field-editor-frame';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class NumericInRangeScanFieldEditorFrame extends NotSubbedScanFieldEditorFrame implements NumericInRangeScanField {
    declare readonly typeId: NumericInRangeScanFieldEditorFrame.TypeId;
    declare readonly fieldId: NumericInRangeScanFieldEditorFrame.FieldId;
    declare readonly conditionTypeId: NumericInRangeScanFieldEditorFrame.ConditionTypeId;

    override conditions =
        new ChangeSubscribableComparableList<NumericComparisonScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>()

    constructor(
        fieldId: NumericInRangeScanFieldEditorFrame.FieldId,
        name: string,
        removeMeEventer: ScanFieldEditorFrame.RemoveMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
    ) {
        super(
            NumericInRangeScanFieldEditorFrame.typeId,
            fieldId,
            name,
            NumericInRangeScanFieldEditorFrame.conditionTypeId,
            removeMeEventer,
            changedEventer,
        );
    }
}

export namespace NumericInRangeScanFieldEditorFrame {
    export type TypeId = ScanField.TypeId.NumericInRange;
    export const typeId = ScanField.TypeId.NumericInRange;
    export type FieldId = ScanFormula.NumericRangeFieldId;
    export type ConditionTypeId = ScanFieldCondition.TypeId.NumericComparison;
    export const conditionTypeId = ScanFieldCondition.TypeId.NumericComparison;
}
