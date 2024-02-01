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

    override readonly typeId: ScanFieldCondition.TypeId.TextHasValueEquals;

    abstract get operands(): BaseTextScanFieldCondition.HasValueOperands | BaseTextScanFieldCondition.ValueOperands;
    abstract override get operatorId(): TextHasValueEqualsScanFieldCondition.Operands.OperatorId;
}
