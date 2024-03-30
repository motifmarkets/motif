/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CurrencyOverlapsScanField, ScanField, ScanFieldCondition, ScanFormula, UnreachableCaseError } from '@motifmarkets/motif-core';
import { CurrencyOverlapsScanFieldConditionEditorFrame, OverlapsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame } from './condition/internal-api';
import { NotSubbedScanFieldEditorFrame } from './not-subbed-scan-field-editor-frame';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class CurrencyOverlapsScanFieldEditorFrame extends NotSubbedScanFieldEditorFrame implements CurrencyOverlapsScanField {
    declare readonly typeId: CurrencyOverlapsScanFieldEditorFrame.ScanFieldTypeId;
    declare readonly fieldId: CurrencyOverlapsScanFieldEditorFrame.ScanFormulaFieldId;
    declare readonly conditions: CurrencyOverlapsScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: CurrencyOverlapsScanFieldEditorFrame.ConditionTypeId;

    constructor(
        fieldId: CurrencyOverlapsScanFieldEditorFrame.ScanFormulaFieldId,
        name: string,
    ) {
        super(
            CurrencyOverlapsScanFieldEditorFrame.typeId,
            fieldId,
            name,
            new CurrencyOverlapsScanFieldEditorFrame.conditions(),
            CurrencyOverlapsScanFieldEditorFrame.conditionTypeId,
        );
    }

    override get supportedOperatorIds() { return OverlapsScanFieldConditionEditorFrame.supportedOperatorIds; }

    override addCondition(operatorId: CurrencyOverlapsScanFieldEditorFrame.OperatorId, modifier: ScanFieldEditorFrame.Modifier) {
        const conditionEditorFrame = this.createCondition(operatorId);
        this.conditions.add(conditionEditorFrame, modifier);
    }

    private createCondition(operatorId: CurrencyOverlapsScanFieldEditorFrame.OperatorId): CurrencyOverlapsScanFieldConditionEditorFrame {
        switch (operatorId) {
            case ScanFieldCondition.OperatorId.Overlaps:
            case ScanFieldCondition.OperatorId.NotOverlaps:
                return new CurrencyOverlapsScanFieldConditionEditorFrame(operatorId, []);
            default:
                throw new UnreachableCaseError('COSFEFCC22298', operatorId);
        }
    }
}

export namespace CurrencyOverlapsScanFieldEditorFrame {
    export const typeId = ScanField.TypeId.CurrencyOverlaps;
    export type ScanFieldTypeId = typeof typeId;
    export type ScanFormulaFieldId = ScanFormula.FieldId.Currency;
    export type Conditions = ScanFieldConditionEditorFrame.List<CurrencyOverlapsScanFieldConditionEditorFrame>;
    export const conditions = ScanFieldConditionEditorFrame.List<CurrencyOverlapsScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.CurrencyOverlaps;
    export const conditionTypeId = ScanFieldCondition.TypeId.CurrencyOverlaps;
    export type OperatorId = OverlapsScanFieldConditionEditorFrame.OperatorId;
}
