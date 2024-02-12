/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, DateScanFieldCondition, ScanFieldCondition, SourceTzOffsetDateTime } from '@motifmarkets/motif-core';
import { DateScanFieldConditionEditorFrame } from './date-scan-field-condition-editor-frame';
import {
    DateValueScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export class ValueDateScanFieldConditionEditorFrame extends DateScanFieldConditionEditorFrame implements DateValueScanFieldConditionOperandsEditorFrame {
    declare readonly operandsTypeId: ValueDateScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        private _operatorId: ValueDateScanFieldConditionEditorFrame.OperatorId,
        private _value: SourceTzOffsetDateTime | undefined,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(ValueDateScanFieldConditionEditorFrame.operandsTypeId, affirmativeOperatorDisplayLines);
    }

    override get operands(): DateScanFieldCondition.Operands {
        const value = this._value;
        if (value === undefined) {
            throw new AssertInternalError('DSFCEFGOV54508');
        } else {
            const operands: DateScanFieldCondition.ValueOperands = {
                typeId: ValueDateScanFieldConditionEditorFrame.operandsTypeId,
                value,
            }
            return operands;
        }
    }

    override get operatorId() { return this._operatorId; }
    get not() { return ScanFieldCondition.Operator.equalsIsNot(this._operatorId); }
    get value() { return this._value; }

    override calculateValid() {
        return this._value !== undefined;
    }

    negateOperator(modifier: ScanFieldConditionEditorFrame.Modifier) {
        this._operatorId = ScanFieldCondition.Operator.negateEquals(this._operatorId);
        this.processChanged(modifier);
    }

    setValue(value: SourceTzOffsetDateTime | undefined, modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (SourceTzOffsetDateTime.isUndefinableEqual(value, this._value)) {
            this._value = value;
            this.processChanged(modifier);
        }
    }
}

export namespace ValueDateScanFieldConditionEditorFrame {
    export type OperatorId = DateValueScanFieldConditionOperandsEditorFrame.OperatorId;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.DateValue;
    export type OperandsTypeId = typeof operandsTypeId;
}
