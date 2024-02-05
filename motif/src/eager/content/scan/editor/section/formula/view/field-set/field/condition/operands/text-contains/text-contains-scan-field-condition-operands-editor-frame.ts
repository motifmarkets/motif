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
    operatorId: TextContainsScanFieldConditionOperandsEditorFrame.OperatorId;
    value: string | undefined;
    asId: ScanFormula.TextContainsAsId | undefined;
    ignoreCase: boolean | undefined;
}

export namespace TextContainsScanFieldConditionOperandsEditorFrame {
    export type OperatorId = BaseTextScanFieldCondition.ContainsOperands.OperatorId;
}
