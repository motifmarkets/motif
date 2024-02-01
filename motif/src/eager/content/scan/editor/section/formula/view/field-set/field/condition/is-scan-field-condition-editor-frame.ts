/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    IsScanFieldCondition,
    ScanFieldCondition,
    ScanFormula
} from '@motifmarkets/motif-core';
import {
    CategoryValueScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export class IsScanFieldConditionEditorFrame extends ScanFieldConditionEditorFrame
    implements
        IsScanFieldCondition,
        CategoryValueScanFieldConditionOperandsEditorFrame {

    override readonly typeId: ScanFieldCondition.TypeId.Is;

    private _categoryId: ScanFormula.IsNode.CategoryId | undefined;

    constructor(
        private _operatorId: IsScanFieldCondition.Operands.OperatorId,
        changedEventer: ScanFieldConditionEditorFrame.ChangedEventHandler,
    ) {
        super(changedEventer);
    }

    get operands() {
        const categoryId = this._categoryId;
        if (categoryId === undefined) {
            throw new AssertInternalError('ISFCEFGOV54508');
        } else {
            const operands: IsScanFieldCondition.Operands = {
                categoryId,
            }
            return operands;
        }
    }

    get not() { return ScanFieldCondition.Operator.isIsNot(this._operatorId); }

    override get operatorId() { return this._operatorId; }
    override set operatorId(value: IsScanFieldCondition.Operands.OperatorId) {
        if (value !== this._operatorId) {
            this._operatorId = value;
            this.processChanged();
        }
    }

    get value() { return this._categoryId; }
    set value(value: ScanFormula.IsNode.CategoryId | undefined) {
        if (value !== this._categoryId) {
            this._categoryId = value;
            this.processChanged();
        }
    }

    override calculateValid() {
        return this._categoryId !== undefined;
    }

    negateOperator() {
        this._operatorId = ScanFieldCondition.Operator.negateIs(this._operatorId);
        this.processChanged();
    }
}
