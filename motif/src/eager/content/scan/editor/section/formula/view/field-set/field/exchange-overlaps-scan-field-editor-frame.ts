/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExchangeOverlapsScanField, ScanField, ScanFieldCondition, ScanFormula, UnreachableCaseError } from '@motifmarkets/motif-core';
import { ExchangeOverlapsScanFieldConditionEditorFrame, OverlapsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame } from './condition/internal-api';
import { NotSubbedScanFieldEditorFrame } from './not-subbed-scan-field-editor-frame';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class ExchangeOverlapsScanFieldEditorFrame extends NotSubbedScanFieldEditorFrame implements ExchangeOverlapsScanField {
    declare readonly typeId: ExchangeOverlapsScanFieldEditorFrame.ScanFieldTypeId;
    declare readonly fieldId: ExchangeOverlapsScanFieldEditorFrame.ScanFormulaFieldId;
    declare readonly conditions: ExchangeOverlapsScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: ExchangeOverlapsScanFieldEditorFrame.ConditionTypeId;

    constructor(
        fieldId: ExchangeOverlapsScanFieldEditorFrame.ScanFormulaFieldId,
        name: string,
    ) {
        super(
            ExchangeOverlapsScanFieldEditorFrame.typeId,
            fieldId,
            name,
            new ExchangeOverlapsScanFieldEditorFrame.conditions(),
            ExchangeOverlapsScanFieldEditorFrame.conditionTypeId,
        );
    }

    override get supportedOperatorIds() { return OverlapsScanFieldConditionEditorFrame.supportedOperatorIds; }

    override addCondition(operatorId: ExchangeOverlapsScanFieldEditorFrame.OperatorId, modifier: ScanFieldEditorFrame.Modifier) {
        const conditionEditorFrame = this.createCondition(operatorId);
        this.conditions.add(conditionEditorFrame, modifier);
    }

    private createCondition(operatorId: ExchangeOverlapsScanFieldEditorFrame.OperatorId): ExchangeOverlapsScanFieldConditionEditorFrame {
        switch (operatorId) {
            case ScanFieldCondition.OperatorId.Overlaps:
            case ScanFieldCondition.OperatorId.NotOverlaps:
                return new ExchangeOverlapsScanFieldConditionEditorFrame(operatorId, []);
            default:
                throw new UnreachableCaseError('EOSFEFCC22298', operatorId);
        }
    }
}

export namespace ExchangeOverlapsScanFieldEditorFrame {
    export const typeId = ScanField.TypeId.ExchangeOverlaps;
    export type ScanFieldTypeId = typeof typeId;
    export type ScanFormulaFieldId = ScanFormula.FieldId.Exchange;
    export const conditions = ScanFieldConditionEditorFrame.List<ExchangeOverlapsScanFieldConditionEditorFrame>;
    export type Conditions = ScanFieldConditionEditorFrame.List<ExchangeOverlapsScanFieldConditionEditorFrame>;
    export const conditionTypeId = ScanFieldCondition.TypeId.ExchangeOverlaps;
    export type ConditionTypeId = typeof conditionTypeId;
    export type OperatorId = OverlapsScanFieldConditionEditorFrame.OperatorId;
}
