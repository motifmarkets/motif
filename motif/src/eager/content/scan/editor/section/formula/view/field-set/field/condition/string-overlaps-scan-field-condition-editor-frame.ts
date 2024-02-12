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
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export class StringOverlapsScanFieldConditionEditorFrame extends OverlapsScanFieldConditionEditorFrame
    implements
        StringOverlapsScanFieldCondition,
        StringOverlapsScanFieldConditionOperandsEditorFrame {

    declare readonly typeId: StringOverlapsScanFieldConditionEditorFrame.TypeId;
    declare readonly operandsTypeId: StringOverlapsScanFieldConditionEditorFrame.OperandsTypeId;

    constructor(
        operatorId: OverlapsScanFieldConditionEditorFrame.OperatorId,
        private _values: readonly string[],
    ) {
        super(
            StringOverlapsScanFieldConditionEditorFrame.typeId,
            StringOverlapsScanFieldConditionEditorFrame.operandsTypeId,
            operatorId,
        );
    }

    get operands() {
        const operands: StringOverlapsScanFieldCondition.Operands = {
            typeId: StringOverlapsScanFieldConditionEditorFrame.operandsTypeId,
            values: this._values.slice(),
        }
        return operands;
    }

    get values() { return this._values; }
    setValues(value: readonly string[], modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (isArrayEqual(value, this._values)) {
            this._values = value.slice();
            this.processChanged(modifier);
        }
    }
}

export namespace StringOverlapsScanFieldConditionEditorFrame {
    export const typeId = ScanFieldCondition.TypeId.StringOverlaps;
    export type TypeId = typeof typeId;
    export const operandsTypeId = ScanFieldCondition.Operands.TypeId.TextEnum;
    export type OperandsTypeId = typeof operandsTypeId;
}
