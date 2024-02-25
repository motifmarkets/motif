/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
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
        private _value: string,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(ValueTextHasValueEqualsScanFieldConditionEditorFrame.operandsTypeId, affirmativeOperatorDisplayLines);
        this.updateValid();
    }

    override get operands() {
        const operands: BaseTextScanFieldCondition.ValueOperands = {
            typeId: ValueTextHasValueEqualsScanFieldConditionEditorFrame.operandsTypeId,
            value: this._value,
        }
        return operands;
    }

    override get operatorId() { return this._operatorId; }
    get not() { return ScanFieldCondition.Operator.equalsIsNot(this._operatorId); }
    get value() { return this._value; }

    override calculateValid() {
        return true;
    }

    negateOperator(modifier: ScanFieldConditionEditorFrame.Modifier) {
        this._operatorId = ScanFieldCondition.Operator.negateEquals(this._operatorId);
        return this.processChanged(modifier);
    }

    setValue(value: string, modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (value === this._value) {
            return false;
        } else {
            this._value = value;
            return this.processChanged(modifier);
        }
    }
}

export namespace ValueTextHasValueEqualsScanFieldConditionEditorFrame {
    export type OperatorId = TextValueScanFieldConditionOperandsEditorFrame.OperatorId;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.TextValue;
    export type OperandsTypeId = typeof operandsTypeId;
}
