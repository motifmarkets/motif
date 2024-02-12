/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    BaseTextScanFieldCondition,
    ScanFieldCondition,
    TextHasValueEqualsScanFieldCondition
} from '@motifmarkets/motif-core';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export abstract class TextHasValueEqualsScanFieldConditionEditorFrame extends ScanFieldConditionEditorFrame
    implements
        TextHasValueEqualsScanFieldCondition {

    declare readonly typeId: TextHasValueEqualsScanFieldConditionEditorFrame.TypeId;

    constructor(
        operandsTypeId: ScanFieldCondition.Operands.TypeId,
        affirmativeOperatorDisplayLines: readonly string[],
    ) {
        super(TextHasValueEqualsScanFieldConditionEditorFrame.typeId, operandsTypeId, affirmativeOperatorDisplayLines);
    }

    abstract get operands(): BaseTextScanFieldCondition.HasValueOperands | BaseTextScanFieldCondition.ValueOperands;
    abstract override get operatorId(): TextHasValueEqualsScanFieldConditionEditorFrame.OperatorId;
}

export namespace TextHasValueEqualsScanFieldConditionEditorFrame {
    export const typeId = ScanFieldCondition.TypeId.TextHasValueEquals;
    export type TypeId = typeof typeId;
    export type OperatorId = TextHasValueEqualsScanFieldCondition.Operands.OperatorId;
    export const supportedOperatorIds = TextHasValueEqualsScanFieldCondition.Operands.supportedOperatorIds;
}
