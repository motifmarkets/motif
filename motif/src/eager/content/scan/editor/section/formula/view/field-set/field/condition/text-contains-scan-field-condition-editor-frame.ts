/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    BaseTextScanFieldCondition,
    ScanFieldCondition,
    ScanFormula,
    TextContainsScanFieldCondition
} from '@motifmarkets/motif-core';
import {
    TextContainsScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export class TextContainsScanFieldConditionEditorFrame extends ScanFieldConditionEditorFrame
    implements
        TextContainsScanFieldCondition,
        TextContainsScanFieldConditionOperandsEditorFrame {

    declare readonly typeId: TextContainsScanFieldConditionEditorFrame.TypeId;
    declare readonly operandsTypeId: TextContainsScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        private _operatorId: TextContainsScanFieldConditionEditorFrame.OperatorId,
        private _value: string,
        private _asId: ScanFormula.TextContainsAsId,
        private _ignoreCase: boolean,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(
            TextContainsScanFieldConditionEditorFrame.typeId,
            TextContainsScanFieldConditionEditorFrame.operandsTypeId,
            affirmativeOperatorDisplayLines,
        );
        this.updateValid();
    }

    get operands() {
        const containsOperand: BaseTextScanFieldCondition.ContainsOperand = {
            value: this._value,
            asId: this._asId,
            ignoreCase: this._ignoreCase,
        }
        const operands: BaseTextScanFieldCondition.ContainsOperands = {
            typeId: TextContainsScanFieldConditionEditorFrame.operandsTypeId,
            contains: containsOperand,
        }
        return operands;
    }

    override get operatorId() { return this._operatorId; }
    get not() { return ScanFieldCondition.Operator.containsIsNot(this._operatorId); }
    get value() { return this._value; }
    get asId() { return this._asId; }
    get fromStart() { return ScanFormula.TextContainsAs.getFromStart(this._asId); }
    get fromEnd() { return ScanFormula.TextContainsAs.getFromEnd(this._asId); }
    get exact() { return ScanFormula.TextContainsAs.getExact(this._asId); }
    get ignoreCase() { return this._ignoreCase; }

    override calculateValid() {
        return this._value !== '';
    }

    negateOperator(modifier: ScanFieldConditionEditorFrame.Modifier) {
        this._operatorId = ScanFieldCondition.Operator.negateContains(this._operatorId);
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

    setAsId(value: ScanFormula.TextContainsAsId, modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (value === this._asId) {
            return false;
        } else {
            this._asId = value;
            return this.processChanged(modifier);
        }
    }

    setFromStart(value: boolean, modifier: ScanFieldConditionEditorFrame.Modifier) {
        const newAsId = ScanFormula.TextContainsAs.setFromStart(this._asId, value);
        if (newAsId === this._asId) {
            return false;
        } else {
            this._asId = newAsId;
            return this.processChanged(modifier);
        }
    }

    setFromEnd(value: boolean, modifier: ScanFieldConditionEditorFrame.Modifier) {
        const newAsId = ScanFormula.TextContainsAs.setFromEnd(this._asId, value);
        if (newAsId === this._asId) {
            return false;
        } else {
            this._asId = newAsId;
            return this.processChanged(modifier);
        }
    }

    setExact(value: boolean, modifier: ScanFieldConditionEditorFrame.Modifier) {
        const newAsId = ScanFormula.TextContainsAs.setExact(this._asId, value);
        if (newAsId === this._asId) {
            return false;
        } else {
            this._asId = newAsId;
            return this.processChanged(modifier);
        }
    }

    setIgnoreCase(value: boolean, modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (value === this._ignoreCase) {
            return false;
        } else {
            this._ignoreCase = value;
            return this.processChanged(modifier);
        }
    }
}

export namespace TextContainsScanFieldConditionEditorFrame {
    export const typeId = ScanFieldCondition.TypeId.TextContains;
    export type TypeId = typeof typeId;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.TextContains;
    export type OperandsTypeId = typeof operandsTypeId;
    export type OperatorId = TextContainsScanFieldConditionOperandsEditorFrame.OperatorId;
    export const supportedOperatorIds = TextContainsScanFieldCondition.Operands.supportedOperatorIds;
}
