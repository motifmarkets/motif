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
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

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
        this.updateValid();
    }

    get operands() {
        const operands: MarketBoardOverlapsScanFieldCondition.Operands = {
            typeId: MarketBoardOverlapsScanFieldConditionEditorFrame.operandsTypeId,
            values: this._values.slice(),
        }
        return operands;
    }

    override get valueCount() { return this._values.length; }

    get values() { return this._values; }
    setValues(value: readonly MarketBoardId[], modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (isArrayEqual(value, this._values)) {
            return false;
        } else {
            this._values = value.slice();
            return this.processChanged(modifier);
        }
    }
}

export namespace MarketBoardOverlapsScanFieldConditionEditorFrame {
    export const typeId = ScanFieldCondition.TypeId.MarketBoardOverlaps;
    export type TypeId = typeof typeId;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.MarketBoardEnum;
    export type OperandsTypeId = typeof operandsTypeId;
}
