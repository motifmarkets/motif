/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { OverlapsScanFieldCondition } from '@motifmarkets/motif-core';
import { NegatableOperator } from '../negatableOperator';
import { OverlapsScanFieldConditionOperandsEditorFrame } from '../overlaps/internal-api';

export interface StringOverlapsScanFieldConditionOperandsEditorFrame extends OverlapsScanFieldConditionOperandsEditorFrame, NegatableOperator {
    operatorId: OverlapsScanFieldCondition.Operands.OperatorId;
    values: readonly string[];
}
