/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BaseNumericScanFieldCondition, NumericScanFieldCondition, ScanFieldCondition } from '@motifmarkets/motif-core';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export abstract class NumericScanFieldConditionEditorFrame extends ScanFieldConditionEditorFrame implements NumericScanFieldCondition {
    override readonly typeId: ScanFieldCondition.TypeId.Numeric;

    abstract get operands(): BaseNumericScanFieldCondition.Operands;
    abstract override get operatorId(): NumericScanFieldCondition.Operands.OperatorId;
}
