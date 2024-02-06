/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeSubscribableComparableList, ExchangeOverlapsScanField, ScanField, ScanFieldCondition, ScanFormula, UnreachableCaseError } from '@motifmarkets/motif-core';
import { ExchangeOverlapsScanFieldConditionEditorFrame, OverlapsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame } from './condition/internal-api';
import { NotSubbedScanFieldEditorFrame } from './not-subbed-scan-field-editor-frame';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class ExchangeOverlapsScanFieldEditorFrame extends NotSubbedScanFieldEditorFrame implements ExchangeOverlapsScanField {
    declare readonly typeId: ExchangeOverlapsScanFieldEditorFrame.TypeId;
    declare readonly fieldId: ExchangeOverlapsScanFieldEditorFrame.FieldId;
    declare readonly conditions: ExchangeOverlapsScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: ExchangeOverlapsScanFieldEditorFrame.ConditionTypeId;

    constructor(
        fieldId: ExchangeOverlapsScanFieldEditorFrame.FieldId,
        name: string,
        deleteMeEventer: ScanFieldEditorFrame.DeleteMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
    ) {
        super(
            ExchangeOverlapsScanFieldEditorFrame.typeId,
            fieldId,
            name,
            new ExchangeOverlapsScanFieldEditorFrame.conditions(),
            ExchangeOverlapsScanFieldEditorFrame.conditionTypeId,
            deleteMeEventer,
            changedEventer,
        );
    }

    override get supportedOperatorIds() { return OverlapsScanFieldConditionEditorFrame.supportedOperatorIds; }

    override addCondition(operatorId: ExchangeOverlapsScanFieldEditorFrame.OperatorId) {
        const conditionEditorFrame = this.createCondition(operatorId);
        this.conditions.add(conditionEditorFrame);
    }

    private createCondition(operatorId: ExchangeOverlapsScanFieldEditorFrame.OperatorId): ExchangeOverlapsScanFieldConditionEditorFrame {
        const { deleteMeEventer, changedEventer } = this.createConditionEditorFrameEventers();
        switch (operatorId) {
            case ScanFieldCondition.OperatorId.Overlaps:
            case ScanFieldCondition.OperatorId.NotOverlaps:
                return new ExchangeOverlapsScanFieldConditionEditorFrame(operatorId, [], deleteMeEventer, changedEventer);
            default:
                throw new UnreachableCaseError('EOSFEFCC22298', operatorId);
        }
    }
}

export namespace ExchangeOverlapsScanFieldEditorFrame {
    export type TypeId = ScanField.TypeId.ExchangeOverlaps;
    export const typeId = ScanField.TypeId.ExchangeOverlaps;
    export type FieldId = ScanFormula.FieldId.Exchange;
    export type Conditions = ChangeSubscribableComparableList<ExchangeOverlapsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export const conditions = ChangeSubscribableComparableList<ExchangeOverlapsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.ExchangeOverlaps;
    export const conditionTypeId = ScanFieldCondition.TypeId.ExchangeOverlaps;
    export type OperatorId = OverlapsScanFieldConditionEditorFrame.OperatorId;
}
