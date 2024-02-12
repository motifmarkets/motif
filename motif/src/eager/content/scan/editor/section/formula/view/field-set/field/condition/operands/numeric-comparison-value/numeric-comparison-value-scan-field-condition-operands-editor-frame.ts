/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { NumericComparisonScanFieldCondition, ScanFieldCondition } from '@motifmarkets/motif-core';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

export interface NumericComparisonValueScanFieldConditionOperandsEditorFrame extends ScanFieldConditionOperandsEditorFrame {
    readonly operandsTypeId: ScanFieldCondition.Operands.TypeId.NumericComparisonValue,

    readonly operatorId: NumericComparisonValueScanFieldConditionOperandsEditorFrame.OperatorId;
    readonly value: number | undefined;

    setOperatorId(value: NumericComparisonValueScanFieldConditionOperandsEditorFrame.OperatorId, modifier: ScanFieldConditionOperandsEditorFrame.Modifier): void;
    setValue(value: number | undefined, modifier: ScanFieldConditionOperandsEditorFrame.Modifier): void;
}

export namespace NumericComparisonValueScanFieldConditionOperandsEditorFrame {
    export type OperatorId = NumericComparisonScanFieldCondition.ValueOperands.OperatorId;
}
