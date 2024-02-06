/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeSubscribableComparableList, ScanField, ScanFieldCondition, ScanFormula, TextHasValueEqualsScanField, UnreachableCaseError } from '@motifmarkets/motif-core';
import { HasValueTextHasValueEqualsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame, TextHasValueEqualsScanFieldConditionEditorFrame, ValueTextHasValueEqualsScanFieldConditionEditorFrame } from './condition/internal-api';
import { NotSubbedScanFieldEditorFrame } from './not-subbed-scan-field-editor-frame';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class TextHasValueEqualsScanFieldEditorFrame extends NotSubbedScanFieldEditorFrame implements TextHasValueEqualsScanField {
    declare readonly typeId: TextHasValueEqualsScanFieldEditorFrame.TypeId;
    declare readonly fieldId: TextHasValueEqualsScanFieldEditorFrame.FieldId;
    declare readonly conditions: TextHasValueEqualsScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: TextHasValueEqualsScanFieldEditorFrame.ConditionTypeId;

    constructor(
        fieldId: TextHasValueEqualsScanFieldEditorFrame.FieldId,
        name: string,
        deleteMeEventer: ScanFieldEditorFrame.DeleteMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
    ) {
        super(
            TextHasValueEqualsScanFieldEditorFrame.typeId,
            fieldId,
            name,
            new TextHasValueEqualsScanFieldEditorFrame.conditions(),
            TextHasValueEqualsScanFieldEditorFrame.conditionTypeId,
            deleteMeEventer,
            changedEventer,
        );
    }

    override get supportedOperatorIds() { return TextHasValueEqualsScanFieldConditionEditorFrame.supportedOperatorIds; }

    override addCondition(operatorId: TextHasValueEqualsScanFieldEditorFrame.OperatorId) {
        const conditionEditorFrame = this.createCondition(operatorId);
        this.conditions.add(conditionEditorFrame);
    }

    private createCondition(operatorId: TextHasValueEqualsScanFieldEditorFrame.OperatorId): TextHasValueEqualsScanFieldConditionEditorFrame {
        const { deleteMeEventer, changedEventer } = this.createConditionEditorFrameEventers();
        switch (operatorId) {
            case ScanFieldCondition.OperatorId.HasValue:
            case ScanFieldCondition.OperatorId.NotHasValue:
                return new HasValueTextHasValueEqualsScanFieldConditionEditorFrame(operatorId, deleteMeEventer, changedEventer);
            case ScanFieldCondition.OperatorId.Equals:
            case ScanFieldCondition.OperatorId.NotEquals:
                return new ValueTextHasValueEqualsScanFieldConditionEditorFrame(operatorId, undefined, deleteMeEventer, changedEventer);
            default:
                throw new UnreachableCaseError('THVESFEFCC22298', operatorId);
        }
    }
}

export namespace TextHasValueEqualsScanFieldEditorFrame {
    export type TypeId = ScanField.TypeId.TextHasValueEquals;
    export const typeId = ScanField.TypeId.TextHasValueEquals;
    export type FieldId = ScanFormula.TextHasValueEqualsFieldId;
    export type Conditions = ChangeSubscribableComparableList<TextHasValueEqualsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export const conditions = ChangeSubscribableComparableList<TextHasValueEqualsScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.TextHasValueEquals;
    export const conditionTypeId = ScanFieldCondition.TypeId.TextHasValueEquals;
    export type OperatorId = TextHasValueEqualsScanFieldConditionEditorFrame.OperatorId;
}
