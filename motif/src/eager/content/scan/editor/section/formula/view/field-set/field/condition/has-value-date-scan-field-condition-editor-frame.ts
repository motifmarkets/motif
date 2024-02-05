/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DateScanFieldCondition, ScanFieldCondition } from '@motifmarkets/motif-core';
import { DateScanFieldConditionEditorFrame } from './date-scan-field-condition-editor-frame';
import {
    HasValueScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export class HasValueDateScanFieldConditionEditorFrame extends DateScanFieldConditionEditorFrame implements HasValueScanFieldConditionOperandsEditorFrame {
    declare readonly operandsTypeId: HasValueDateScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        private _operatorId: HasValueScanFieldConditionOperandsEditorFrame.OperatorId,
        removeMeEventer: ScanFieldConditionEditorFrame.RemoveMeEventer,
        changedEventer: ScanFieldConditionEditorFrame.ChangedEventer,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(HasValueDateScanFieldConditionEditorFrame.operandsTypeId, affirmativeOperatorDisplayLines, removeMeEventer, changedEventer);
    }

    override get operands() {
        const operands: DateScanFieldCondition.HasValueOperands = {
            typeId: HasValueDateScanFieldConditionEditorFrame.operandsTypeId,
        }
        return operands;
    }

    get not() { return ScanFieldCondition.Operator.hasValueIsNot(this._operatorId); }

    override get operatorId() { return this._operatorId; }
    override set operatorId(value: HasValueDateScanFieldConditionEditorFrame.OperatorId) {
        if (value !== this._operatorId) {
            this._operatorId = value;
            this._affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(value);
            this.processChanged();
        }
    }

    override calculateValid() {
        return true;
    }

    negateOperator() {
        this._operatorId = ScanFieldCondition.Operator.negateHasValue(this._operatorId);
        this.processChanged();
    }
}

export namespace HasValueDateScanFieldConditionEditorFrame {
    export type OperatorId = HasValueScanFieldConditionOperandsEditorFrame.OperatorId;
    export type OperandsTypeId = ScanFieldCondition.Operands.TypeId.HasValue;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.HasValue;
}
