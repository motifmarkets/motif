/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BaseNumericScanFieldCondition } from '@motifmarkets/motif-core';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

export interface NumericComparisonValueScanFieldConditionOperandsEditorFrame extends ScanFieldConditionOperandsEditorFrame {
    operatorId: BaseNumericScanFieldCondition.ValueOperands.OperatorId;
    value: number | undefined;
}
