/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BaseTextScanFieldCondition, ScanFieldCondition } from '@motifmarkets/motif-core';
import { NegatableOperator } from '../negatableOperator';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

export interface TextValueScanFieldConditionOperandsEditorFrame extends ScanFieldConditionOperandsEditorFrame, NegatableOperator {
    readonly operandsTypeId: ScanFieldCondition.Operands.TypeId.TextValue,

    readonly operatorId: TextValueScanFieldConditionOperandsEditorFrame.OperatorId;
    readonly value: string;

    setValue(value: string, modifier: ScanFieldConditionOperandsEditorFrame.Modifier): boolean;
}

export namespace TextValueScanFieldConditionOperandsEditorFrame {
    export type OperatorId = BaseTextScanFieldCondition.ValueOperands.OperatorId;
}
