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

export class ExchangeOverlapsScanFieldConditionEditorFrame extends OverlapsScanFieldConditionEditorFrame
    implements
        ExchangeOverlapsScanFieldCondition,
        ExchangeOverlapsScanFieldConditionOperandsEditorFrame {

    override readonly typeId: ScanFieldCondition.TypeId.ExchangeOverlaps;

    private _values: readonly ExchangeId[];

    get operands() {
        const operands: ExchangeOverlapsScanFieldCondition.Operands = {
            values: this._values.slice(),
        }
        return operands;
    }

    get values() { return this._values; }
    set values(value: readonly ExchangeId[]) {
        if (isArrayEqual(value, this._values)) {
            this._values = value.slice();
            this.processChanged();
        }
    }
}
