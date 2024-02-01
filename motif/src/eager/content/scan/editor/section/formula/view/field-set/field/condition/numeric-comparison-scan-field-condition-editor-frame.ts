/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BaseNumericScanFieldCondition, NumericComparisonScanFieldCondition, ScanFieldCondition } from '@motifmarkets/motif-core';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export abstract class NumericComparisonScanFieldConditionEditorFrame extends ScanFieldConditionEditorFrame
    implements
        NumericComparisonScanFieldCondition {

    override readonly typeId: ScanFieldCondition.TypeId.NumericComparison;

    abstract get operands(): BaseNumericScanFieldCondition.Operands;
    abstract override get operatorId(): NumericComparisonScanFieldCondition.Operands.OperatorId;
}
