/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ExchangeId,
    ExchangeOverlapsScanFieldCondition,
    ScanFieldCondition,
    isArrayEqual
} from '@motifmarkets/motif-core';
import {
    ExchangeOverlapsScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';
import { OverlapsScanFieldConditionEditorFrame } from './overlaps-scan-field-condition-editor-frame';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export class ExchangeOverlapsScanFieldConditionEditorFrame extends OverlapsScanFieldConditionEditorFrame
    implements
        ExchangeOverlapsScanFieldCondition,
        ExchangeOverlapsScanFieldConditionOperandsEditorFrame {

    declare readonly typeId: ExchangeOverlapsScanFieldConditionEditorFrame.TypeId;
    declare readonly operandsTypeId: ExchangeOverlapsScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        operatorId: OverlapsScanFieldConditionEditorFrame.OperatorId,
        private _values: readonly ExchangeId[],
    ) {
        super(
            ExchangeOverlapsScanFieldConditionEditorFrame.typeId,
            ExchangeOverlapsScanFieldConditionEditorFrame.operandsTypeId,
            operatorId,
        );
    }

    get operands() {
        const operands: ExchangeOverlapsScanFieldCondition.Operands = {
            typeId: ExchangeOverlapsScanFieldConditionEditorFrame.operandsTypeId,
            values: this._values.slice(),
        }
        return operands;
    }

    get values() { return this._values; }
    setValues(value: readonly ExchangeId[], modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (isArrayEqual(value, this._values)) {
            this._values = value.slice();
            this.processChanged(modifier);
        }
    }
}

export namespace ExchangeOverlapsScanFieldConditionEditorFrame {
    export const typeId = ScanFieldCondition.TypeId.ExchangeOverlaps;
    export type TypeId = typeof typeId;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.ExchangeEnum;
    export type OperandsTypeId = typeof operandsTypeId;
}
