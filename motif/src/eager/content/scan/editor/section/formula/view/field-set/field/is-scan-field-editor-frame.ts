/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeSubscribableComparableList, IsScanField, ScanField, ScanFieldCondition, ScanFormula } from '@motifmarkets/motif-core';
import { IsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame } from './condition/internal-api';
import { NotSubbedScanFieldEditorFrame } from './not-subbed-scan-field-editor-frame';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class IsScanFieldEditorFrame extends NotSubbedScanFieldEditorFrame implements IsScanField {
    declare readonly typeId: IsScanFieldEditorFrame.TypeId;
    declare readonly fieldId: IsScanFieldEditorFrame.FieldId;
    declare readonly conditionTypeId: IsScanFieldEditorFrame.ConditionTypeId;

    override conditions =
        new ChangeSubscribableComparableList<IsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>()

    constructor(
        fieldId: IsScanFieldEditorFrame.FieldId,
        name: string,
        removeMeEventer: ScanFieldEditorFrame.RemoveMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
    ) {
        super(
            IsScanFieldEditorFrame.typeId,
            fieldId,
            name,
            IsScanFieldEditorFrame.conditionTypeId,
            removeMeEventer,
            changedEventer,
        );
    }
}

export namespace IsScanFieldEditorFrame {
    export type TypeId = ScanField.TypeId.Is;
    export const typeId = ScanField.TypeId.Is;
    export type FieldId = ScanFormula.FieldId.Is;
    export type ConditionTypeId = ScanFieldCondition.TypeId.Is;
    export const conditionTypeId = ScanFieldCondition.TypeId.Is;
}
