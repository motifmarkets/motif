/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DateScanFieldCondition, ScanFieldCondition, SourceTzOffsetDateTime } from '@motifmarkets/motif-core';
import { NegatableOperator } from '../negatableOperator';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

export interface DateRangeScanFieldConditionOperandsEditorFrame extends ScanFieldConditionOperandsEditorFrame, NegatableOperator {
    readonly operandsTypeId: ScanFieldCondition.Operands.TypeId.DateRange,
    operatorId: DateRangeScanFieldConditionOperandsEditorFrame.OperatorId;
    min: SourceTzOffsetDateTime | undefined;
    max: SourceTzOffsetDateTime | undefined;
}

export namespace DateRangeScanFieldConditionOperandsEditorFrame {
    export type OperatorId = DateScanFieldCondition.RangeOperands.OperatorId;
}
