/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    MarketId,
    MarketOverlapsScanFieldCondition,
    ScanFieldCondition,
    isArrayEqual
} from '@motifmarkets/motif-core';
import {
    MarketOverlapsScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';
import { OverlapsScanFieldConditionEditorFrame } from './overlaps-scan-field-condition-editor-frame';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export class MarketOverlapsScanFieldConditionEditorFrame extends OverlapsScanFieldConditionEditorFrame
    implements
        MarketOverlapsScanFieldCondition,
        MarketOverlapsScanFieldConditionOperandsEditorFrame {

    declare readonly typeId: MarketOverlapsScanFieldConditionEditorFrame.TypeId;
    declare readonly operandsTypeId: MarketOverlapsScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        operatorId: OverlapsScanFieldConditionEditorFrame.OperatorId,
        private _values: readonly MarketId[],
    ) {
        super(
            MarketOverlapsScanFieldConditionEditorFrame.typeId,
            MarketOverlapsScanFieldConditionEditorFrame.operandsTypeId,
            operatorId,
        );
        this.updateValid();
    }

    get operands() {
        const operands: MarketOverlapsScanFieldCondition.Operands = {
            typeId: MarketOverlapsScanFieldConditionEditorFrame.operandsTypeId,
            values: this._values.slice(),
        }
        return operands;
    }

    override get valueCount() { return this._values.length; }

    get values() { return this._values; }
    setValues(value: readonly MarketId[], modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (isArrayEqual(value, this._values)) {
            return false;
        } else {
            this._values = value.slice();
            return this.processChanged(modifier);
        }
    }
}

export namespace MarketOverlapsScanFieldConditionEditorFrame {
    export const typeId = ScanFieldCondition.TypeId.MarketOverlaps;
    export type TypeId = typeof typeId;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.MarketEnum;
    export type OperandsTypeId = typeof operandsTypeId;
}
