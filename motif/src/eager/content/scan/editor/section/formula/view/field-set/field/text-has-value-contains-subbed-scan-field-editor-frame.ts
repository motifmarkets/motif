/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ScanFieldCondition, ScanFormula, UnreachableCaseError } from '@motifmarkets/motif-core';
import { ContainsTextHasValueContainsScanFieldConditionEditorFrame, HasValueTextHasValueContainsScanFieldConditionEditorFrame, TextHasValueContainsScanFieldConditionEditorFrame } from './condition/internal-api';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export abstract class TextHasValueContainsSubbedScanFieldEditorFrame extends ScanFieldEditorFrame {
    override addCondition(operatorId: TextHasValueContainsSubbedScanFieldEditorFrame.OperatorId, modifier: ScanFieldEditorFrame.Modifier) {
        const conditionEditorFrame = this.createCondition(operatorId);
        this.conditions.add(conditionEditorFrame, modifier);
    }

    private createCondition(operatorId: TextHasValueContainsSubbedScanFieldEditorFrame.OperatorId): TextHasValueContainsScanFieldConditionEditorFrame {
        switch (operatorId) {
            case ScanFieldCondition.OperatorId.HasValue:
            case ScanFieldCondition.OperatorId.NotHasValue:
                return new HasValueTextHasValueContainsScanFieldConditionEditorFrame(operatorId);
            case ScanFieldCondition.OperatorId.Contains:
            case ScanFieldCondition.OperatorId.NotContains:
                return new ContainsTextHasValueContainsScanFieldConditionEditorFrame(operatorId, '', ScanFormula.TextContainsAsId.None, true);
            default:
                throw new UnreachableCaseError('THVCSSFEFCC34340', operatorId);
        }
    }
}

export namespace TextHasValueContainsSubbedScanFieldEditorFrame {
    export type OperatorId = TextHasValueContainsScanFieldConditionEditorFrame.OperatorId;
}
