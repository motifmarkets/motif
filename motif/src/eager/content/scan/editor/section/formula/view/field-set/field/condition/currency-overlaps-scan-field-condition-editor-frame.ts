/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    CurrencyId,
    CurrencyOverlapsScanFieldCondition,
    ScanFieldCondition,
    isArrayEqual
} from '@motifmarkets/motif-core';
import {
    CurrencyOverlapsScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';
import { OverlapsScanFieldConditionEditorFrame } from './overlaps-scan-field-condition-editor-frame';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export class CurrencyOverlapsScanFieldConditionEditorFrame extends OverlapsScanFieldConditionEditorFrame
    implements
        CurrencyOverlapsScanFieldCondition,
        CurrencyOverlapsScanFieldConditionOperandsEditorFrame {

    declare readonly typeId: CurrencyOverlapsScanFieldConditionEditorFrame.TypeId;
    declare readonly operandsTypeId: CurrencyOverlapsScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        operatorId: OverlapsScanFieldConditionEditorFrame.OperatorId,
        private _values: readonly CurrencyId[],
        removeMeEventer: ScanFieldConditionEditorFrame.RemoveMeEventer,
        changedEventer: ScanFieldConditionEditorFrame.ChangedEventer,
    ) {
        super(
            CurrencyOverlapsScanFieldConditionEditorFrame.typeId,
            CurrencyOverlapsScanFieldConditionEditorFrame.operandsTypeId,
            operatorId,
            removeMeEventer,
            changedEventer
        );
    }

    get operands() {
        const operands: CurrencyOverlapsScanFieldCondition.Operands = {
            typeId: CurrencyOverlapsScanFieldConditionEditorFrame.operandsTypeId,
            values: this._values.slice(),
        }
        return operands;
    }

    get values() { return this._values; }
    set values(value: readonly CurrencyId[]) {
        if (isArrayEqual(value, this._values)) {
            this._values = value.slice();
            this.processChanged();
        }
    }
}

export namespace CurrencyOverlapsScanFieldConditionEditorFrame {
    export type TypeId = ScanFieldCondition.TypeId.CurrencyOverlaps;
    export const typeId = ScanFieldCondition.TypeId.CurrencyOverlaps;
    export type OperandsTypeId = ScanFieldCondition.Operands.TypeId.CurrencyEnum;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.CurrencyEnum;
}
