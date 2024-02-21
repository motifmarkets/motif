/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ScanFieldCondition } from '@motifmarkets/motif-core';
import { NegatableOperator } from '../negatableOperator';
import { OverlapsScanFieldConditionOperandsEditorFrame } from '../overlaps/internal-api';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

export interface StringOverlapsScanFieldConditionOperandsEditorFrame extends OverlapsScanFieldConditionOperandsEditorFrame, NegatableOperator {
    readonly operandsTypeId: ScanFieldCondition.Operands.TypeId.TextEnum,

    readonly values: readonly string[];

    setValues(value: readonly string[], modifier: ScanFieldConditionOperandsEditorFrame.Modifier): boolean;
}
