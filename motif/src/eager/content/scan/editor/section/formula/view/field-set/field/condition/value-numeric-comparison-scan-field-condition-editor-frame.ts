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
        removeMeEventer: ScanFieldConditionEditorFrame.RemoveMeEventer,
        changedEventer: ScanFieldConditionEditorFrame.ChangedEventer,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(ValueNumericComparisonScanFieldConditionEditorFrame.operandsTypeId, affirmativeOperatorDisplayLines, removeMeEventer, changedEventer);
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
    override set operatorId(value: ValueNumericComparisonScanFieldConditionEditorFrame.OperatorId) {
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
}

export namespace ValueNumericComparisonScanFieldConditionEditorFrame {
    export type OperatorId = NumericComparisonValueScanFieldConditionOperandsEditorFrame.OperatorId;
    export type OperandsTypeId = ScanFieldCondition.Operands.TypeId.NumericComparisonValue;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.NumericComparisonValue;
}
