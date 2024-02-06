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
import { TextHasValueContainsScanFieldConditionEditorFrame } from './text-has-value-contains-scan-field-condition-editor-frame';

export class HasValueTextHasValueContainsScanFieldConditionEditorFrame extends TextHasValueContainsScanFieldConditionEditorFrame
    implements
        HasValueScanFieldConditionOperandsEditorFrame {

    declare readonly operandsTypeId: HasValueTextHasValueContainsScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        private _operatorId: HasValueTextHasValueContainsScanFieldConditionEditorFrame.OperatorId,
        deleteMeEventer: ScanFieldConditionEditorFrame.DeleteMeEventer,
        changedEventer: ScanFieldConditionEditorFrame.ChangedEventer,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(HasValueTextHasValueContainsScanFieldConditionEditorFrame.operandsTypeId, affirmativeOperatorDisplayLines, deleteMeEventer, changedEventer);
    }

    override get operands() {
        const operands: BaseTextScanFieldCondition.HasValueOperands = {
            typeId: HasValueTextHasValueContainsScanFieldConditionEditorFrame.operandsTypeId,
        }
        return operands;
    }

    get not() { return ScanFieldCondition.Operator.hasValueIsNot(this._operatorId); }

    override get operatorId() { return this._operatorId; }
    override set operatorId(value: HasValueTextHasValueContainsScanFieldConditionEditorFrame.OperatorId) {
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

export namespace HasValueTextHasValueContainsScanFieldConditionEditorFrame {
    export type OperatorId = HasValueScanFieldConditionOperandsEditorFrame.OperatorId;
    export type OperandsTypeId = ScanFieldCondition.Operands.TypeId.HasValue;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.HasValue;
}
