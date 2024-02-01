/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, BaseNumericScanFieldCondition } from '@motifmarkets/motif-core';
import { NumericComparisonScanFieldConditionEditorFrame } from './numeric-comparison-scan-field-condition-editor-frame';
import {
    NumericComparisonValueScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export class ValueNumericComparisonScanFieldConditionEditorFrame extends NumericComparisonScanFieldConditionEditorFrame
    implements
        NumericComparisonValueScanFieldConditionOperandsEditorFrame {

    private _value: number | undefined;

    constructor(
        private _operatorId: BaseNumericScanFieldCondition.ValueOperands.OperatorId,
        changedEventer: ScanFieldConditionEditorFrame.ChangedEventHandler,
    ) {
        super(changedEventer);
    }

    override get operands() {
        const value = this._value;
        if (value === undefined) {
            throw new AssertInternalError('VNCSFCEFGOV54508');
        } else {
            const operands: BaseNumericScanFieldCondition.ValueOperands = {
                typeId: BaseNumericScanFieldCondition.Operands.TypeId.Value,
                value,
            }
            return operands;
        }
    }

    override get operatorId() { return this._operatorId; }
    override set operatorId(value: BaseNumericScanFieldCondition.ValueOperands.OperatorId) {
        if (value !== this._operatorId) {
            this._operatorId = value;
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
