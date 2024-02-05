/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { NumericComparisonScanFieldCondition, ScanFieldCondition } from '@motifmarkets/motif-core';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

export interface NumericComparisonValueScanFieldConditionOperandsEditorFrame extends ScanFieldConditionOperandsEditorFrame {
    readonly operandsTypeId: ScanFieldCondition.Operands.TypeId.NumericComparisonValue,
    operatorId: NumericComparisonValueScanFieldConditionOperandsEditorFrame.OperatorId;
    value: number | undefined;
}

export namespace NumericComparisonValueScanFieldConditionOperandsEditorFrame {
    export type OperatorId = NumericComparisonScanFieldCondition.ValueOperands.OperatorId;
}
