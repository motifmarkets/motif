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
    ) {
        const affirmativeOperatorDisplayLines = ScanFieldCondition.Operator.idToAffirmativeMultiLineDisplay(_operatorId);
        super(
            IsScanFieldConditionEditorFrame.typeId,
            IsScanFieldConditionEditorFrame.operandsTypeId,
            affirmativeOperatorDisplayLines,
        );
        this.updateValid();
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

    override get operatorId(): IsScanFieldConditionEditorFrame.OperatorId { return this._operatorId; }
    get not() { return ScanFieldCondition.Operator.isIsNot(this._operatorId); }
    get categoryId() { return this._categoryId; }

    override calculateValid() {
        return this._categoryId !== undefined;
    }

    negateOperator(modifier: ScanFieldConditionEditorFrame.Modifier) {
        this._operatorId = ScanFieldCondition.Operator.negateIs(this._operatorId);
        return this.processChanged(modifier);
    }

    setCategoryId(value: ScanFormula.IsNode.CategoryId | undefined, modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (value === this._categoryId) {
            return false;
        } else {
            this._categoryId = value;
            return this.processChanged(modifier);
        }
    }
}

export namespace IsScanFieldConditionEditorFrame {
    export const typeId = ScanFieldCondition.TypeId.Is;
    export type TypeId = typeof typeId;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.CategoryValue;
    export type OperandsTypeId = typeof operandsTypeId;
    export type OperatorId = CategoryValueScanFieldConditionOperandsEditorFrame.OperatorId;
    export const supportedOperatorIds = IsScanFieldCondition.Operands.supportedOperatorIds;
}
