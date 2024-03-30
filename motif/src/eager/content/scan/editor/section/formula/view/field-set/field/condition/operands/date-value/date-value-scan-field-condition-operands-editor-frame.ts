/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DateScanFieldCondition, ScanFieldCondition, SourceTzOffsetDate } from '@motifmarkets/motif-core';
import { NegatableOperator } from '../negatableOperator';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

export interface DateValueScanFieldConditionOperandsEditorFrame extends ScanFieldConditionOperandsEditorFrame, NegatableOperator {
    readonly operandsTypeId: ScanFieldCondition.Operands.TypeId.DateValue,

    readonly operatorId: DateValueScanFieldConditionOperandsEditorFrame.OperatorId;
    readonly value: SourceTzOffsetDate | undefined;

    setValue(value: SourceTzOffsetDate | undefined, modifier: ScanFieldConditionOperandsEditorFrame.Modifier): boolean;
}

export namespace DateValueScanFieldConditionOperandsEditorFrame {
    export type OperatorId = DateScanFieldCondition.ValueOperands.OperatorId;
}
