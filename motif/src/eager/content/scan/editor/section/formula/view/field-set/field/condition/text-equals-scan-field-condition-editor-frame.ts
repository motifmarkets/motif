/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    BaseTextScanFieldCondition,
    ScanFieldCondition,
    TextEqualsScanFieldCondition
} from '@motifmarkets/motif-core';
import {
    TextEqualsScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export class TextEqualsScanFieldConditionEditorFrame extends ScanFieldConditionEditorFrame
    implements
        TextEqualsScanFieldCondition,
        TextEqualsScanFieldConditionOperandsEditorFrame {

    override readonly typeId: ScanFieldCondition.TypeId.TextEquals;

    private _value: string | undefined;

    constructor(
        private _operatorId: BaseTextScanFieldCondition.ValueOperands.OperatorId,
        changedEventer: ScanFieldConditionEditorFrame.ChangedEventHandler,
    ) {
        super(changedEventer);
    }

    get operands() {
        const value = this._value;
        if (value === undefined) {
            throw new AssertInternalError('TESFCEFGOV54508');
        } else {
            const operands: BaseTextScanFieldCondition.ValueOperands = {
                typeId: BaseTextScanFieldCondition.Operands.TypeId.Value,
                value,
            }
            return operands;
        }
    }

    get not() { return ScanFieldCondition.Operator.equalsIsNot(this._operatorId); }

    override get operatorId() { return this._operatorId; }
    override set operatorId(value: BaseTextScanFieldCondition.ValueOperands.OperatorId) {
        if (value !== this._operatorId) {
            this._operatorId = value;
            this.processChanged();
        }
    }

    get value() { return this._value; }
    set value(value: string | undefined) {
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
