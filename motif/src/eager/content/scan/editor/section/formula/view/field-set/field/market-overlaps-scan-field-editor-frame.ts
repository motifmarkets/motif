/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MarketOverlapsScanField, ScanField, ScanFieldCondition, ScanFormula, UnreachableCaseError } from '@motifmarkets/motif-core';
import { MarketOverlapsScanFieldConditionEditorFrame, OverlapsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame } from './condition/internal-api';
import { NotSubbedScanFieldEditorFrame } from './not-subbed-scan-field-editor-frame';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class MarketOverlapsScanFieldEditorFrame extends NotSubbedScanFieldEditorFrame implements MarketOverlapsScanField {
    declare readonly typeId: MarketOverlapsScanFieldEditorFrame.ScanFieldTypeId;
    declare readonly fieldId: MarketOverlapsScanFieldEditorFrame.ScanFormulaFieldId;
    declare readonly conditions: MarketOverlapsScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: MarketOverlapsScanFieldEditorFrame.ConditionTypeId;

    constructor(
        fieldId: MarketOverlapsScanFieldEditorFrame.ScanFormulaFieldId,
        name: string,
    ) {
        super(
            MarketOverlapsScanFieldEditorFrame.typeId,
            fieldId,
            name,
            new MarketOverlapsScanFieldEditorFrame.conditions(),
            MarketOverlapsScanFieldEditorFrame.conditionTypeId,
        );
    }

    override get supportedOperatorIds() { return OverlapsScanFieldConditionEditorFrame.supportedOperatorIds; }

    override addCondition(operatorId: MarketOverlapsScanFieldEditorFrame.OperatorId, modifier: ScanFieldEditorFrame.Modifier) {
        const conditionEditorFrame = this.createCondition(operatorId);
        this.conditions.add(conditionEditorFrame, modifier);
    }

    private createCondition(operatorId: MarketOverlapsScanFieldEditorFrame.OperatorId): MarketOverlapsScanFieldConditionEditorFrame {
        switch (operatorId) {
            case ScanFieldCondition.OperatorId.Overlaps:
            case ScanFieldCondition.OperatorId.NotOverlaps:
                return new MarketOverlapsScanFieldConditionEditorFrame(operatorId, []);
            default:
                throw new UnreachableCaseError('MOSFEFCC22298', operatorId);
        }
    }
}

export namespace MarketOverlapsScanFieldEditorFrame {
    export const typeId = ScanField.TypeId.MarketOverlaps;
    export type ScanFieldTypeId = typeof typeId;
    export type ScanFormulaFieldId = ScanFormula.MarketOverlapsFieldId;
    export type Conditions = ScanFieldConditionEditorFrame.List<MarketOverlapsScanFieldConditionEditorFrame>;
    export const conditions = ScanFieldConditionEditorFrame.List<MarketOverlapsScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.MarketOverlaps;
    export const conditionTypeId = ScanFieldCondition.TypeId.MarketOverlaps;
    export type OperatorId = OverlapsScanFieldConditionEditorFrame.OperatorId;
}
