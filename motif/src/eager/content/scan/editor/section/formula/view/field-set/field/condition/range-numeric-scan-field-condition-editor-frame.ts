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

    private _min: number | undefined;
    private _max: number | undefined;

    constructor(
        private _operatorId: BaseNumericScanFieldCondition.RangeOperands.OperatorId,
        changedEventer: ScanFieldConditionEditorFrame.ChangedEventHandler,
    ) {
        super(changedEventer);
    }

    override get operands() {
        const min = this._min;
        const max = this._max;
        const rangeOperands: BaseNumericScanFieldCondition.RangeOperands = {
            typeId: BaseNumericScanFieldCondition.Operands.TypeId.Range,
            min,
            max,
        }
        return rangeOperands;
    }

    get not() { return ScanFieldCondition.Operator.inRangeIsNot(this._operatorId); }

    override get operatorId() { return this._operatorId; }
    override set operatorId(value: BaseNumericScanFieldCondition.RangeOperands.OperatorId) {
        if (value !== this._operatorId) {
            this._operatorId = value;
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
