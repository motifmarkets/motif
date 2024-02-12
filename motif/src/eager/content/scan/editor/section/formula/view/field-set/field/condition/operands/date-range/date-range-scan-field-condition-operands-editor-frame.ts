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

    readonly operatorId: DateRangeScanFieldConditionOperandsEditorFrame.OperatorId;
    readonly min: SourceTzOffsetDateTime | undefined;
    readonly max: SourceTzOffsetDateTime | undefined;

    setMin(value: SourceTzOffsetDateTime | undefined, modifier: ScanFieldConditionOperandsEditorFrame.Modifier): void;
    setMax(value: SourceTzOffsetDateTime | undefined, modifier: ScanFieldConditionOperandsEditorFrame.Modifier): void;
}

export namespace DateRangeScanFieldConditionOperandsEditorFrame {
    export type OperatorId = DateScanFieldCondition.RangeOperands.OperatorId;
}
