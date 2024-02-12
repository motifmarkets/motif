/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { NumericScanFieldCondition, ScanFieldCondition } from '@motifmarkets/motif-core';
import { NegatableOperator } from '../negatableOperator';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

export interface NumericValueScanFieldConditionOperandsEditorFrame extends ScanFieldConditionOperandsEditorFrame, NegatableOperator {
    readonly operandsTypeId: ScanFieldCondition.Operands.TypeId.NumericValue,

    readonly operatorId: NumericValueScanFieldConditionOperandsEditorFrame.OperatorId;
    readonly value: number | undefined;

    setValue(value: number | undefined, modifier: ScanFieldConditionOperandsEditorFrame.Modifier): void;
}

export namespace NumericValueScanFieldConditionOperandsEditorFrame {
    export type OperatorId = NumericScanFieldCondition.ValueOperands.OperatorId;
}
