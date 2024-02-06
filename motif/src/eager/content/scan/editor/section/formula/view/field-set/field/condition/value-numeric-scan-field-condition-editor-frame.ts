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
        deleteMeEventer: ScanFieldConditionEditorFrame.DeleteMeEventer,
        changedEventer: ScanFieldConditionEditorFrame.ChangedEventer,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(ValueNumericScanFieldConditionEditorFrame.operandsTypeId, affirmativeOperatorDisplayLines, deleteMeEventer, changedEventer);
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

    get not() { return ScanFieldCondition.Operator.equalsIsNot(this._operatorId); }

    override get operatorId() { return this._operatorId; }
    override set operatorId(value: ValueNumericScanFieldConditionEditorFrame.OperatorId) {
        if (value !== this._operatorId) {
            this._operatorId = value;
            this._affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(value);
            this.processChanged();
        }
    }

    get value() { return this._value; }
    set value(value: number | undefined) {
        if (value !== this._value) {
            this._value = value;
            this.processChanged();
        }
    }

    override calculateValid() {
        return this._value !== undefined;
    }

    negateOperator() {
        this._operatorId = ScanFieldCondition.Operator.negateEquals(this._operatorId);
        this.processChanged();
    }
}

export namespace ValueNumericScanFieldConditionEditorFrame {
    export type OperatorId = NumericValueScanFieldConditionOperandsEditorFrame.OperatorId;
    export type OperandsTypeId = ScanFieldCondition.Operands.TypeId.NumericValue;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.NumericValue;
}
