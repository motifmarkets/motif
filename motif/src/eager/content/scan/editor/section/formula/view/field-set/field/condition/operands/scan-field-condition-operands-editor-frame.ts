/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ScanFieldCondition } from '@motifmarkets/motif-core';

export interface ScanFieldConditionOperandsEditorFrame {
    operatorId: ScanFieldCondition.OperatorId;
    readonly valid: boolean;
}
