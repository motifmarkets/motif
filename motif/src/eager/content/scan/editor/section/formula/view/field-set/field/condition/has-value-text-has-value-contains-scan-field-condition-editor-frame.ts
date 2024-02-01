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

    constructor(
        private _operatorId: HasValueScanFieldConditionOperandsEditorFrame.OperatorId,
        changedEventer: ScanFieldConditionEditorFrame.ChangedEventHandler,
    ) {
        super(changedEventer);
    }

    override get operands() {
        const operands: BaseTextScanFieldCondition.HasValueOperands = {
            typeId: BaseTextScanFieldCondition.Operands.TypeId.HasValue,
        }
        return operands;
    }

    get not() { return ScanFieldCondition.Operator.hasValueIsNot(this._operatorId); }

    override get operatorId() { return this._operatorId; }
    override set operatorId(value: HasValueScanFieldConditionOperandsEditorFrame.OperatorId) {
        if (value !== this._operatorId) {
            this._operatorId = value;
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
