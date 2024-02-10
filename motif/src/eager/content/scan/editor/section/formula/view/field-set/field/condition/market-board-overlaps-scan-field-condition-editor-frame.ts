/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    MarketBoardId,
    MarketBoardOverlapsScanFieldCondition,
    ScanFieldCondition,
    isArrayEqual
} from '@motifmarkets/motif-core';
import {
    MarketBoardOverlapsScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';
import { OverlapsScanFieldConditionEditorFrame } from './overlaps-scan-field-condition-editor-frame';

export class MarketBoardOverlapsScanFieldConditionEditorFrame extends OverlapsScanFieldConditionEditorFrame
    implements
        MarketBoardOverlapsScanFieldCondition,
        MarketBoardOverlapsScanFieldConditionOperandsEditorFrame {

    declare readonly typeId: MarketBoardOverlapsScanFieldConditionEditorFrame.TypeId;
    declare readonly operandsTypeId: MarketBoardOverlapsScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        operatorId: OverlapsScanFieldConditionEditorFrame.OperatorId,
        private _values: readonly MarketBoardId[],
    ) {
        super(
            MarketBoardOverlapsScanFieldConditionEditorFrame.typeId,
            MarketBoardOverlapsScanFieldConditionEditorFrame.operandsTypeId,
            operatorId,
        );
    }

    get operands() {
        const operands: MarketBoardOverlapsScanFieldCondition.Operands = {
            typeId: MarketBoardOverlapsScanFieldConditionEditorFrame.operandsTypeId,
            values: this._values.slice(),
        }
        return operands;
    }

    get values() { return this._values; }
    set values(value: readonly MarketBoardId[]) {
        if (isArrayEqual(value, this._values)) {
            this._values = value.slice();
            this.processChanged();
        }
    }
}

export namespace MarketBoardOverlapsScanFieldConditionEditorFrame {
    export type TypeId = ScanFieldCondition.TypeId.MarketBoardOverlaps;
    export const typeId = ScanFieldCondition.TypeId.MarketBoardOverlaps;
    export type OperandsTypeId = ScanFieldCondition.Operands.TypeId.MarketBoardEnum;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.MarketBoardEnum;
}
