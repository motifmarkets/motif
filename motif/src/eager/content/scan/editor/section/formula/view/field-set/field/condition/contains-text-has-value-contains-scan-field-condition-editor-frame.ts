/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    BaseTextScanFieldCondition,
    ScanFieldCondition,
    ScanFormula
} from '@motifmarkets/motif-core';
import {
    TextContainsScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';
import { TextHasValueContainsScanFieldConditionEditorFrame } from './text-has-value-contains-scan-field-condition-editor-frame';

export class ContainsTextHasValueContainsScanFieldConditionEditorFrame extends TextHasValueContainsScanFieldConditionEditorFrame
    implements
        TextContainsScanFieldConditionOperandsEditorFrame {

    declare readonly operandsTypeId: ContainsTextHasValueContainsScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        private _operatorId: ContainsTextHasValueContainsScanFieldConditionEditorFrame.OperatorId,
        private _value: string | undefined,
        private _asId: ScanFormula.TextContainsAsId | undefined,
        private _ignoreCase: boolean | undefined,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(ContainsTextHasValueContainsScanFieldConditionEditorFrame.operandsTypeId, affirmativeOperatorDisplayLines);
    }

    override get operands() {
        const value = this._value;
        if (value === undefined) {
            throw new AssertInternalError('CTHVCSFCEFGOCV14223');
        } else {
            const asId = this._asId;
            if (asId === undefined) {
                throw new AssertInternalError('CTHVCSFCEFGOCA14223');
            } else {
                const ignoreCase = this._ignoreCase;
                if (ignoreCase === undefined) {
                    throw new AssertInternalError('CTHVCSFCEFGOCI14223');
                } else {
                    const containsOperand: BaseTextScanFieldCondition.ContainsOperand = {
                        value,
                        asId,
                        ignoreCase,
                    }
                    const operands: BaseTextScanFieldCondition.ContainsOperands = {
                        typeId: ContainsTextHasValueContainsScanFieldConditionEditorFrame.operandsTypeId,
                        contains: containsOperand,
                    }
                    return operands;
                }
            }
        }
    }

    override get operatorId() { return this._operatorId; }
    get not() { return ScanFieldCondition.Operator.containsIsNot(this._operatorId); }
    get value() { return this._value; }
    get asId() { return this._asId; }
    get ignoreCase() { return this._ignoreCase; }

    override calculateValid() {
        return this._value !== undefined && this._asId !== undefined && this._ignoreCase !== undefined;
    }

    negateOperator(modifier: ScanFieldConditionEditorFrame.Modifier) {
        this._operatorId = ScanFieldCondition.Operator.negateContains(this._operatorId);
        this.processChanged(modifier);
    }

    setValue(value: string | undefined, modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (value !== this._value) {
            this._value = value;
            this.processChanged(modifier);
        }
    }

    setAsId(value: ScanFormula.TextContainsAsId | undefined, modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (value !== this._asId) {
            this._asId = value;
            this.processChanged(modifier);
        }
    }

    setIgnoreCase(value: boolean | undefined, modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (value !== this._ignoreCase) {
            this._ignoreCase = value;
            this.processChanged(modifier);
        }
    }
}

export namespace ContainsTextHasValueContainsScanFieldConditionEditorFrame {
    export type OperatorId = TextContainsScanFieldConditionOperandsEditorFrame.OperatorId;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.TextContains;
    export type OperandsTypeId = typeof operandsTypeId;
}
