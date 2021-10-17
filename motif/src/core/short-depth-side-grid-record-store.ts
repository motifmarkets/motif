/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevRecordIndex, RevRecordStore } from 'revgrid';
import { DepthLevelsDataItem } from 'src/adi/internal-api';
import { CorrectnessId, Integer, MultiEvent, UnreachableCaseError } from 'src/sys/internal-api';
import { DepthSideGridRecordStore } from './depth-side-grid-record-store';
import { ShortDepthRecord } from './short-depth-record';

export class ShortDepthSideGridRecordStore extends DepthSideGridRecordStore implements RevRecordStore {
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
            () => this.processDataCorrectnessChange()
        );

        this._afterLevelAddSubscriptionId = this._dataItem.subscribeAfterLevelInsertEvent(
            this.sideId, (index) => this.handleAfterLevelInsertEvent(index)
        );
        this._beforeLevelRemoveSubscriptionId = this._dataItem.subscribeBeforeLevelRemoveEvent(
            this.sideId, (index) => this.handleBeforeLevelRemoveEvent(index)
        );
        this._levelChangeSubscriptionId = this._dataItem.subscribeLevelChangeEvent(
            this.sideId,
            (index, valueChanges) => this.handleLevelChangeEvent(index, valueChanges)
        );
        this._levelsClearSubscriptionId = this._dataItem.subscribeBeforeLevelsClearEvent(() => this.handleLevelsClearEvent());

        this._dataItemFinalised = false;

        this.processDataCorrectnessChange();
    }

    // abstract overloads
    close() {
        this.clearRecords();
        this.finaliseDataItem();
        this.resetOpenPopulated();
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
    get recordCount(): number { return this.getRecordCount(); }

    getRecord(recordIndex: RevRecordIndex) {
        return this._records[recordIndex];
    }

    getRecords() {
        return this._records;
    }

    protected getRecordCount() {
        return this._records.length;
    }

    private processDataCorrectnessChange() {
        switch (this._dataItem.correctnessId) {
            case CorrectnessId.Error:
                this.checkResolveOpenPopulated(false);
                break;
            case CorrectnessId.Usable:
            case CorrectnessId.Good:
                this.populateRecords();
                break;
            case CorrectnessId.Suspect:
                break;
            default:
                throw new UnreachableCaseError('SDSGDS88843', this._dataItem.correctnessId);
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

    private handleLevelChangeEvent(index: Integer, valueChanges: DepthLevelsDataItem.Level.ValueChange[]) {
        if (this._dataItem.usable) {
            this.changeRecord(index, valueChanges);
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
        let volumeAhead: Integer | undefined;
        if (index === 0) {
            volumeAhead = 0;
        } else {
            const prevRecord = this._records[index - 1];
            volumeAhead = prevRecord.cumulativeQuantity;
        }
        const level = this._levels[index];
        const record = new ShortDepthRecord(index, level, volumeAhead, this._auctionVolume);
        this._records.splice(index, 0, record);
        this.reindexRecords(index + 1);
        const lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(index, false);
        this.recordInsertedEvent(index, lastAffectedFollowingRecordIndex);
    }

    private deleteRecord(index: Integer) {
        this._records.splice(index, 1);
        let lastAffectedFollowingRecordIndex: Integer | undefined;
        if (index >= this._records.length) {
            lastAffectedFollowingRecordIndex = undefined;
        } else {
            this.reindexRecords(index);
            lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(index, false);
        }
        this.recordDeletedEvent(index, lastAffectedFollowingRecordIndex);
    }

    private changeRecord(index: Integer, valueChanges: DepthLevelsDataItem.Level.ValueChange[]) {
        const record = this._records[index];

        const lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(record.index, false);
        const invalidatedValues = record.processValueChanges(valueChanges);
        this.invalidateRecordAndValuesAndFollowingRecordsEventer(record.index, invalidatedValues, lastAffectedFollowingRecordIndex);
    }

    private clearRecords() {
        this._records.length = 0;
        this.allRecordsDeletedEvent();
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

        this.recordsLoadedEvent();

        super.checkResolveOpenPopulated(true);
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
