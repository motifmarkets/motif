/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CurrencyOverlapsScanField, ScanField, ScanFieldCondition, ScanFormula, UiBadnessComparableList, UnreachableCaseError } from '@motifmarkets/motif-core';
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
        deleteMeEventer: ScanFieldEditorFrame.DeleteMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ValidChangedEventHandler,
    ) {
        super(
            CurrencyOverlapsScanFieldEditorFrame.typeId,
            fieldId,
            name,
            new CurrencyOverlapsScanFieldEditorFrame.conditions(),
            CurrencyOverlapsScanFieldEditorFrame.conditionTypeId,
            deleteMeEventer,
            changedEventer,
        );
    }

    override get supportedOperatorIds() { return OverlapsScanFieldConditionEditorFrame.supportedOperatorIds; }

    override addCondition(operatorId: CurrencyOverlapsScanFieldEditorFrame.OperatorId) {
        const conditionEditorFrame = this.createCondition(operatorId);
        this.conditions.add(conditionEditorFrame);
    }

    private createCondition(operatorId: CurrencyOverlapsScanFieldEditorFrame.OperatorId): CurrencyOverlapsScanFieldConditionEditorFrame {
        const { deleteMeEventer, changedEventer } = this.createConditionEditorFrameEventers();
        switch (operatorId) {
            case ScanFieldCondition.OperatorId.Overlaps:
            case ScanFieldCondition.OperatorId.NotOverlaps:
                return new CurrencyOverlapsScanFieldConditionEditorFrame(operatorId, [], deleteMeEventer, changedEventer);
            default:
                throw new UnreachableCaseError('COSFEFCC22298', operatorId);
        }
    }
}

export namespace CurrencyOverlapsScanFieldEditorFrame {
    export const typeId = ScanField.TypeId.CurrencyOverlaps;
    export type ScanFieldTypeId = typeof typeId;
    export type ScanFormulaFieldId = ScanFormula.FieldId.Currency;
    export type Conditions = UiBadnessComparableList<CurrencyOverlapsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export const conditions = UiBadnessComparableList<CurrencyOverlapsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.CurrencyOverlaps;
    export const conditionTypeId = ScanFieldCondition.TypeId.CurrencyOverlaps;
    export type OperatorId = OverlapsScanFieldConditionEditorFrame.OperatorId;
}
