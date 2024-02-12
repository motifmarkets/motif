/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, NumericScanFieldCondition, ScanFieldCondition } from '@motifmarkets/motif-core';
import { NumericScanFieldConditionEditorFrame } from './numeric-scan-field-condition-editor-frame';
import {
    NumericValueScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export class ValueNumericScanFieldConditionEditorFrame extends NumericScanFieldConditionEditorFrame
    implements
        NumericValueScanFieldConditionOperandsEditorFrame {

    declare readonly operandsTypeId: ValueNumericScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        private _operatorId: ValueNumericScanFieldConditionEditorFrame.OperatorId,
        private _value: number | undefined,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(ValueNumericScanFieldConditionEditorFrame.operandsTypeId, affirmativeOperatorDisplayLines);
    }

    override get operands() {
        const value = this._value;
        if (value === undefined) {
            throw new AssertInternalError('VNSFCEFGOV54508');
        } else {
            const operands: NumericScanFieldCondition.ValueOperands = {
                typeId: ValueNumericScanFieldConditionEditorFrame.operandsTypeId,
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

    setValue(value: number | undefined, modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (value !== this._value) {
            this._value = value;
            this.processChanged(modifier);
        }
    }
}

export namespace ValueNumericScanFieldConditionEditorFrame {
    export type OperatorId = NumericValueScanFieldConditionOperandsEditorFrame.OperatorId;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.NumericValue;
    export type OperandsTypeId = typeof operandsTypeId;
}
