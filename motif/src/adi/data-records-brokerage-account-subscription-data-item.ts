/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer, MapKey, MultiEvent, UsableListChangeTypeId } from 'src/sys/internal-api';
import { BrokerageAccountDataRecord } from './brokerage-account-data-record';
import { BrokerageAccountGroup, SingleBrokerageAccountGroup } from './brokerage-account-group';
import { BrokerageAccountGroupDataRecordList } from './brokerage-account-group-data-record-list';
import { BrokerageAccountSubscriptionDataItem } from './brokerage-account-subscription-data-item';
import { DataDefinition } from './common/internal-api';
import { DataRecordList } from './data-record-list';

export abstract class DataRecordsBrokerageAccountSubscriptionDataItem<Record extends BrokerageAccountDataRecord>
    extends BrokerageAccountSubscriptionDataItem implements BrokerageAccountGroupDataRecordList<Record> {

    private _brokerageAccountGroup: BrokerageAccountGroup;

    private _records: Record[] = [];
    private _recordsMap = new Map<MapKey, Record>();

    private _listChangeMultiEvent = new MultiEvent<DataRecordList.ListChangeEventHandler>();
    private _beforeRecordChangeMultiEvent = new MultiEvent<DataRecordList.BeforeRecordChangeEventHandler>();
    private _afterRecordChangedMultiEvent = new MultiEvent<DataRecordList.AfterRecordChangedEventHandler>();

    get brokerageAccountGroup() { return this._brokerageAccountGroup; }

    get records() { return this._records; }
    get count() { return this._records.length; }

    constructor(definition: DataDefinition) {
        super(definition);
        this._brokerageAccountGroup = new SingleBrokerageAccountGroup(this.accountKey);
    }

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

    protected stop() {
        this.clearRecords(); // make sure disposed
        super.stop();
    }

    protected processSubscriptionPreOnline() {
        this.clearRecords();
        super.processSubscriptionPreOnline();
    }

    protected processUsableChanged() {
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

    protected processCorrectnessChange() {
        super.processCorrectnessChange();

        const correctnessId = this.correctnessId;
        for (const record of this._records) {
            record.setListCorrectness(correctnessId);
        }
    }

    protected checkUsableNotifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer): void {
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

    protected removeRecord(index: Integer) {
        const record = this._records[index];
        const mapKey = record.mapKey;
        record.dispose();
        this._records.splice(index, 1);
        this._recordsMap.delete(mapKey);
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

    protected hasRecord(mapKey: MapKey) {
        return this._recordsMap.has(mapKey);
    }

    protected indexOfRecordByMapKey(mapKey: MapKey) {
        const count = this.count;
        for (let i = 0; i < count; i++) {
            const record = this._records[i];
            if (record.mapKey === mapKey) {
                return i;
            }
        }
        return -1;
    }

    private notifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        const handlers = this._listChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, index, count);
        }
    }

    private notifyBeforeRecordChange(index: Integer) {
        const handlers = this._beforeRecordChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](index);
        }
    }

    private notifyAfterRecordChanged(index: Integer) {
        const handlers = this._afterRecordChangedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](index);
        }
    }
}
