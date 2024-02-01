/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ScanFieldCondition,
    StringOverlapsScanFieldCondition,
    isArrayEqual
} from '@motifmarkets/motif-core';
import {
    StringOverlapsScanFieldConditionOperandsEditorFrame
} from './operands/internal-api';
import { OverlapsScanFieldConditionEditorFrame } from './overlaps-scan-field-condition-editor-frame';

export class StringOverlapsScanFieldConditionEditorFrame extends OverlapsScanFieldConditionEditorFrame
    implements
        StringOverlapsScanFieldCondition,
        StringOverlapsScanFieldConditionOperandsEditorFrame {

    override readonly typeId: ScanFieldCondition.TypeId.StringOverlaps;

    private _values: readonly string[];

    get operands() {
        const operands: StringOverlapsScanFieldCondition.Operands = {
            values: this._values.slice(),
        }
        return operands;
    }

    get values() { return this._values; }
    set values(value: readonly string[]) {
        if (isArrayEqual(value, this._values)) {
            this._values = value.slice();
            this.processChanged();
        }
    }
}
