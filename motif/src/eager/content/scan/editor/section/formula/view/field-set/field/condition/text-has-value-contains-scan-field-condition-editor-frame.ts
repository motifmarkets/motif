/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    BaseTextScanFieldCondition,
    ScanFieldCondition,
    TextHasValueContainsScanFieldCondition
} from '@motifmarkets/motif-core';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export abstract class TextHasValueContainsScanFieldConditionEditorFrame extends ScanFieldConditionEditorFrame
    implements
        TextHasValueContainsScanFieldCondition {

    declare readonly typeId: TextHasValueContainsScanFieldConditionEditorFrame.TypeId;

    constructor(
        operandsTypeId: ScanFieldCondition.Operands.TypeId,
        affirmativeOperatorDisplayLines: readonly string[],
        removeMeEventer: ScanFieldConditionEditorFrame.RemoveMeEventer,
        changedEventer: ScanFieldConditionEditorFrame.ChangedEventer,
    ) {
        super(TextHasValueContainsScanFieldConditionEditorFrame.typeId, operandsTypeId, affirmativeOperatorDisplayLines, removeMeEventer, changedEventer);
    }

    abstract get operands(): BaseTextScanFieldCondition.HasValueOperands | BaseTextScanFieldCondition.ContainsOperands;
    abstract override get operatorId(): TextHasValueContainsScanFieldConditionEditorFrame.OperatorId;
}

export namespace TextHasValueContainsScanFieldConditionEditorFrame {
    export type TypeId = ScanFieldCondition.TypeId.TextHasValueContains;
    export const typeId = ScanFieldCondition.TypeId.TextHasValueContains;
    export type OperatorId = TextHasValueContainsScanFieldCondition.Operands.OperatorId;
    export const supportedOperatorIds = TextHasValueContainsScanFieldCondition.Operands.supportedOperatorIds;
}
