/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeSubscribableComparableList, MarketOverlapsScanField, ScanField, ScanFieldCondition, ScanFormula } from '@motifmarkets/motif-core';
import { MarketOverlapsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame } from './condition/internal-api';
import { NotSubbedScanFieldEditorFrame } from './not-subbed-scan-field-editor-frame';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class MarketOverlapsScanFieldEditorFrame extends NotSubbedScanFieldEditorFrame implements MarketOverlapsScanField {
    declare readonly typeId: MarketOverlapsScanFieldEditorFrame.TypeId;
    declare readonly fieldId: MarketOverlapsScanFieldEditorFrame.FieldId;
    declare readonly conditions: MarketOverlapsScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: MarketOverlapsScanFieldEditorFrame.ConditionTypeId;

    constructor(
        fieldId: MarketOverlapsScanFieldEditorFrame.FieldId,
        name: string,
        removeMeEventer: ScanFieldEditorFrame.RemoveMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
    ) {
        super(
            MarketOverlapsScanFieldEditorFrame.typeId,
            fieldId,
            name,
            new MarketOverlapsScanFieldEditorFrame.conditions(),
            MarketOverlapsScanFieldEditorFrame.conditionTypeId,
            removeMeEventer,
            changedEventer,
        );
    }
}

export namespace MarketOverlapsScanFieldEditorFrame {
    export type TypeId = ScanField.TypeId.MarketOverlaps;
    export const typeId = ScanField.TypeId.MarketOverlaps;
    export type FieldId = ScanFormula.MarketOverlapsFieldId;
    export type Conditions = ChangeSubscribableComparableList<MarketOverlapsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export const conditions = ChangeSubscribableComparableList<MarketOverlapsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.MarketOverlaps;
    export const conditionTypeId = ScanFieldCondition.TypeId.MarketOverlaps;
}
