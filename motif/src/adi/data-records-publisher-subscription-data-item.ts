/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer, MapKey, MultiEvent, UsableListChangeTypeId } from 'src/sys/internal-api';
import { DataRecord } from './data-record';
import { DataRecordList } from './data-record-list';
import { PublisherSubscriptionDataItem } from './publisher-subscription-data-item';

export class DataRecordsPublisherSubscriptionDataItem<Record extends DataRecord> extends PublisherSubscriptionDataItem
    implements DataRecordList<Record> {

    private _records: Record[] = [];
    private _recordsMap = new Map<MapKey, Record>();

    private _listChangeMultiEvent = new MultiEvent<DataRecordList.ListChangeEventHandler>();
    private _beforeRecordChangeMultiEvent = new MultiEvent<DataRecordList.BeforeRecordChangeEventHandler>();
    private _afterRecordChangedMultiEvent = new MultiEvent<DataRecordList.AfterRecordChangedEventHandler>();

    get records() { return this._records; }
    get count() { return this._records.length; }

    getRecordByMapKey(mapKey: MapKey) {
        return this._recordsMap.get(mapKey);
    }

    subscribeListChangeEvent(handler: DataRecordList.ListChangeEventHandler) {
        return this._listChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._listChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeBeforeRecordChangeEvent(handler: DataRecordList.BeforeRecordChangeEventHandler) {
        return this._beforeRecordChangeMultiEvent.subscribe(handler);
    }

    unsubscribeBeforeRecordChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._beforeRecordChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeAfterRecordChangedEvent(handler: DataRecordList.AfterRecordChangedEventHandler) {
        return this._afterRecordChangedMultiEvent.subscribe(handler);
    }

    unsubscribeAfterRecordChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._afterRecordChangedMultiEvent.unsubscribe(subscriptionId);
    }

    protected override stop() {
        this.clearRecords(); // make sure disposed
        super.stop();
    }

    protected override processCorrectnessChange() {
        super.processCorrectnessChange();

        const correctnessId = this.correctnessId;
        for (const record of this.records) {
            record.setListCorrectness(correctnessId);
        }
    }

    protected override processSubscriptionPreOnline() {
        this.clearRecords();
        super.processSubscriptionPreOnline();
    }

    protected override processUsableChanged() {
        if (this.usable) {
            this.notifyListChange(UsableListChangeTypeId.PreUsableClear, 0, 0);
            if (this.count > 0) {
                this.notifyListChange(UsableListChangeTypeId.PreUsableAdd, 0, this.count);
            }
            this.notifyListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.notifyListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }

    protected checkUsableNotifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        if (this.usable) {
            this.notifyListChange(listChangeTypeId, index, count);
        }
    }

    protected extendRecordCount(extra: Integer) {
        const extendStartIdx = this._records.length;
        this._records.length = extendStartIdx + extra;
        return extendStartIdx;
    }

    protected setRecord(index: Integer, record: Record) {
        this.records[index] = record;
        const mapKey = record.mapKey;
        this._recordsMap.set(mapKey, record);
    }

    protected clearRecords() {
        const count = this._records.length;
        if (count > 0) {
            this.beginUpdate();
            try {
                this.notifyUpdateChange();
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Clear, 0, count);
                this._recordsMap.clear();
                for (const record of this._records) {
                    record.dispose();
                }
                this._records.length = 0;
            } finally {
                this.endUpdate();
            }
        }
    }

    private notifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        const handlers = this._listChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, index, count);
        }
    }
}
