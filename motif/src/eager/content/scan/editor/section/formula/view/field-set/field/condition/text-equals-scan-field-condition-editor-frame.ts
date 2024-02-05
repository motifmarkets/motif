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
        removeMeEventer: ScanFieldConditionEditorFrame.RemoveMeEventer,
        changedEventer: ScanFieldConditionEditorFrame.ChangedEventer,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(
            TextEqualsScanFieldConditionEditorFrame.typeId,
            TextEqualsScanFieldConditionEditorFrame.operandsTypeId,
            affirmativeOperatorDisplayLines,
            removeMeEventer,
            changedEventer
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

    get not() { return ScanFieldCondition.Operator.equalsIsNot(this._operatorId); }

    override get operatorId() { return this._operatorId; }
    override set operatorId(value: TextEqualsScanFieldConditionEditorFrame.OperatorId) {
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

export namespace TextEqualsScanFieldConditionEditorFrame {
    export type TypeId = ScanFieldCondition.TypeId.TextEquals;
    export const typeId = ScanFieldCondition.TypeId.TextEquals;
    export type OperandsTypeId = ScanFieldCondition.Operands.TypeId.TextValue;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.TextValue;
    export type OperatorId = TextValueScanFieldConditionOperandsEditorFrame.OperatorId;
    export const supportedOperatorIds = TextEqualsScanFieldCondition.Operands.supportedOperatorIds;
}
