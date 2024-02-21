/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, NumericComparisonScanFieldCondition, ScanFieldCondition } from '@motifmarkets/motif-core';
import { NumericComparisonScanFieldConditionEditorFrame } from './numeric-comparison-scan-field-condition-editor-frame';
import {
    NumericComparisonValueScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export class ValueNumericComparisonScanFieldConditionEditorFrame extends NumericComparisonScanFieldConditionEditorFrame
    implements
        NumericComparisonValueScanFieldConditionOperandsEditorFrame {

    declare readonly operandsTypeId: ValueNumericComparisonScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        private _operatorId: ValueNumericComparisonScanFieldConditionEditorFrame.OperatorId,
        private _value: number | undefined,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(ValueNumericComparisonScanFieldConditionEditorFrame.operandsTypeId, affirmativeOperatorDisplayLines);
    }

    override get operands() {
        const value = this._value;
        if (value === undefined) {
            throw new AssertInternalError('VNCSFCEFGOV54508');
        } else {
            const operands: NumericComparisonScanFieldCondition.ValueOperands = {
                typeId: ValueNumericComparisonScanFieldConditionEditorFrame.operandsTypeId,
                value,
            }
            return operands;
        }
    }

    override get operatorId() { return this._operatorId; }
    get value() { return this._value; }

    override calculateValid() {
        return this._value !== undefined;
    }

    setOperatorId(value: ValueNumericComparisonScanFieldConditionEditorFrame.OperatorId, modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (value === this._operatorId) {
            return false;
        } else {
            this._operatorId = value;
            this._affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(value);
            return this.processChanged(modifier);
        }
    }

    setValue(value: number | undefined, modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (value === this._value) {
            return false;
        } else {
            this._value = value;
            return this.processChanged(modifier);
        }
    }
}

export namespace ValueNumericComparisonScanFieldConditionEditorFrame {
    export type OperatorId = NumericComparisonValueScanFieldConditionOperandsEditorFrame.OperatorId;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.NumericComparisonValue;
    export type OperandsTypeId = typeof operandsTypeId;
}
