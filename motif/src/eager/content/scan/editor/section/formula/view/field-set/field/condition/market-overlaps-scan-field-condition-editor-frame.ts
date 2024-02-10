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
    }

    get operands() {
        const operands: MarketOverlapsScanFieldCondition.Operands = {
            typeId: MarketOverlapsScanFieldConditionEditorFrame.operandsTypeId,
            values: this._values.slice(),
        }
        return operands;
    }

    get values() { return this._values; }
    set values(value: readonly MarketId[]) {
        if (isArrayEqual(value, this._values)) {
            this._values = value.slice();
            this.processChanged();
        }
    }
}

export namespace MarketOverlapsScanFieldConditionEditorFrame {
    export type TypeId = ScanFieldCondition.TypeId.MarketOverlaps;
    export const typeId = ScanFieldCondition.TypeId.MarketOverlaps;
    export type OperandsTypeId = ScanFieldCondition.Operands.TypeId.MarketEnum;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.MarketEnum;
}
