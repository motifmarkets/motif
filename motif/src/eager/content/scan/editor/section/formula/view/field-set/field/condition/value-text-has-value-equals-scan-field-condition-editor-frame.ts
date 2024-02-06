/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    BaseTextScanFieldCondition,
    ScanFieldCondition
} from '@motifmarkets/motif-core';
import {
    TextValueScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';
import { TextHasValueEqualsScanFieldConditionEditorFrame } from './text-has-value-equals-scan-field-condition-editor-frame';

export class ValueTextHasValueEqualsScanFieldConditionEditorFrame extends TextHasValueEqualsScanFieldConditionEditorFrame
    implements
        TextValueScanFieldConditionOperandsEditorFrame {

    declare readonly operandsTypeId: ValueTextHasValueEqualsScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        private _operatorId: ValueTextHasValueEqualsScanFieldConditionEditorFrame.OperatorId,
        private _value: string | undefined,
        deleteMeEventer: ScanFieldConditionEditorFrame.DeleteMeEventer,
        changedEventer: ScanFieldConditionEditorFrame.ChangedEventer,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(ValueTextHasValueEqualsScanFieldConditionEditorFrame.operandsTypeId, affirmativeOperatorDisplayLines, deleteMeEventer, changedEventer);
    }

    override get operands() {
        const value = this._value;
        if (value === undefined) {
            throw new AssertInternalError('VTHVESFCEFGOV54508');
        } else {
            const operands: BaseTextScanFieldCondition.ValueOperands = {
                typeId: ValueTextHasValueEqualsScanFieldConditionEditorFrame.operandsTypeId,
                value,
            }
            return operands;
        }
    }

    get not() { return ScanFieldCondition.Operator.equalsIsNot(this._operatorId); }

    override get operatorId() { return this._operatorId; }
    override set operatorId(value: ValueTextHasValueEqualsScanFieldConditionEditorFrame.OperatorId) {
        if (value !== this._operatorId) {
            this._operatorId = value;
            this._affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(value);
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

export namespace ValueTextHasValueEqualsScanFieldConditionEditorFrame {
    export type OperatorId = TextValueScanFieldConditionOperandsEditorFrame.OperatorId;
    export type OperandsTypeId = ScanFieldCondition.Operands.TypeId.TextValue;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.TextValue;
}
