/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeSubscribableComparableList, MarketBoardOverlapsScanField, ScanField, ScanFieldCondition, ScanFormula } from '@motifmarkets/motif-core';
import { MarketBoardOverlapsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame } from './condition/internal-api';
import { NotSubbedScanFieldEditorFrame } from './not-subbed-scan-field-editor-frame';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class MarketBoardOverlapsScanFieldEditorFrame extends NotSubbedScanFieldEditorFrame implements MarketBoardOverlapsScanField {
    declare readonly typeId: MarketBoardOverlapsScanFieldEditorFrame.TypeId;
    declare readonly fieldId: MarketBoardOverlapsScanFieldEditorFrame.FieldId;
    declare readonly conditions: MarketBoardOverlapsScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: MarketBoardOverlapsScanFieldEditorFrame.ConditionTypeId;

    constructor(
        fieldId: MarketBoardOverlapsScanFieldEditorFrame.FieldId,
        name: string,
        removeMeEventer: ScanFieldEditorFrame.RemoveMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
    ) {
        super(
            MarketBoardOverlapsScanFieldEditorFrame.typeId,
            fieldId,
            name,
            new MarketBoardOverlapsScanFieldEditorFrame.conditions(),
            MarketBoardOverlapsScanFieldEditorFrame.conditionTypeId,
            removeMeEventer,
            changedEventer,
        );
    }
}

export namespace MarketBoardOverlapsScanFieldEditorFrame {
    export type TypeId = ScanField.TypeId.MarketBoardOverlaps;
    export const typeId = ScanField.TypeId.MarketBoardOverlaps;
    export type FieldId = ScanFormula.FieldId.MarketBoard;
    export type Conditions = ChangeSubscribableComparableList<MarketBoardOverlapsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export const conditions = ChangeSubscribableComparableList<MarketBoardOverlapsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.MarketBoardOverlaps;
    export const conditionTypeId = ScanFieldCondition.TypeId.MarketBoardOverlaps;
}
