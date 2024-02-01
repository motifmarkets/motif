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
    private _min: SourceTzOffsetDateTime | undefined;
    private _max: SourceTzOffsetDateTime | undefined;

    constructor(
        private _operatorId: DateScanFieldCondition.RangeOperands.OperatorId,
        changedEventer: ScanFieldConditionEditorFrame.ChangedEventHandler,
    ) {
        super(changedEventer);
    }

    override get operands() {
        const min = this._min;
        const max = this._max;
        const operands: DateScanFieldCondition.RangeOperands = {
            typeId: DateScanFieldCondition.Operands.TypeId.Range,
            min,
            max,
        }
        return operands;
    }

    get not() { return ScanFieldCondition.Operator.inRangeIsNot(this._operatorId); }

    override get operatorId() { return this._operatorId; }
    override set operatorId(value: DateScanFieldCondition.RangeOperands.OperatorId) {
        if (value !== this._operatorId) {
            this._operatorId = value;
            this.processChanged();
        }
    }
    get min() { return this._min; }
    set min(value: SourceTzOffsetDateTime | undefined) {
        if (SourceTzOffsetDateTime.isUndefinableEqual(value, this._min)) {
            this._min = value;
            this.processChanged();
        }
    }

    get max() { return this._min; }
    set max(value: SourceTzOffsetDateTime | undefined) {
        if (SourceTzOffsetDateTime.isUndefinableEqual(value, this._max)) {
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
