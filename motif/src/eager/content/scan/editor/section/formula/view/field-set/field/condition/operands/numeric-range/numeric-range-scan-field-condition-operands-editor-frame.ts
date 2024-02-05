/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BaseNumericScanFieldCondition, ScanFieldCondition } from '@motifmarkets/motif-core';
import { NegatableOperator } from '../negatableOperator';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

export interface NumericRangeScanFieldConditionOperandsEditorFrame extends ScanFieldConditionOperandsEditorFrame, NegatableOperator {
    readonly operandsTypeId: ScanFieldCondition.Operands.TypeId.NumericRange,
    operatorId: NumericRangeScanFieldConditionOperandsEditorFrame.OperatorId;
    min: number | undefined;
    max: number | undefined;
}

export namespace NumericRangeScanFieldConditionOperandsEditorFrame {
    export type OperatorId = BaseNumericScanFieldCondition.RangeOperands.OperatorId;
}
