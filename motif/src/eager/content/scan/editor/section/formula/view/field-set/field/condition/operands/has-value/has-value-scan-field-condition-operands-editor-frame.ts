/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ScanFieldCondition } from '@motifmarkets/motif-core';
import { NegatableOperator } from '../negatableOperator';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

export interface HasValueScanFieldConditionOperandsEditorFrame extends ScanFieldConditionOperandsEditorFrame, NegatableOperator {
    operatorId: HasValueScanFieldConditionOperandsEditorFrame.OperatorId;
}

export namespace HasValueScanFieldConditionOperandsEditorFrame {
    export type OperatorId = ScanFieldCondition.OperatorId.HasValue | ScanFieldCondition.OperatorId.NotHasValue;
}
