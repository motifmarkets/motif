/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BaseNumericScanFieldCondition, NumericScanFieldCondition, ScanFieldCondition } from '@motifmarkets/motif-core';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export abstract class NumericScanFieldConditionEditorFrame extends ScanFieldConditionEditorFrame implements NumericScanFieldCondition {
    declare readonly typeId: NumericScanFieldConditionEditorFrame.TypeId;

    constructor(
        operandsTypeId: ScanFieldCondition.Operands.TypeId,
        affirmativeOperatorDisplayLines: readonly string[],
        deleteMeEventer: ScanFieldConditionEditorFrame.DeleteMeEventer,
        changedEventer: ScanFieldConditionEditorFrame.ChangedEventer,
    ) {
        super(NumericScanFieldConditionEditorFrame.typeId, operandsTypeId, affirmativeOperatorDisplayLines, deleteMeEventer, changedEventer);
    }

    abstract get operands(): BaseNumericScanFieldCondition.Operands;
    abstract override get operatorId(): NumericScanFieldConditionEditorFrame.OperatorId;
}

export namespace NumericScanFieldConditionEditorFrame {
    export type TypeId = ScanFieldCondition.TypeId.Numeric;
    export const typeId = ScanFieldCondition.TypeId.Numeric;
    export type OperatorId = NumericScanFieldCondition.OperatorId;
    export const supportedOperatorIds = NumericScanFieldCondition.Operands.supportedOperatorIds;
}
