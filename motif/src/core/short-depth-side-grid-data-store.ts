/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridDataStore, TRecordIndex } from '@motifmarkets/revgrid';
import { DepthLevelsDataItem } from 'src/adi/internal-api';
import { Integer, MultiEvent } from 'src/sys/internal-api';
import { DepthSideGridDataStore } from './depth-side-grid-data-store';
import { ShortDepthRecord } from './short-depth-record';

export class ShortDepthSideGridDataStore extends DepthSideGridDataStore implements GridDataStore {
    private _records: ShortDepthRecord[] = [];
    private _dataItem: DepthLevelsDataItem;
    private _levels: DepthLevelsDataItem.Level[];
    private _dataItemFinalised = true;

    private _statusDataCorrectnessSubscriptionId: MultiEvent.SubscriptionId;
    private _afterLevelAddSubscriptionId: MultiEvent.SubscriptionId;
    private _beforeLevelRemoveSubscriptionId: MultiEvent.SubscriptionId;
    private _levelChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _levelsClearSubscriptionId: MultiEvent.SubscriptionId;

    finalise() {
        this.finaliseDataItem();
    }

    open(value: DepthLevelsDataItem) {
        this._dataItem = value;
        this._levels = this._dataItem.getLevels(this.sideId);

        this._statusDataCorrectnessSubscriptionId = this._dataItem.subscribeCorrectnessChangeEvent(
            () => this.handleDataCorrectnessChangeEvent()
        );

        this._afterLevelAddSubscriptionId = this._dataItem.subscribeAfterLevelInsertEvent(
            this.sideId, (index) => this.handleAfterLevelInsertEvent(index)
        );
        this._beforeLevelRemoveSubscriptionId = this._dataItem.subscribeBeforeLevelRemoveEvent(
            this.sideId, (index) => this.handleBeforeLevelRemoveEvent(index)
        );
        this._levelChangeSubscriptionId = this._dataItem.subscribeLevelChangeEvent(
            this.sideId,
            (index, changedFieldIds) =>
                this.handleLevelChangeEvent(index, changedFieldIds)
        );
        this._levelsClearSubscriptionId = this._dataItem.subscribeBeforeLevelsClearEvent(() => this.handleLevelsClearEvent());

        this._dataItemFinalised = false;

        if (this._dataItem.usable) {
            this.populateRecords();
        }
    }

    // abstract overloads
    close() {
        this.clearRecords();
        this.finaliseDataItem();
    }

    toggleRecordOrderPriceLevel(idx: Integer) {
        // ignore
    }

    setAllRecordsToOrder() {
        // ignore
    }

    setAllRecordsToPriceLevel() {
        // ignore
    }

    setNewPriceLevelAsOrder(value: boolean) {
        // ignore
    }

    // GridDataStore properties/methods
    get RecordCount(): number { return this.GetRecordCount(); }

    // eslint-disable-next-line @typescript-eslint/ban-types
    GetRecordValue(index: TRecordIndex): object {
        return this._records[index];
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    GetRecords(): object[] {
        return this._records;
    }

    GetRecordCount(): number {
        return this._records.length;
    }

    // GetAttributes not used

    protected getRecordCount() {
        return this._records.length;
    }

    protected getRecord(recordIndex: Integer) {
        return this._records[recordIndex];
    }

    private handleDataCorrectnessChangeEvent() {
        if (this._dataItem.usable) {
            this.populateRecords();
        }
    }

    private handleAfterLevelInsertEvent(index: Integer) {
        if (this._dataItem.usable) {
            this.insertRecord(index);
        }
    }

    private handleBeforeLevelRemoveEvent(index: Integer) {
        if (this._dataItem.usable) {
            this.deleteRecord(index);
        }
    }

    private handleLevelChangeEvent(index: Integer,
        changedFieldIds: DepthLevelsDataItem.Level.FieldId[]
    ) {
        if (this._dataItem.usable) {
            this.changeRecord(index, changedFieldIds);
        }
    }

    private handleLevelsClearEvent() {
        if (this._dataItem.usable) {
            this.clearRecords();
        }
    }

    private reindexRecords(fromIndex: Integer) {
        for (let i = fromIndex; i < this._records.length; i++) {
            this._records[i].index = i;
        }
    }

    private insertRecord(index: Integer) {
        let quantityAhead: Integer | undefined;
        if (index === 0) {
            quantityAhead = 0;
        } else {
            const prevRecord = this._records[index - 1];
            quantityAhead = prevRecord.cumulativeQuantity;
        }
        const level = this._levels[index];
        const record = new ShortDepthRecord(index, level, quantityAhead, this._auctionVolume);
        this._records.splice(index, 0, record);
        this.reindexRecords(index + 1);
        const moreThanOneRecordAffected = this.processAuctionAndVolumeAhead(index, false);
        this.insertRecordEvent(index);
        this.invalidateRecords(index, moreThanOneRecordAffected);
    }

    private deleteRecord(index: Integer) {
        this._records.splice(index, 1);
        let moreThanOneRecordAffected: boolean;
        if (index >= this._records.length) {
            moreThanOneRecordAffected = false;
        } else {
            this.reindexRecords(index);
            moreThanOneRecordAffected = this.processAuctionAndVolumeAhead(index, false);
        }
        this.deleteRecordEvent(index);

        if (moreThanOneRecordAffected) {
            this.invalidateAllEvent();
        }
    }

    private changeRecord(index: Integer, changedFieldIds: DepthLevelsDataItem.Level.FieldId[]) {
        const record = this._records[index];
        record.processChange(changedFieldIds);

        const moreThanOneRecordAffected = this.processAuctionAndVolumeAhead(record.index, false);
        this.invalidateRecords(record.index, moreThanOneRecordAffected);
    }

    private clearRecords() {
        this._records.length = 0;
        this.deleteAllRecordsEvent();
    }

    private populateRecords() {
        const oldLength = this._records.length;

        const list = this._dataItem.getLevels(this.sideId);
        if (list.length > 0) {
            this._records.length = list.length;
            for (let i = 0; i < list.length; i++) {
                const level = this._levels[i];
                this._records[i] = new ShortDepthRecord(i, level, 0, this._auctionVolume);
            }
            this.processAuctionAndVolumeAhead(0, true);
        }

        const recordCount = this._records.length;
        if (recordCount > oldLength) {
            this.insertRecordsEvent(oldLength, recordCount - oldLength);
        } else {
            if (recordCount < oldLength) {
                this.deleteRecordsEvent(recordCount, oldLength - recordCount);
            }
        }

        this.invalidateAllEvent();
    }

    private finaliseDataItem() {
        if (!this._dataItemFinalised) {
            this._dataItem.unsubscribeCorrectnessChangeEvent(this._statusDataCorrectnessSubscriptionId);
            this._dataItem.unsubscribeAfterLevelInsertEvent(this.sideId, this._afterLevelAddSubscriptionId);
            this._dataItem.unsubscribeBeforeLevelRemoveEvent(this.sideId, this._beforeLevelRemoveSubscriptionId);
            this._dataItem.unsubscribeLevelChangeEvent(this.sideId, this._levelChangeSubscriptionId);
            this._dataItem.unsubscribeBeforeLevelsClearEvent(this._levelsClearSubscriptionId);

            this._dataItemFinalised = true;
        }
    }
}
