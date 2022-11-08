import {
    GridRecordStore,
    Integer,
    MultiEvent,
    Table,
    TableGridField,
    UnexpectedUndefinedError
} from '@motifmarkets/motif-core';
import { RevRecord, RevRecordStore } from 'revgrid';

export class TableGridRecordStore implements GridRecordStore {
    private _table: Table | undefined;

    private _fieldsEventers: RevRecordStore.FieldsEventers;
    private _recordsEventers: RevRecordStore.RecordsEventers;

    private _allRecordsDeletedSubscriptionId: MultiEvent.SubscriptionId;
    private _recordsLoadedSubscriptionId: MultiEvent.SubscriptionId;
    private _recordsInsertedSubscriptionId: MultiEvent.SubscriptionId;
    private _recordsReplacedSubscriptionId: MultiEvent.SubscriptionId;
    private _recordsDeletedSubscriptionId: MultiEvent.SubscriptionId;
    private _recordValuesChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _recordSequentialFieldValuesChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _recordChangedSubscriptionId: MultiEvent.SubscriptionId;

    get recordCount(): Integer {
        return this._table === undefined ? 0 : this._table.recordCount;
    }

    setTable(value: Table) {
        if (this._table !== undefined) {
            this.unbindTable(this._table);
        }
        this._table = value;
        this.bindTable(value);
    }

    setFieldEventers(fieldsEventers: RevRecordStore.FieldsEventers): void {
        this._fieldsEventers = fieldsEventers;
    }

    setRecordEventers(recordsEventers: RevRecordStore.RecordsEventers): void {
        this._recordsEventers = recordsEventers;
    }

    getRecord(index: number): RevRecord {
        if (this._table === undefined) {
            throw new UnexpectedUndefinedError('TFGRV882455', `${index}`);
        } else {
            return this._table.getRecord(index);
        }
    }

    getRecords(): readonly RevRecord[] {
        if (this._table === undefined) {
            return [];
        } else {
            return this._table.records;
        }
    }

    addFields(fields: readonly TableGridField[]) {
        this._fieldsEventers.addFields(fields);
    }

    beginChange() {
        this._recordsEventers.beginChange();
    }
    endChange() {
        this._recordsEventers.endChange();
    }
    // recordsLoaded() {
    //     this._recordsEventers.recordsLoaded();
    // }
    // recordsInserted(index: Integer, count: Integer) {
    //     this._recordsEventers.recordsInserted(index, count);
    // }
    // recordsDeleted(index: Integer, count: Integer) {
    //     this._recordsEventers.recordsDeleted(index, count);
    // }
    // allRecordsDeleted() {
    //     this._recordsEventers.allRecordsDeleted();
    // }
    // invalidateRecordValues(recordIndex: GridRecordIndex, invalidatedValues: readonly GridRecordInvalidatedValue[]) {
    //     this._recordsEventers.invalidateRecordValues(
    //         recordIndex,
    //         invalidatedValues
    //     );
    // }
    // invalidateRecordFields(recordIndex: GridRecordIndex, fieldIndex: GridRecordFieldIndex, fieldCount: Integer) {
    //     this._recordsEventers.invalidateRecordFields(recordIndex, fieldIndex, fieldCount);
    // }
    // invalidateRecord(recordIndex: GridRecordIndex) {
    //     this._recordsEventers.invalidateRecord(recordIndex);
    // }

    private bindTable(table: Table) {
        this._allRecordsDeletedSubscriptionId = table.subscribeAllRecordsDeletedEvent(() => this._recordsEventers.allRecordsDeleted());
        this._recordsLoadedSubscriptionId = table.subscribeRecordsLoadedEvent(() => this._recordsEventers.recordsLoaded());
        this._recordsInsertedSubscriptionId = table.subscribeRecordsInsertedEvent(
            (index, count) => this._recordsEventers.recordsInserted(index, count)
        );
        this._recordsReplacedSubscriptionId = table.subscribeRecordsReplacedEvent(
            (index, count) => this._recordsEventers.invalidateRecords(index, count)
        );
        this._recordsDeletedSubscriptionId = table.subscribeRecordsDeletedEvent(
            (index, count) => this._recordsEventers.recordsDeleted(index, count)
        );
        this._recordValuesChangedSubscriptionId = table.subscribeRecordValuesChangedEvent(
            (recordIdx, invalidatedValues) => this._recordsEventers.invalidateRecordValues(recordIdx, invalidatedValues)
        );
        this._recordSequentialFieldValuesChangedSubscriptionId = table.subscribeRecordSequentialFieldValuesChangedEvent(
            (recordIdx, fieldIdx, fieldCount) => this._recordsEventers.invalidateRecordFields(recordIdx, fieldIdx, fieldCount)
        );
        this._recordChangedSubscriptionId = table.subscribeRecordChangedEvent(
            (recordIdx) => this._recordsEventers.invalidateRecord(recordIdx)
        );
    }

    private unbindTable(table: Table) {
        table.unsubscribeAllRecordsDeletedEvent(this._allRecordsDeletedSubscriptionId);
        this._allRecordsDeletedSubscriptionId = undefined;
        table.unsubscribeRecordsLoadedEvent(this._recordsLoadedSubscriptionId);
        this._recordsLoadedSubscriptionId = undefined;
        table.unsubscribeRecordsInsertedEvent(this._recordsInsertedSubscriptionId);
        this._recordsInsertedSubscriptionId = undefined;
        table.unsubscribeRecordsReplacedEvent(this._recordsReplacedSubscriptionId);
        this._recordsReplacedSubscriptionId = undefined;
        table.unsubscribeRecordsDeletedEvent(this._recordsDeletedSubscriptionId);
        this._recordsDeletedSubscriptionId = undefined;
        table.unsubscribeRecordValuesChangedEvent(this._recordValuesChangedSubscriptionId);
        this._recordValuesChangedSubscriptionId = undefined;
        table.unsubscribeRecordSequentialFieldValuesChangedEvent(this._recordSequentialFieldValuesChangedSubscriptionId);
        this._recordSequentialFieldValuesChangedSubscriptionId = undefined;
        table.unsubscribeRecordChangedEvent(this._recordChangedSubscriptionId);
        this._recordChangedSubscriptionId = undefined;
    }
}
