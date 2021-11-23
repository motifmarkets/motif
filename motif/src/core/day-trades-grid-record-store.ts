/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevRecordStore } from 'revgrid';
import { DayTradesDataItem } from 'src/adi/internal-api';
import { Integer, MultiEvent, UnreachableCaseError, UsableListChangeTypeId } from 'src/sys/internal-api';

export class DayTradesGridRecordStore implements RevRecordStore {
    fieldsEventers: RevRecordStore.FieldsEventers;
    recordsEventers: RevRecordStore.RecordsEventers;

    listChangeEvent: DayTradesGridDataStore.ListChangeEventHandler;
    recordChangeEvent: DayTradesGridDataStore.RecordChangeEventHandler;
    allRecordsChangeEvent: DayTradesGridDataStore.AllRecordsChangeEventHandler;

    private _dataItem: DayTradesDataItem | undefined;
    private _records: DayTradesDataItem.Record[] = [];
    private _recordCount = 0;

    private _dataItemListChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _dataItemRecordChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _dataItemDataCorrectnessChangeSubscriptionId: MultiEvent.SubscriptionId;

    get recordCount() { return this._recordCount; }

    setFieldEventers(fieldsEventers: RevRecordStore.FieldsEventers): void {
        this.fieldsEventers = fieldsEventers;
    }

    setRecordEventers(recordsEventers: RevRecordStore.RecordsEventers): void {
        this.recordsEventers = recordsEventers;
    }

    setDataItem(value: DayTradesDataItem) {
        this.clearDataItem();
        this._dataItem = value;
        this._dataItemListChangeSubscriptionId = this._dataItem.subscribeListChangeEvent(
            (listChangeTypeId, index, count) => this.handleDataItemListChangeEvent(listChangeTypeId, index, count)
        );
        this._dataItemRecordChangeSubscriptionId = this._dataItem.subscribeRecordChangeEvent(
            (index) => this.handleDataItemRecordChangeEvent(index)
        );
        this._dataItemDataCorrectnessChangeSubscriptionId = this._dataItem.subscribeCorrectnessChangeEvent(
            () => this.handleDataItemDataCorrectnessChangeEvent()
        );
        this._records = this._dataItem.records;
        this._recordCount = this._dataItem.recordCount;

        if (this._dataItem.usable) {
            this.processListChange(UsableListChangeTypeId.Usable, 0, 0);
        }
    }

    clearDataItem() {
        if (this._dataItem !== undefined) {
            this.processListChange(UsableListChangeTypeId.Clear, 0, 0); // empty Grid
            if (!this._dataItem.usable) {
                this.processListChange(UsableListChangeTypeId.Usable, 0, 0); // leave in good state
            }

            this._dataItem.unsubscribeListChangeEvent(this._dataItemListChangeSubscriptionId);
            this._dataItemListChangeSubscriptionId = undefined;
            this._dataItem.unsubscribeRecordChangeEvent(this._dataItemRecordChangeSubscriptionId);
            this._dataItemRecordChangeSubscriptionId = undefined;
            this._dataItem.unsubscribeCorrectnessChangeEvent(this._dataItemDataCorrectnessChangeSubscriptionId);
            this._dataItemDataCorrectnessChangeSubscriptionId = undefined;

            this._dataItem = undefined;
            this._recordCount = 0;
            this._records = [];
        }
    }

    getRecord(index: Integer) {
        return this._records[index];
    }

    getRecords() {
        return this._records.slice(0, this.recordCount);
    }

    private handleDataItemListChangeEvent(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        this.processListChange(listChangeTypeId, index, count);
    }

    private handleDataItemRecordChangeEvent(index: Integer) {
        this.recordChangeEvent(index);
    }

    private handleDataItemDataCorrectnessChangeEvent() {
        this.allRecordsChangeEvent();
    }

    // private adjustRecordIndex(idx: Integer) {
    //     return this._recordCount - idx - 1;
    // }

    private processListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                this.listChangeEvent(UsableListChangeTypeId.Unusable, 0, 0);
                break;
            case UsableListChangeTypeId.PreUsableClear:
                this._recordCount = 0;
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                this._recordCount += count;
                break;
            case UsableListChangeTypeId.Usable:
                this.listChangeEvent(UsableListChangeTypeId.PreUsableClear, 0, 0);
                if (this._recordCount > 0) {
                    this.listChangeEvent(UsableListChangeTypeId.PreUsableAdd, 0, this._recordCount);
                }
                this.listChangeEvent(UsableListChangeTypeId.Usable, 0, 0);
                break;
            case UsableListChangeTypeId.Insert:
                this._recordCount += count;
                this.listChangeEvent(UsableListChangeTypeId.Insert, index, count);
                break;
            case UsableListChangeTypeId.Remove:
                this.listChangeEvent(UsableListChangeTypeId.Remove, index, count);
                this._recordCount -= count;
                break;
            case UsableListChangeTypeId.Clear:
                this.listChangeEvent(UsableListChangeTypeId.Clear, 0, 0);
                this._recordCount = 0;
                break;
            default:
                throw new UnreachableCaseError('DTGDSPLC323334987', listChangeTypeId);
        }
    }

    // private createRecordsInReverseOrderArray() {
    //     const count = this._recordCount;
    //     const result = new Array<DayTradesDataItem.Record>(count);
    //     if (count > 0) {
    //         let last = count - 1;
    //         for (let i = 0; i < count; i++) {
    //             result[i] = this._records[last--];
    //         }
    //     }
    //     return result;
    // }
}

export namespace DayTradesGridDataStore {
    export type ListChangeEventHandler = (listChangeType: UsableListChangeTypeId, index: Integer, count: Integer) => void;
    export type RecordChangeEventHandler = (this: void, index: Integer) => void;
    export type AllRecordsChangeEventHandler = (this: void) => void;
}
