/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DateScanFieldCondition, ScanFieldCondition, SourceTzOffsetDate } from '@motifmarkets/motif-core';
import { NegatableOperator } from '../negatableOperator';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

export interface DateRangeScanFieldConditionOperandsEditorFrame extends ScanFieldConditionOperandsEditorFrame, NegatableOperator {
    readonly operandsTypeId: ScanFieldCondition.Operands.TypeId.DateRange,

    readonly operatorId: DateRangeScanFieldConditionOperandsEditorFrame.OperatorId;
    readonly min: SourceTzOffsetDate | undefined;
    readonly max: SourceTzOffsetDate | undefined;

    setMin(value: SourceTzOffsetDate | undefined, modifier: ScanFieldConditionOperandsEditorFrame.Modifier): boolean;
    setMax(value: SourceTzOffsetDate | undefined, modifier: ScanFieldConditionOperandsEditorFrame.Modifier): boolean;
}

export namespace DateRangeScanFieldConditionOperandsEditorFrame {
    export type OperatorId = DateScanFieldCondition.RangeOperands.OperatorId;
}
