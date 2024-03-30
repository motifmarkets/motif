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
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(HasValueNumericComparisonScanFieldConditionEditorFrame.operandsTypeId, affirmativeOperatorDisplayLines);
        this.updateValid();
    }

    override get operands() {
        const operands: BaseNumericScanFieldCondition.HasValueOperands = {
            typeId: HasValueNumericComparisonScanFieldConditionEditorFrame.operandsTypeId,
        }
        return operands;
    }

    override get operatorId() { return this._operatorId; }
    get not() { return ScanFieldCondition.Operator.hasValueIsNot(this.operatorId); }

    override calculateValid() {
        return true;
    }

    negateOperator(modifier: ScanFieldConditionEditorFrame.Modifier) {
        this._operatorId = ScanFieldCondition.Operator.negateHasValue(this.operatorId);
        return this.processChanged(modifier);
    }
}

export namespace HasValueNumericComparisonScanFieldConditionEditorFrame {
    export type OperatorId = HasValueScanFieldConditionOperandsEditorFrame.OperatorId;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.HasValue;
    export type OperandsTypeId = typeof operandsTypeId;
}
