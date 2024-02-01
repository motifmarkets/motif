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

    override readonly typeId: ScanFieldCondition.TypeId.MarketOverlaps;

    private _values: readonly MarketId[];

    get operands() {
        const operands: MarketOverlapsScanFieldCondition.Operands = {
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
