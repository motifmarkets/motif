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
        deleteMeEventer: ScanFieldConditionEditorFrame.DeleteMeEventer,
        changedEventer: ScanFieldConditionEditorFrame.ChangedEventer,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(ContainsTextHasValueContainsScanFieldConditionEditorFrame.operandsTypeId, affirmativeOperatorDisplayLines, deleteMeEventer, changedEventer);
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

    get not() { return ScanFieldCondition.Operator.containsIsNot(this._operatorId); }

    override get operatorId() { return this._operatorId; }
    override set operatorId(value: ContainsTextHasValueContainsScanFieldConditionEditorFrame.OperatorId) {
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

    get asId() { return this._asId; }
    set asId(value: ScanFormula.TextContainsAsId | undefined) {
        if (value !== this._asId) {
            this._asId = value;
            this.processChanged();
        }
    }

    get ignoreCase() { return this._ignoreCase; }
    set ignoreCase(value: boolean | undefined) {
        if (value !== this._ignoreCase) {
            this._ignoreCase = value;
            this.processChanged();
        }
    }

    override calculateValid() {
        return this._value !== undefined && this._asId !== undefined && this._ignoreCase !== undefined;
    }

    negateOperator() {
        this._operatorId = ScanFieldCondition.Operator.negateContains(this._operatorId);
        this.processChanged();
    }
}

export namespace ContainsTextHasValueContainsScanFieldConditionEditorFrame {
    export type OperatorId = TextContainsScanFieldConditionOperandsEditorFrame.OperatorId;
    export type OperandsTypeId = ScanFieldCondition.Operands.TypeId.TextContains;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.TextContains;
}
