/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IsScanField, ScanField, ScanFieldCondition, ScanFormula, UiBadnessComparableList, UnreachableCaseError } from '@motifmarkets/motif-core';
import { IsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame } from './condition/internal-api';
import { NotSubbedScanFieldEditorFrame } from './not-subbed-scan-field-editor-frame';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class IsScanFieldEditorFrame extends NotSubbedScanFieldEditorFrame implements IsScanField {
    declare readonly typeId: IsScanFieldEditorFrame.ScanFieldTypeId;
    declare readonly fieldId: IsScanFieldEditorFrame.ScanFormulaFieldId;
    declare readonly conditions: IsScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: IsScanFieldEditorFrame.ConditionTypeId;

    constructor(
        fieldId: IsScanFieldEditorFrame.ScanFormulaFieldId,
        name: string,
        deleteMeEventer: ScanFieldEditorFrame.DeleteMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ValidChangedEventHandler,
    ) {
        super(
            IsScanFieldEditorFrame.typeId,
            fieldId,
            name,
            new IsScanFieldEditorFrame.conditions(),
            IsScanFieldEditorFrame.conditionTypeId,
            deleteMeEventer,
            changedEventer,
        );
    }

    override get supportedOperatorIds() { return IsScanFieldConditionEditorFrame.supportedOperatorIds; }

    override addCondition(operatorId: IsScanFieldEditorFrame.OperatorId) {
        const conditionEditorFrame = this.createCondition(operatorId);
        this.conditions.add(conditionEditorFrame);
    }

    private createCondition(operatorId: IsScanFieldEditorFrame.OperatorId): IsScanFieldConditionEditorFrame {
        const { deleteMeEventer, changedEventer } = this.createConditionEditorFrameEventers();
        switch (operatorId) {
            case ScanFieldCondition.OperatorId.Is:
            case ScanFieldCondition.OperatorId.NotIs:
                return new IsScanFieldConditionEditorFrame(operatorId, undefined, deleteMeEventer, changedEventer);
            default:
                throw new UnreachableCaseError('ISFEFCC22298', operatorId);
        }
    }
}

export namespace IsScanFieldEditorFrame {
    export const typeId = ScanField.TypeId.Is;
    export type ScanFieldTypeId = typeof typeId;
    export type ScanFormulaFieldId = ScanFormula.FieldId.Is;
    export type Conditions = UiBadnessComparableList<IsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export const conditions = UiBadnessComparableList<IsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.Is;
    export const conditionTypeId = ScanFieldCondition.TypeId.Is;
    export type OperatorId = IsScanFieldConditionEditorFrame.OperatorId;
}
