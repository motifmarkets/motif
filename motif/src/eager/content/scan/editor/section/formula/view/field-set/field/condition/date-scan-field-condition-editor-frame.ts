/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DateScanFieldCondition, ScanFieldCondition } from '@motifmarkets/motif-core';
import { ScanFieldConditionEditorFrame } from './scan-field-condition-editor-frame';

export abstract class DateScanFieldConditionEditorFrame extends ScanFieldConditionEditorFrame implements DateScanFieldCondition {
    override readonly typeId: ScanFieldCondition.TypeId.Date;

    abstract get operands(): DateScanFieldCondition.Operands;
    abstract override get operatorId(): DateScanFieldCondition.Operands.OperatorId;
}
