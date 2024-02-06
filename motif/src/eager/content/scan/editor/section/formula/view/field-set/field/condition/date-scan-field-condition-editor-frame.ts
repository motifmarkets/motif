/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DateScanFieldCondition, ScanFieldCondition } from '@motifmarkets/motif-core';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export abstract class DateScanFieldConditionEditorFrame extends ScanFieldConditionEditorFrame implements DateScanFieldCondition {
    declare readonly typeId: DateScanFieldConditionEditorFrame.TypeId;

    constructor(
        operandsTypeId: ScanFieldCondition.Operands.TypeId,
        affirmativeOperatorDisplayLines: readonly string[],
        deleteMeEventer: ScanFieldConditionEditorFrame.DeleteMeEventer,
        changedEventer: ScanFieldConditionEditorFrame.ChangedEventer,
    ) {
        super(DateScanFieldConditionEditorFrame.typeId, operandsTypeId, affirmativeOperatorDisplayLines, deleteMeEventer, changedEventer);
    }

    abstract get operands(): DateScanFieldCondition.Operands;
    abstract override get operatorId(): DateScanFieldConditionEditorFrame.OperatorId;
}

export namespace DateScanFieldConditionEditorFrame {
    export type TypeId = ScanFieldCondition.TypeId.Date;
    export const typeId = ScanFieldCondition.TypeId.Date;
    export type OperatorId = DateScanFieldCondition.Operands.OperatorId;
    export const supportedOperatorIds = DateScanFieldCondition.Operands.supportedOperatorIds;
}
