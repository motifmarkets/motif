/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IsScanFieldCondition, ScanFieldCondition, ScanFormula } from '@motifmarkets/motif-core';
import { NegatableOperator } from '../negatableOperator';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

export interface CategoryValueScanFieldConditionOperandsEditorFrame extends ScanFieldConditionOperandsEditorFrame, NegatableOperator {
    readonly operandsTypeId: ScanFieldCondition.Operands.TypeId.CategoryValue,
    operatorId: CategoryValueScanFieldConditionOperandsEditorFrame.OperatorId;
    categoryId: ScanFormula.IsNode.CategoryId | undefined;
}

export namespace CategoryValueScanFieldConditionOperandsEditorFrame {
    export type OperatorId = IsScanFieldCondition.Operands.OperatorId;
}
