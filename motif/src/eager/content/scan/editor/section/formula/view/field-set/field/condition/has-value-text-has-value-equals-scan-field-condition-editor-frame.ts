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
    HasValueScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';
import { TextHasValueEqualsScanFieldConditionEditorFrame } from './text-has-value-equals-scan-field-condition-editor-frame';

export class HasValueTextHasValueEqualsScanFieldConditionEditorFrame extends TextHasValueEqualsScanFieldConditionEditorFrame
    implements
        HasValueScanFieldConditionOperandsEditorFrame {

    declare readonly operandsTypeId: HasValueTextHasValueEqualsScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        private _operatorId: HasValueTextHasValueEqualsScanFieldConditionEditorFrame.OperatorId,
        deleteMeEventer: ScanFieldConditionEditorFrame.DeleteMeEventer,
        changedEventer: ScanFieldConditionEditorFrame.ChangedEventer,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(HasValueTextHasValueEqualsScanFieldConditionEditorFrame.operandsTypeId, affirmativeOperatorDisplayLines, deleteMeEventer, changedEventer);
    }

    override get operands() {
        const operands: BaseTextScanFieldCondition.HasValueOperands = {
            typeId: HasValueTextHasValueEqualsScanFieldConditionEditorFrame.operandsTypeId,
        }
        return operands;
    }

    get not() { return ScanFieldCondition.Operator.hasValueIsNot(this._operatorId); }

    override get operatorId() { return this._operatorId; }
    override set operatorId(value: HasValueTextHasValueEqualsScanFieldConditionEditorFrame.OperatorId) {
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

export namespace HasValueTextHasValueEqualsScanFieldConditionEditorFrame {
    export type OperatorId = HasValueScanFieldConditionOperandsEditorFrame.OperatorId;
    export type OperandsTypeId = ScanFieldCondition.Operands.TypeId.HasValue;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.HasValue;
}
