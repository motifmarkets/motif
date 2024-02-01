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
    declare readonly conditionTypeId: MarketOverlapsScanFieldEditorFrame.ConditionTypeId;

    override conditions =
        new ChangeSubscribableComparableList<MarketOverlapsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>()

    constructor(fieldId: MarketOverlapsScanFieldEditorFrame.FieldId,
        removeMeEventer: ScanFieldEditorFrame.RemoveMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
    ) {
        super(
            MarketOverlapsScanFieldEditorFrame.typeId,
            fieldId,
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
    export type ConditionTypeId = ScanFieldCondition.TypeId.MarketOverlaps;
    export const conditionTypeId = ScanFieldCondition.TypeId.MarketOverlaps;
}
