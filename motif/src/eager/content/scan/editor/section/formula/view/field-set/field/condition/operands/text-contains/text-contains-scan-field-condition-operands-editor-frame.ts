/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BaseTextScanFieldCondition, ScanFieldCondition, ScanFormula } from '@motifmarkets/motif-core';
import { NegatableOperator } from '../negatableOperator';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

export interface TextContainsScanFieldConditionOperandsEditorFrame extends ScanFieldConditionOperandsEditorFrame, NegatableOperator {
    readonly operandsTypeId: ScanFieldCondition.Operands.TypeId.TextContains,

    readonly operatorId: TextContainsScanFieldConditionOperandsEditorFrame.OperatorId;
    readonly value: string;
    readonly asId: ScanFormula.TextContainsAsId;
    readonly fromStart: boolean;
    readonly fromEnd: boolean;
    readonly exact: boolean;
    readonly ignoreCase: boolean;

    setValue(value: string, modifier: ScanFieldConditionOperandsEditorFrame.Modifier): boolean;
    setAsId(value: ScanFormula.TextContainsAsId, modifier: ScanFieldConditionOperandsEditorFrame.Modifier): boolean;
    setFromStart(value: boolean, modifier: ScanFieldConditionOperandsEditorFrame.Modifier): boolean;
    setFromEnd(value: boolean, modifier: ScanFieldConditionOperandsEditorFrame.Modifier): boolean;
    setExact(value: boolean, modifier: ScanFieldConditionOperandsEditorFrame.Modifier): boolean;
    setIgnoreCase(value: boolean, modifier: ScanFieldConditionOperandsEditorFrame.Modifier): boolean;
}

export namespace TextContainsScanFieldConditionOperandsEditorFrame {
    export type OperatorId = BaseTextScanFieldCondition.ContainsOperands.OperatorId;
}
