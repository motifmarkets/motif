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
    ) {
        super(DateScanFieldConditionEditorFrame.typeId, operandsTypeId, affirmativeOperatorDisplayLines);
    }

    abstract get operands(): DateScanFieldCondition.Operands;
    abstract override get operatorId(): DateScanFieldConditionEditorFrame.OperatorId;
}

export namespace DateScanFieldConditionEditorFrame {
    export const typeId = ScanFieldCondition.TypeId.Date;
    export type TypeId = typeof typeId;
    export type OperatorId = DateScanFieldCondition.Operands.OperatorId;
    export const supportedOperatorIds = DateScanFieldCondition.Operands.supportedOperatorIds;
}
