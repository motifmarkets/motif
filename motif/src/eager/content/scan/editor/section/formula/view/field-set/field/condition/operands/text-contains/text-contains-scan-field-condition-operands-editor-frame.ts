/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BaseTextScanFieldCondition, ScanFieldCondition, ScanFormula } from '@motifmarkets/motif-core';
import { NegatableOperator } from '../negatableOperator';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

export interface TextContainsScanFieldConditionOperandsEditorFrame extends ScanFieldConditionOperandsEditorFrame, NegatableOperator {
    readonly operandsTypeId: ScanFieldCondition.Operands.TypeId.TextContains,

    readonly operatorId: TextContainsScanFieldConditionOperandsEditorFrame.OperatorId;
    readonly value: string | undefined;
    readonly asId: ScanFormula.TextContainsAsId | undefined;
    readonly ignoreCase: boolean | undefined;

    setValue(value: string | undefined, modifier: ScanFieldConditionOperandsEditorFrame.Modifier): boolean;
    setAsId(value: ScanFormula.TextContainsAsId | undefined, modifier: ScanFieldConditionOperandsEditorFrame.Modifier): boolean;
    setIgnoreCase(value: boolean | undefined, modifier: ScanFieldConditionOperandsEditorFrame.Modifier): boolean;
}

export namespace TextContainsScanFieldConditionOperandsEditorFrame {
    export type OperatorId = BaseTextScanFieldCondition.ContainsOperands.OperatorId;
}
