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
    TextValueScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export class TextEqualsScanFieldConditionEditorFrame extends ScanFieldConditionEditorFrame
    implements
        TextEqualsScanFieldCondition,
        TextValueScanFieldConditionOperandsEditorFrame {

    declare readonly typeId: TextEqualsScanFieldConditionEditorFrame.TypeId;
    declare readonly operandsTypeId: TextEqualsScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        private _operatorId: TextEqualsScanFieldConditionEditorFrame.OperatorId,
        private _value: string | undefined,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(
            TextEqualsScanFieldConditionEditorFrame.typeId,
            TextEqualsScanFieldConditionEditorFrame.operandsTypeId,
            affirmativeOperatorDisplayLines,
        );
    }

    get operands() {
        const value = this._value;
        if (value === undefined) {
            throw new AssertInternalError('TESFCEFGOV54508');
        } else {
            const operands: BaseTextScanFieldCondition.ValueOperands = {
                typeId: TextEqualsScanFieldConditionEditorFrame.operandsTypeId,
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

    setValue(value: string | undefined, modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (value !== this._value) {
            this._value = value;
            this.processChanged(modifier);
        }
    }
}

export namespace TextEqualsScanFieldConditionEditorFrame {
    export const typeId = ScanFieldCondition.TypeId.TextEquals;
    export type TypeId = typeof typeId;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.TextValue;
    export type OperandsTypeId = typeof operandsTypeId;
    export type OperatorId = TextValueScanFieldConditionOperandsEditorFrame.OperatorId;
    export const supportedOperatorIds = TextEqualsScanFieldCondition.Operands.supportedOperatorIds;
}
