/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    OverlapsScanFieldCondition,
    ScanFieldCondition
} from '@motifmarkets/motif-core';
import { OverlapsScanFieldConditionOperandsEditorFrame } from './operands/internal-api';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export abstract class OverlapsScanFieldConditionEditorFrame extends ScanFieldConditionEditorFrame
    implements
        OverlapsScanFieldCondition,
        OverlapsScanFieldConditionOperandsEditorFrame {

    constructor(
        typeId: ScanFieldCondition.TypeId,
        operandsTypeId: ScanFieldCondition.Operands.TypeId,
        private _operatorId: OverlapsScanFieldConditionEditorFrame.OperatorId,
        deleteMeEventer: ScanFieldConditionEditorFrame.DeleteMeEventer,
        changedEventer: ScanFieldConditionEditorFrame.ChangedEventer,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(typeId, operandsTypeId, affirmativeOperatorDisplayLines, deleteMeEventer, changedEventer);
    }

    get not() { return ScanFieldCondition.Operator.overlapsIsNot(this._operatorId); }

    override get operatorId() { return this._operatorId; }
    set operatorId(value: OverlapsScanFieldConditionEditorFrame.OperatorId) {
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
        this._operatorId = ScanFieldCondition.Operator.negateOverlaps(this._operatorId);
        this.processChanged();
    }
}

export namespace OverlapsScanFieldConditionEditorFrame {
    export type OperatorId = OverlapsScanFieldCondition.Operands.OperatorId;
    export const supportedOperatorIds = OverlapsScanFieldCondition.Operands.supportedOperatorIds;
}
