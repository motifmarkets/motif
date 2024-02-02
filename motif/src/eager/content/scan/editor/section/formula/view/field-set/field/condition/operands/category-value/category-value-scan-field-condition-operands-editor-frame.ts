/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ScanFormula } from '@motifmarkets/motif-core';
import { NegatableOperator } from '../negatableOperator';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

export interface CategoryValueScanFieldConditionOperandsEditorFrame extends ScanFieldConditionOperandsEditorFrame, NegatableOperator {
    // operatorId: IsScanFieldCondition.Operands.OperatorId;
    value: ScanFormula.IsNode.CategoryId | undefined;
}
