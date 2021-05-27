/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AllBrokerageAccountGroup, BrokerageAccountGroup, DataRecord, DataRecordList } from 'src/adi/internal-api';
import { Badness, Integer, MultiEvent, UnreachableCaseError, UsableListChangeTypeId } from 'src/sys/internal-api';
import { DataRecordTableRecordDefinition } from './data-record-table-record-definition';
import { SingleDataItemTableRecordDefinitionList } from './single-data-item-table-record-definition-list';
import { TableRecordDefinition } from './table-record-definition';
import { TableRecordDefinitionList } from './table-record-definition-list';

export abstract class DataRecordTableRecordDefinitionList<Record extends DataRecord>
    extends SingleDataItemTableRecordDefinitionList {

    private _definitions: DataRecordTableRecordDefinition<Record>[] = [];

    private _dataRecordList: DataRecordList<Record>;
    private _dataRecordListListChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    private _dataRecordListBeforeRecordChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    private _dataRecordListAfterRecordChangedEventSubscriptionId: MultiEvent.SubscriptionId;
    private _dataRecordListbadnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;

    get dataRecordList() { return this._dataRecordList; }

    // setting accountId to undefined will return orders for all accounts
    constructor(typeId: TableRecordDefinitionList.TypeId) {
        super(typeId);
    }

    getDefinition(idx: Integer): TableRecordDefinition {
        return this._definitions[idx];
    }

    activate() {
        this._dataRecordList = this.subscribeList();
        this._dataRecordListListChangeEventSubscriptionId = this._dataRecordList.subscribeListChangeEvent(
            (listChangeTypeId, idx, count) => this.handleListListChangeEvent(listChangeTypeId, idx, count)
        );
        this._dataRecordListBeforeRecordChangeEventSubscriptionId = this._dataRecordList.subscribeBeforeRecordChangeEvent(
            (index) => this.handleDataRecordListBeforeRecordChangeEvent(index)
        );
        this._dataRecordListAfterRecordChangedEventSubscriptionId = this._dataRecordList.subscribeAfterRecordChangedEvent(
            (index) => this.handleDataRecordListAfterRecordChangedEvent(index)
        );
        this._dataRecordListbadnessChangeEventSubscriptionId = this._dataRecordList.subscribeBadnessChangeEvent(
            () => this.handleDataRecordListBadnessChangeEvent()
        );

        super.activate();

        if (this._dataRecordList.usable) {
            const newCount = this._dataRecordList.count;
            if (newCount > 0) {
                this.processListListChange(UsableListChangeTypeId.PreUsableAdd, 0, newCount);
            }
            this.processListListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.processListListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }

    deactivate() {
        // TableRecordDefinitionList can no longer be used after it is deactivated
        if (this.count > 0) {
            this.notifyListChange(UsableListChangeTypeId.Clear, 0, this.count);
        }

        this._dataRecordList.unsubscribeListChangeEvent(this._dataRecordListListChangeEventSubscriptionId);
        this._dataRecordList.unsubscribeBadnessChangeEvent(this._dataRecordListbadnessChangeEventSubscriptionId);
        this._dataRecordList.unsubscribeBeforeRecordChangeEvent(this._dataRecordListBeforeRecordChangeEventSubscriptionId);
        this._dataRecordList.unsubscribeAfterRecordChangedEvent(this._dataRecordListAfterRecordChangedEventSubscriptionId);

        super.deactivate();

        this.unsubscribeList(this._dataRecordList);
    }

    protected getCount() { return this._definitions.length; }
    protected getCapacity() { return this._definitions.length; }
    protected setCapacity(value: Integer) { /* no code */ }

    protected processUsableChanged() {
        if (this.usable) {
            this.notifyListChange(UsableListChangeTypeId.PreUsableClear, 0, 0);
            const count = this.count;
            if (count > 0) {
                this.notifyListChange(UsableListChangeTypeId.PreUsableAdd, 0, count);
            }
            this.notifyListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.notifyListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }

    private handleListListChangeEvent(listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer) {
        this.processListListChange(listChangeTypeId, idx, count);
    }

    private handleDataRecordListBeforeRecordChangeEvent(index: Integer) {
        const definition = this._definitions[index];
        definition.dispose();
    }

    private handleDataRecordListAfterRecordChangedEvent(index: Integer) {
        const record = this._dataRecordList.records[index];
        const definition = this.createTableRecordDefinition(record);
        this._definitions[index] = definition;
    }

    private handleDataRecordListBadnessChangeEvent() {
        this.checkSetUnusable(this._dataRecordList.badness);
    }

    private insertRecords(idx: Integer, count: Integer) {
        if (count === 1) {
            const record = this._dataRecordList.records[idx];
            const definition = this.createTableRecordDefinition(record);
            if (idx === this._definitions.length) {
                this._definitions.push(definition);
            } else {
                this._definitions.splice(idx, 0, definition);
            }
        } else {
            const definitions = new Array<DataRecordTableRecordDefinition<Record>>(count);
            let insertArrayIdx = 0;
            for (let i = idx; i < idx + count; i++) {
                const record = this._dataRecordList.records[i];
                definitions[insertArrayIdx++] = this.createTableRecordDefinition(record);
            }
            this._definitions.splice(idx, 0, ...definitions);
        }
    }

    private processListListChange(listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                this.setUnusable(this._dataRecordList.badness);
                break;
            case UsableListChangeTypeId.PreUsableClear:
                this.setUnusable(Badness.preUsableClear);
                this._definitions.length = 0;
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                this.setUnusable(Badness.preUsableAdd);
                this.insertRecords(idx, count);
                break;
            case UsableListChangeTypeId.Usable:
                this.setUsable(this._dataRecordList.badness);
                break;
            case UsableListChangeTypeId.Insert:
                this.insertRecords(idx, count);
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, idx, count);
                break;
            case UsableListChangeTypeId.Remove:
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Remove, idx, count);
                this._definitions.splice(idx, count);
                break;
            case UsableListChangeTypeId.Clear:
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Clear, idx, count);
                this._definitions.length = 0;
                break;
            default:
                throw new UnreachableCaseError('BADRTRDLPLLC1815392487', listChangeTypeId);
        }
    }

    protected abstract subscribeList(): DataRecordList<Record>;
    protected abstract unsubscribeList(list: DataRecordList<Record>): void;
    protected abstract createTableRecordDefinition(record: Record): DataRecordTableRecordDefinition<Record>;
}

export namespace DataRecordTableRecordDefinitionList {
    export namespace JsonTag {
        export const brokerageAccountGroup = 'brokerageAccountGroup';
    }

    export const defaultAccountGroup: AllBrokerageAccountGroup = BrokerageAccountGroup.createAll();
}
