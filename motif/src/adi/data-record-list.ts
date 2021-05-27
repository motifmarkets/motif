/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness, CorrectnessId, Integer, MapKey, MultiEvent, UsableListChangeTypeId } from 'src/sys/internal-api';
import { DataItem } from './data-item';
import { DataRecord } from './data-record';

export interface DataRecordList<Record extends DataRecord> {
    readonly usable: boolean;
    readonly correctnessId: CorrectnessId;
    readonly badness: Badness;

    readonly count: Integer;
    readonly records: Record[];

    getRecordByMapKey(key: MapKey): Record | undefined;

    subscribeBadnessChangeEvent(handler: DataItem.BadnessChangeEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeBadnessChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void;

    subscribeListChangeEvent(handler: DataRecordList.ListChangeEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void;

    subscribeBeforeRecordChangeEvent(handler: DataRecordList.BeforeRecordChangeEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeBeforeRecordChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void;

    subscribeAfterRecordChangedEvent(handler: DataRecordList.AfterRecordChangedEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeAfterRecordChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

export namespace DataRecordList {
    export type ListChangeEventHandler = (this: void, listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer) => void;
    export type BeforeRecordChangeEventHandler = (this: void, index: Integer) => void;
    export type AfterRecordChangedEventHandler = (this: void, index: Integer) => void;
}
