/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BaseNumericScanFieldCondition, ScanFieldCondition } from '@motifmarkets/motif-core';
import { NumericComparisonScanFieldConditionEditorFrame } from './numeric-comparison-scan-field-condition-editor-frame';
import { NumericRangeScanFieldConditionOperandsEditorFrame } from './operands/internal-api';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export class RangeNumericComparisonScanFieldConditionEditorFrame extends NumericComparisonScanFieldConditionEditorFrame
    implements
        NumericRangeScanFieldConditionOperandsEditorFrame {

    declare readonly operandsTypeId: RangeNumericComparisonScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        private _operatorId: RangeNumericComparisonScanFieldConditionEditorFrame.OperatorId,
        private _min: number | undefined,
        private _max: number | undefined,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(RangeNumericComparisonScanFieldConditionEditorFrame.operandsTypeId, affirmativeOperatorDisplayLines);
        this.updateValid();
    }

    override get operands() {
        const min = this._min;
        const max = this._max;
        const rangeOperands: BaseNumericScanFieldCondition.RangeOperands = {
            typeId: RangeNumericComparisonScanFieldConditionEditorFrame.operandsTypeId,
            min,
            max,
        }
        return rangeOperands;
    }

    override get operatorId() { return this._operatorId; }
    get not() { return ScanFieldCondition.Operator.inRangeIsNot(this._operatorId); }
    get min() { return this._min; }
    get max() { return this._max; }

    override calculateValid() {
        return this._min !== undefined || this._max !== undefined; // both undefined means condition has no effect so make it invalid
    }

    negateOperator(modifier: ScanFieldConditionEditorFrame.Modifier) {
        this._operatorId = ScanFieldCondition.Operator.negateInRange(this._operatorId);
        return this.processChanged(modifier);
    }

    setMin(value: number | undefined, modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (value === this._min) {
            return false;
        } else {
            this._min = value;
            return this.processChanged(modifier);
        }
    }

    setMax(value: number | undefined, modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (value === this._max) {
            return false;
        } else {
            this._max = value;
            return this.processChanged(modifier);
        }
    }
}

export namespace RangeNumericComparisonScanFieldConditionEditorFrame {
    export type OperatorId = NumericRangeScanFieldConditionOperandsEditorFrame.OperatorId;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.NumericRange;
    export type OperandsTypeId = typeof operandsTypeId;
}
