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
import { CategoryValueScanFieldConditionOperandsEditorFrame } from './operands/internal-api';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export class IsScanFieldConditionEditorFrame extends ScanFieldConditionEditorFrame
    implements
        IsScanFieldCondition,
        CategoryValueScanFieldConditionOperandsEditorFrame {

    declare readonly typeId: IsScanFieldConditionEditorFrame.TypeId;
    declare readonly operandsTypeId: IsScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        private _operatorId: IsScanFieldConditionEditorFrame.OperatorId,
        private _categoryId: ScanFormula.IsNode.CategoryId | undefined,
        deleteMeEventer: ScanFieldConditionEditorFrame.DeleteMeEventer,
        changedEventer: ScanFieldConditionEditorFrame.ChangedEventer,
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(
            IsScanFieldConditionEditorFrame.typeId,
            IsScanFieldConditionEditorFrame.operandsTypeId,
            affirmativeOperatorDisplayLines,
            deleteMeEventer,
            changedEventer
        );
    }

    get operands() {
        const categoryId = this._categoryId;
        if (categoryId === undefined) {
            throw new AssertInternalError('ISFCEFGOV54508');
        } else {
            const operands: IsScanFieldCondition.Operands = {
                typeId: IsScanFieldConditionEditorFrame.operandsTypeId,
                categoryId,
            }
            return operands;
        }
    }

    get not() { return ScanFieldCondition.Operator.isIsNot(this._operatorId); }

    override get operatorId(): IsScanFieldConditionEditorFrame.OperatorId { return this._operatorId; }
    set operatorId(value: IsScanFieldConditionEditorFrame.OperatorId) {
        if (value !== this._operatorId) {
            this._operatorId = value;
            this._affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(value);
            this.processChanged();
        }
    }

    get categoryId() { return this._categoryId; }
    set categoryId(value: ScanFormula.IsNode.CategoryId | undefined) {
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

export namespace IsScanFieldConditionEditorFrame {
    export type TypeId = ScanFieldCondition.TypeId.Is;
    export const typeId = ScanFieldCondition.TypeId.Is;
    export type OperandsTypeId = ScanFieldCondition.Operands.TypeId.CategoryValue;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.CategoryValue;
    export type OperatorId = CategoryValueScanFieldConditionOperandsEditorFrame.OperatorId;
    export const supportedOperatorIds = IsScanFieldCondition.Operands.supportedOperatorIds;
}
