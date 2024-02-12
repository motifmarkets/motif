/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BaseNumericScanFieldCondition, ScanFieldCondition } from '@motifmarkets/motif-core';
import { NumericScanFieldConditionEditorFrame } from './numeric-scan-field-condition-editor-frame';
import {
    NumericRangeScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export class RangeNumericScanFieldConditionEditorFrame extends NumericScanFieldConditionEditorFrame
    implements
        NumericRangeScanFieldConditionOperandsEditorFrame {

    declare readonly operandsTypeId: RangeNumericScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        private _operatorId: RangeNumericScanFieldConditionEditorFrame.OperatorId,
        private _min: number | undefined,
        private _max: number | undefined,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(RangeNumericScanFieldConditionEditorFrame.operandsTypeId, affirmativeOperatorDisplayLines);
    }

    override get operands() {
        const min = this._min;
        const max = this._max;
        const rangeOperands: BaseNumericScanFieldCondition.RangeOperands = {
            typeId: RangeNumericScanFieldConditionEditorFrame.operandsTypeId,
            min,
            max,
        }
        return rangeOperands;
    }

    override get operatorId() { return this._operatorId; }
    get not() { return ScanFieldCondition.Operator.inRangeIsNot(this._operatorId); }
    get min() { return this._min; }
    get max() { return this._min; }

    override calculateValid() {
        return true;
    }

    negateOperator(modifier: ScanFieldConditionEditorFrame.Modifier) {
        this._operatorId = ScanFieldCondition.Operator.negateInRange(this._operatorId);
        this.processChanged(modifier);
    }

    setMin(value: number | undefined, modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (value !== this._min) {
            this._min = value;
            this.processChanged(modifier);
        }
    }

    setMax(value: number | undefined, modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (value !== this._max) {
            this._max = value;
            this.processChanged(modifier);
        }
    }
}

export namespace RangeNumericScanFieldConditionEditorFrame {
    export type OperatorId = NumericRangeScanFieldConditionOperandsEditorFrame.OperatorId;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.NumericRange;
    export type OperandsTypeId = typeof operandsTypeId;
}
