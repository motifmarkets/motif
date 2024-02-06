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
        deleteMeEventer: ScanFieldConditionEditorFrame.DeleteMeEventer,
        changedEventer: ScanFieldConditionEditorFrame.ChangedEventer,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(RangeDateScanFieldConditionEditorFrame.operandsTypeId, affirmativeOperatorDisplayLines, deleteMeEventer, changedEventer);
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

    get not() { return ScanFieldCondition.Operator.inRangeIsNot(this._operatorId); }

    override get operatorId() { return this._operatorId; }
    override set operatorId(value: RangeDateScanFieldConditionEditorFrame.OperatorId) {
        if (value !== this._operatorId) {
            this._operatorId = value;
            this._affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(value);
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

export namespace RangeDateScanFieldConditionEditorFrame {
    export type OperatorId = DateRangeScanFieldConditionOperandsEditorFrame.OperatorId;
    export type OperandsTypeId = ScanFieldCondition.Operands.TypeId.DateRange;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.DateRange;
}
