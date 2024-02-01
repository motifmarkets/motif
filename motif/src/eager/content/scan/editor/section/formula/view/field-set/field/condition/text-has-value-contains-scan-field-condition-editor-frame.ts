/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    BaseTextScanFieldCondition,
    ScanFieldCondition,
    TextHasValueContainsScanFieldCondition
} from '@motifmarkets/motif-core';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export abstract class TextHasValueContainsScanFieldConditionEditorFrame extends ScanFieldConditionEditorFrame
    implements
        TextHasValueContainsScanFieldCondition {

    override readonly typeId: ScanFieldCondition.TypeId.TextHasValueContains;

    abstract get operands(): BaseTextScanFieldCondition.HasValueOperands | BaseTextScanFieldCondition.ContainsOperands;
    abstract override get operatorId(): TextHasValueContainsScanFieldCondition.Operands.OperatorId;
}
