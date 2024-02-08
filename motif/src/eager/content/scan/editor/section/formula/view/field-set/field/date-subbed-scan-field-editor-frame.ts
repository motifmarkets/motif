/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DateSubbedScanField, ScanField, ScanFieldCondition, ScanFormula, UiBadnessComparableList, UnreachableCaseError } from '@motifmarkets/motif-core';
import { DateScanFieldConditionEditorFrame, HasValueDateScanFieldConditionEditorFrame, RangeDateScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame, ValueDateScanFieldConditionEditorFrame } from './condition/internal-api';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class DateSubbedScanFieldEditorFrame extends ScanFieldEditorFrame implements DateSubbedScanField {
    declare readonly typeId: DateSubbedScanFieldEditorFrame.ScanFieldTypeId;
    declare readonly fieldId: DateSubbedScanFieldEditorFrame.ScanFormulaFieldId;
    declare readonly subFieldId: DateSubbedScanFieldEditorFrame.ScanFormulaSubFieldId;
    declare readonly conditions: DateSubbedScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: DateSubbedScanFieldEditorFrame.ConditionTypeId;

    constructor(
        subFieldId: DateSubbedScanFieldEditorFrame.ScanFormulaSubFieldId,
        name: string,
        deleteMeEventer: ScanFieldEditorFrame.DeleteMeEventHandler,
        changedEventer: ScanFieldEditorFrame.ValidChangedEventHandler,
    ) {
        super(
            DateSubbedScanFieldEditorFrame.typeId,
            DateSubbedScanFieldEditorFrame.fieldId,
            subFieldId,
            name,
            new DateSubbedScanFieldEditorFrame.conditions(),
            DateSubbedScanFieldEditorFrame.conditionTypeId,
            deleteMeEventer,
            changedEventer,
        );
    }

    override get supportedOperatorIds() { return DateScanFieldConditionEditorFrame.supportedOperatorIds; }

    override addCondition(operatorId: DateSubbedScanFieldEditorFrame.OperatorId) {
        const conditionEditorFrame = this.createCondition(operatorId);
        this.conditions.add(conditionEditorFrame);
    }

    private createCondition(operatorId: DateSubbedScanFieldEditorFrame.OperatorId): DateScanFieldConditionEditorFrame {
        const { deleteMeEventer, changedEventer } = this.createConditionEditorFrameEventers();
        switch (operatorId) {
            case ScanFieldCondition.OperatorId.HasValue:
            case ScanFieldCondition.OperatorId.NotHasValue:
                return new HasValueDateScanFieldConditionEditorFrame(operatorId, deleteMeEventer, changedEventer);
            case ScanFieldCondition.OperatorId.Equals:
            case ScanFieldCondition.OperatorId.NotEquals:
                return new ValueDateScanFieldConditionEditorFrame(operatorId, undefined, deleteMeEventer, changedEventer);
            case ScanFieldCondition.OperatorId.InRange:
            case ScanFieldCondition.OperatorId.NotInRange:
                return new RangeDateScanFieldConditionEditorFrame(operatorId, undefined, undefined, deleteMeEventer, changedEventer);
            default:
                throw new UnreachableCaseError('DSSFEFCC22298', operatorId);
        }
    }
}

export namespace DateSubbedScanFieldEditorFrame {
    export const typeId = ScanField.TypeId.DateSubbed;
    export type ScanFieldTypeId = typeof typeId;
    export const fieldId = ScanFormula.FieldId.DateSubbed;
    export type ScanFormulaFieldId = typeof fieldId;
    export type ScanFormulaSubFieldId = ScanFormula.DateSubFieldId;
    export type Conditions = UiBadnessComparableList<DateScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export const conditions = UiBadnessComparableList<DateScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.Date;
    export const conditionTypeId = ScanFieldCondition.TypeId.Date;
    export type OperatorId = DateScanFieldConditionEditorFrame.OperatorId;
}
