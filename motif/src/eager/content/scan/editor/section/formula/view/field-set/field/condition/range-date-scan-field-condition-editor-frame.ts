/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DateScanFieldCondition, ScanFieldCondition, SourceTzOffsetDate } from '@motifmarkets/motif-core';
import { DateScanFieldConditionEditorFrame } from './date-scan-field-condition-editor-frame';
import {
    DateRangeScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export class RangeDateScanFieldConditionEditorFrame extends DateScanFieldConditionEditorFrame implements DateRangeScanFieldConditionOperandsEditorFrame {
    declare readonly operandsTypeId: RangeDateScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        private _operatorId: RangeDateScanFieldConditionEditorFrame.OperatorId,
        private _min: SourceTzOffsetDate | undefined,
        private _max: SourceTzOffsetDate | undefined,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(RangeDateScanFieldConditionEditorFrame.operandsTypeId, affirmativeOperatorDisplayLines);
        this.updateValid();
    }

    override get operands() {
        const min = this._min;
        const max = this._max;
        const operands: DateScanFieldCondition.RangeOperands = {
            typeId: RangeDateScanFieldConditionEditorFrame.operandsTypeId,
            min,
            max,
        }
        return operands;
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

    setMin(value: SourceTzOffsetDate | undefined, modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (SourceTzOffsetDate.isUndefinableEqual(value, this._min)) {
            return false;
        } else {
            this._min = value;
            return this.processChanged(modifier);
        }
    }

    setMax(value: SourceTzOffsetDate | undefined, modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (SourceTzOffsetDate.isUndefinableEqual(value, this._max)) {
            return false;
        } else {
            this._max = value;
            return this.processChanged(modifier);
        }
    }
}

export namespace RangeDateScanFieldConditionEditorFrame {
    export type OperatorId = DateRangeScanFieldConditionOperandsEditorFrame.OperatorId;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.DateRange;
    export type OperandsTypeId = typeof operandsTypeId;
}
