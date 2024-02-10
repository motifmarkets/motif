/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DateInRangeScanField, ScanField, ScanFieldCondition, ScanFormula, UnreachableCaseError } from '@motifmarkets/motif-core';
import { DateScanFieldConditionEditorFrame, HasValueDateScanFieldConditionEditorFrame, RangeDateScanFieldConditionEditorFrame, ScanFieldConditionEditorFrame, ValueDateScanFieldConditionEditorFrame } from './condition/internal-api';
import { NotSubbedScanFieldEditorFrame } from './not-subbed-scan-field-editor-frame';
import { ScanFieldEditorFrame } from './scan-field-editor-frame';

export class DateInRangeScanFieldEditorFrame extends NotSubbedScanFieldEditorFrame implements DateInRangeScanField {
    declare readonly typeId: DateInRangeScanFieldEditorFrame.ScanFieldTypeId;
    declare readonly fieldId: DateInRangeScanFieldEditorFrame.ScanFormulaFieldId;
    declare readonly conditions: DateInRangeScanFieldEditorFrame.Conditions;
    declare readonly conditionTypeId: DateInRangeScanFieldEditorFrame.ConditionTypeId;

    constructor(
        fieldId: DateInRangeScanFieldEditorFrame.ScanFormulaFieldId,
        name: string,
    ) {
        super(
            DateInRangeScanFieldEditorFrame.typeId,
            fieldId,
            name,
            new DateInRangeScanFieldEditorFrame.conditions(),
            DateInRangeScanFieldEditorFrame.conditionTypeId,
        );
    }

    override get supportedOperatorIds() { return DateScanFieldConditionEditorFrame.supportedOperatorIds; }

    override addCondition(operatorId: DateInRangeScanFieldEditorFrame.OperatorId, modifier: ScanFieldEditorFrame.Modifier) {
        const conditionEditorFrame = this.createCondition(operatorId);
        this.conditions.add(conditionEditorFrame, modifier);
    }

    private createCondition(operatorId: DateInRangeScanFieldEditorFrame.OperatorId): DateScanFieldConditionEditorFrame {
        switch (operatorId) {
            case ScanFieldCondition.OperatorId.HasValue:
            case ScanFieldCondition.OperatorId.NotHasValue:
                return new HasValueDateScanFieldConditionEditorFrame(operatorId);
            case ScanFieldCondition.OperatorId.Equals:
            case ScanFieldCondition.OperatorId.NotEquals:
                return new ValueDateScanFieldConditionEditorFrame(operatorId, undefined);
            case ScanFieldCondition.OperatorId.InRange:
            case ScanFieldCondition.OperatorId.NotInRange:
                return new RangeDateScanFieldConditionEditorFrame(operatorId, undefined, undefined);
            default:
                throw new UnreachableCaseError('DIRSFEFCC22298', operatorId);
        }
    }
}

export namespace DateInRangeScanFieldEditorFrame {
    export const typeId = ScanField.TypeId.DateInRange;
    export type ScanFieldTypeId = typeof typeId;
    export type ScanFormulaFieldId = ScanFormula.DateRangeFieldId;
    export type Conditions = ScanFieldConditionEditorFrame.List<DateScanFieldConditionEditorFrame>;
    export const conditions = ScanFieldConditionEditorFrame.List<DateScanFieldConditionEditorFrame>;
    export type ConditionTypeId = ScanFieldCondition.TypeId.Date;
    export const conditionTypeId = ScanFieldCondition.TypeId.Date;
    export type OperatorId = DateScanFieldConditionEditorFrame.OperatorId;
}
