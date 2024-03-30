/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { OverlapsScanFieldCondition } from '@motifmarkets/motif-core';
import { NegatableOperator } from '../negatableOperator';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

export interface OverlapsScanFieldConditionOperandsEditorFrame extends ScanFieldConditionOperandsEditorFrame, NegatableOperator {
    readonly operatorId: OverlapsScanFieldConditionOperandsEditorFrame.OperatorId;
}

export namespace OverlapsScanFieldConditionOperandsEditorFrame {
    export type OperatorId = OverlapsScanFieldCondition.Operands.OperatorId;
}
