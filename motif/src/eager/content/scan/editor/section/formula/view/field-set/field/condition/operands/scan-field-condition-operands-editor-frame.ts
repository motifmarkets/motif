/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MultiEvent, ScanFieldCondition } from '@motifmarkets/motif-core';
import { ComponentInstanceId, RootAndNodeComponentInstanceIdPair } from 'component-internal-api';

export interface ScanFieldConditionOperandsEditorFrame {
    readonly operandsTypeId: ScanFieldCondition.Operands.TypeId,
    readonly affirmativeOperatorDisplayLines: readonly string[];
    readonly valid: boolean;

    deleteMe(modifier: ScanFieldConditionOperandsEditorFrame.Modifier): void;

    subscribeChangedEvent(handler: ScanFieldConditionOperandsEditorFrame.ChangedEventHandler): MultiEvent.SubscriptionId;
    unsubscribeChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

export namespace ScanFieldConditionOperandsEditorFrame {
    export type Modifier = RootAndNodeComponentInstanceIdPair

    export type ChangedEventHandler = (this: void, modifierNode: ComponentInstanceId) => void;
}
