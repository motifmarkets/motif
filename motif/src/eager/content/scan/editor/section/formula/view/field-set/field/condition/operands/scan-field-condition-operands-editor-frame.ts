/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MultiEvent, ScanFieldCondition } from '@motifmarkets/motif-core';


export interface ScanFieldConditionOperandsEditorFrame {
    readonly operandsTypeId: ScanFieldCondition.Operands.TypeId,
    readonly affirmativeOperatorDisplayLines: readonly string[];
    readonly valid: boolean;

    removeMe(operandsEditorFrame: ScanFieldConditionOperandsEditorFrame): void;

    subscribeChangedEvent(handler: ScanFieldConditionOperandsEditorFrame.ChangedEventHandler): MultiEvent.SubscriptionId;
    unsubscribeChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

export namespace ScanFieldConditionOperandsEditorFrame {
    export type ChangedEventHandler = (this: void) => void;
}
