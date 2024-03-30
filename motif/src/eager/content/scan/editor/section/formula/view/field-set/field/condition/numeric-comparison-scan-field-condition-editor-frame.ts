/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BaseNumericScanFieldCondition, NumericComparisonScanFieldCondition, ScanFieldCondition } from '@motifmarkets/motif-core';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export abstract class NumericComparisonScanFieldConditionEditorFrame extends ScanFieldConditionEditorFrame
    implements
        NumericComparisonScanFieldCondition {

    declare readonly typeId: NumericComparisonScanFieldConditionEditorFrame.TypeId;

    constructor(
        operandsTypeId: ScanFieldCondition.Operands.TypeId,
        affirmativeOperatorDisplayLines: readonly string[],
    ) {
        super(NumericComparisonScanFieldConditionEditorFrame.typeId, operandsTypeId, affirmativeOperatorDisplayLines);
    }

    abstract get operands(): BaseNumericScanFieldCondition.Operands;
    abstract override get operatorId(): NumericComparisonScanFieldConditionEditorFrame.OperatorId;
}

export namespace NumericComparisonScanFieldConditionEditorFrame {
    export const typeId = ScanFieldCondition.TypeId.NumericComparison;
    export type TypeId = typeof typeId;
    export type OperatorId = NumericComparisonScanFieldCondition.Operands.OperatorId;
    export const supportedOperatorIds = NumericComparisonScanFieldCondition.Operands.supportedOperatorIds;
}
