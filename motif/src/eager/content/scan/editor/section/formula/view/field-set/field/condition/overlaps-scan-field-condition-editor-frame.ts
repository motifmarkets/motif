/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    OverlapsScanFieldCondition,
    ScanFieldCondition
} from '@motifmarkets/motif-core';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export abstract class OverlapsScanFieldConditionEditorFrame extends ScanFieldConditionEditorFrame implements OverlapsScanFieldCondition {

    constructor(
        protected _operatorId: OverlapsScanFieldCondition.Operands.OperatorId,
        changedEventer: ScanFieldConditionEditorFrame.ChangedEventHandler,
    ) {
        super(changedEventer);
    }

    get not() { return ScanFieldCondition.Operator.overlapsIsNot(this._operatorId); }

    override get operatorId() { return this._operatorId; }
    override set operatorId(value: OverlapsScanFieldCondition.Operands.OperatorId) {
        if (value !== this._operatorId) {
            this._operatorId = value;
            this.processChanged();
        }
    }

    override calculateValid() {
        return true;
    }

    negateOperator() {
        this._operatorId = ScanFieldCondition.Operator.negateOverlaps(this._operatorId);
        this.processChanged();
    }
}
