/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BaseNumericScanFieldCondition, ScanFieldCondition } from '@motifmarkets/motif-core';
import { NumericComparisonScanFieldConditionEditorFrame } from './numeric-comparison-scan-field-condition-editor-frame';
import {
    HasValueScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export class HasValueNumericComparisonScanFieldConditionEditorFrame extends NumericComparisonScanFieldConditionEditorFrame
    implements
        HasValueScanFieldConditionOperandsEditorFrame {

    declare readonly operandsTypeId: HasValueNumericComparisonScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        private _operatorId: HasValueNumericComparisonScanFieldConditionEditorFrame.OperatorId,
        removeMeEventer: ScanFieldConditionEditorFrame.RemoveMeEventer,
        changedEventer: ScanFieldConditionEditorFrame.ChangedEventer,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(HasValueNumericComparisonScanFieldConditionEditorFrame.operandsTypeId, affirmativeOperatorDisplayLines, removeMeEventer, changedEventer);
    }

    override get operands() {
        const operands: BaseNumericScanFieldCondition.HasValueOperands = {
            typeId: HasValueNumericComparisonScanFieldConditionEditorFrame.operandsTypeId,
        }
        return operands;
    }

    get not() { return ScanFieldCondition.Operator.hasValueIsNot(this.operatorId); }

    override get operatorId() { return this._operatorId; }
    override set operatorId(value: HasValueNumericComparisonScanFieldConditionEditorFrame.OperatorId) {
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
        this.operatorId = ScanFieldCondition.Operator.negateHasValue(this.operatorId);
        this.processChanged();
    }
}

export namespace HasValueNumericComparisonScanFieldConditionEditorFrame {
    export type OperatorId = HasValueScanFieldConditionOperandsEditorFrame.OperatorId;
    export type OperandsTypeId = ScanFieldCondition.Operands.TypeId.HasValue;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.HasValue;
}
