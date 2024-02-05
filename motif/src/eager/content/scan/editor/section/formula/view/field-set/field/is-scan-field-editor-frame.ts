/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeSubscribableComparableList, IsScanField, ScanField, ScanFieldCondition, ScanFormula, UnreachableCaseError } from '@motifmarkets/motif-core';
import { IsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame } from './condition/internal-api';
import { NotSubbedScanFieldEditorFrame } from './not-subbed-scan-field-editor-frame';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class IsScanFieldEditorFrame extends NotSubbedScanFieldEditorFrame implements IsScanField {
    declare readonly typeId: IsScanFieldEditorFrame.TypeId;
    declare readonly fieldId: IsScanFieldEditorFrame.FieldId;
    declare readonly conditions: IsScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: IsScanFieldEditorFrame.ConditionTypeId;

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
            new IsScanFieldEditorFrame.conditions(),
            IsScanFieldEditorFrame.conditionTypeId,
            removeMeEventer,
            changedEventer,
        );
    }

    override get supportedOperatorIds() { return IsScanFieldConditionEditorFrame.supportedOperatorIds; }

    override addCondition(operatorId: IsScanFieldEditorFrame.OperatorId) {
        const conditionEditorFrame = this.createCondition(operatorId);
        this.conditions.add(conditionEditorFrame);
    }

    private createCondition(operatorId: IsScanFieldEditorFrame.OperatorId): IsScanFieldConditionEditorFrame {
        const { removeMeEventer, changedEventer } = this.createConditionEditorFrameEventers();
        switch (operatorId) {
            case ScanFieldCondition.OperatorId.Is:
            case ScanFieldCondition.OperatorId.NotIs:
                return new IsScanFieldConditionEditorFrame(operatorId, undefined, removeMeEventer, changedEventer);
            default:
                throw new UnreachableCaseError('ISFEFCC22298', operatorId);
        }
    }
}

export namespace IsScanFieldEditorFrame {
    export type TypeId = ScanField.TypeId.Is;
    export const typeId = ScanField.TypeId.Is;
    export type FieldId = ScanFormula.FieldId.Is;
    export type Conditions = ChangeSubscribableComparableList<IsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export const conditions = ChangeSubscribableComparableList<IsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.Is;
    export const conditionTypeId = ScanFieldCondition.TypeId.Is;
    export type OperatorId = IsScanFieldConditionEditorFrame.OperatorId;
}
