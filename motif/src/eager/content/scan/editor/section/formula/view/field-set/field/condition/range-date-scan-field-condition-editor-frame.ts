/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DateScanFieldCondition, ScanFieldCondition, SourceTzOffsetDateTime } from '@motifmarkets/motif-core';
import { DateScanFieldConditionEditorFrame } from './date-scan-field-condition-editor-frame';
import {
    DateRangeScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export class RangeDateScanFieldConditionEditorFrame extends DateScanFieldConditionEditorFrame implements DateRangeScanFieldConditionOperandsEditorFrame {
    declare readonly operandsTypeId: RangeDateScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        private _operatorId: RangeDateScanFieldConditionEditorFrame.OperatorId,
        private _min: SourceTzOffsetDateTime | undefined,
        private _max: SourceTzOffsetDateTime | undefined,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(RangeDateScanFieldConditionEditorFrame.operandsTypeId, affirmativeOperatorDisplayLines);
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
    get max() { return this._min; }

    override calculateValid() {
        return true;
    }

    negateOperator(modifier: ScanFieldConditionEditorFrame.Modifier) {
        this._operatorId = ScanFieldCondition.Operator.negateInRange(this._operatorId);
        this.processChanged(modifier);
    }

    setMin(value: SourceTzOffsetDateTime | undefined, modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (SourceTzOffsetDateTime.isUndefinableEqual(value, this._min)) {
            this._min = value;
            this.processChanged(modifier);
        }
    }

    setMax(value: SourceTzOffsetDateTime | undefined, modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (SourceTzOffsetDateTime.isUndefinableEqual(value, this._max)) {
            this._max = value;
            this.processChanged(modifier);
        }
    }
}

export namespace RangeDateScanFieldConditionEditorFrame {
    export type OperatorId = DateRangeScanFieldConditionOperandsEditorFrame.OperatorId;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.DateRange;
    export type OperandsTypeId = typeof operandsTypeId;
}
