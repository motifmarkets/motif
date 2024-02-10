/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BaseNumericScanFieldCondition, ScanFieldCondition } from '@motifmarkets/motif-core';
import { NumericComparisonScanFieldConditionEditorFrame } from './numeric-comparison-scan-field-condition-editor-frame';
import { NumericRangeScanFieldConditionOperandsEditorFrame } from './operands/internal-api';

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

    get not() { return ScanFieldCondition.Operator.inRangeIsNot(this._operatorId); }

    override get operatorId() { return this._operatorId; }
    override set operatorId(value: RangeNumericComparisonScanFieldConditionEditorFrame.OperatorId) {
        if (value !== this._operatorId) {
            this._operatorId = value;
            this._affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(value);
            this.processChanged();
        }
    }

    get min() { return this._min; }
    set min(value: number | undefined) {
        if (value !== this._min) {
            this._min = value;
            this.processChanged();
        }
    }

    get max() { return this._min; }
    set max(value: number | undefined) {
        if (value !== this._max) {
            this._max = value;
            this.processChanged();
        }
    }

    override calculateValid() {
        return true;
    }

    negateOperator() {
        this._operatorId = ScanFieldCondition.Operator.negateInRange(this._operatorId);
        this.processChanged();
    }
}

export namespace RangeNumericComparisonScanFieldConditionEditorFrame {
    export type OperatorId = NumericRangeScanFieldConditionOperandsEditorFrame.OperatorId;
    export type OperandsTypeId = ScanFieldCondition.Operands.TypeId.NumericRange;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.NumericRange;
}
