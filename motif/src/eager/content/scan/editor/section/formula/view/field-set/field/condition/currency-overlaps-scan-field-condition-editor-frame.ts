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
    ) {
        super(
            CurrencyOverlapsScanFieldConditionEditorFrame.typeId,
            CurrencyOverlapsScanFieldConditionEditorFrame.operandsTypeId,
            operatorId,
        );
        this.updateValid();
    }

    get operands() {
        const operands: CurrencyOverlapsScanFieldCondition.Operands = {
            typeId: CurrencyOverlapsScanFieldConditionEditorFrame.operandsTypeId,
            values: this._values.slice(),
        }
        return operands;
    }

    get values() { return this._values; }
    setValues(value: readonly CurrencyId[], modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (isArrayEqual(value, this._values)) {
            return false;
        } else {
            this._values = value.slice();
            return this.processChanged(modifier);
        }
    }
}

export namespace CurrencyOverlapsScanFieldConditionEditorFrame {
    export const typeId = ScanFieldCondition.TypeId.CurrencyOverlaps;
    export type TypeId = typeof typeId;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.CurrencyEnum;
    export type OperandsTypeId = typeof operandsTypeId;
}
