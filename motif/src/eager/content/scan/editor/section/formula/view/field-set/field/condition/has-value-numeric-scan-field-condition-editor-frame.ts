/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BaseNumericScanFieldCondition, ScanFieldCondition } from '@motifmarkets/motif-core';
import { NumericScanFieldConditionEditorFrame } from './numeric-scan-field-condition-editor-frame';
import {
    HasValueScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';

export class HasValueNumericScanFieldConditionEditorFrame extends NumericScanFieldConditionEditorFrame
    implements
        HasValueScanFieldConditionOperandsEditorFrame {

    declare readonly operandsTypeId: HasValueNumericScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        private _operatorId: HasValueNumericScanFieldConditionEditorFrame.OperatorId,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(HasValueNumericScanFieldConditionEditorFrame.operandsTypeId, affirmativeOperatorDisplayLines);
    }

    override get operands() {
        const operands: BaseNumericScanFieldCondition.HasValueOperands = {
            typeId: HasValueNumericScanFieldConditionEditorFrame.operandsTypeId,
        }
        return operands;
    }

    get not() { return ScanFieldCondition.Operator.hasValueIsNot(this._operatorId); }

    override get operatorId() { return this._operatorId; }
    override set operatorId(value: HasValueNumericScanFieldConditionEditorFrame.OperatorId) {
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

export namespace HasValueNumericScanFieldConditionEditorFrame {
    export type OperatorId = HasValueScanFieldConditionOperandsEditorFrame.OperatorId;
    export type OperandsTypeId = ScanFieldCondition.Operands.TypeId.HasValue;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.HasValue;
}
