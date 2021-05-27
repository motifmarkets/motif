/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BidAskSideId, DepthStyleId } from 'src/adi/internal-api';
import { Integer } from 'src/sys/internal-api';
import { DepthRecord } from './depth-record';

export abstract class DepthSideGridDataStore {
    insertRecordEvent: DepthSideGridDataStore.InsertRecordEventHandler;
    insertRecordsEvent: DepthSideGridDataStore.InsertRecordsEventHandler;
    deleteRecordEvent: DepthSideGridDataStore.DeleteRecordEventHandler;
    deleteRecordsEvent: DepthSideGridDataStore.DeleteRecordsEventHandler;
    deleteAllRecordsEvent: DepthSideGridDataStore.DeleteAllRecordsEventHandler;
    invalidateAllEvent: DepthSideGridDataStore.InvalidateAllEventHandler;
    invalidateRecordEvent: DepthSideGridDataStore.InvalidateRecordEventHandler;

    protected _auctionVolume: Integer | undefined;
    protected _quantityAheadNormalMaxRecordCount = 15; // make setting in future

    constructor(private _styleId: DepthStyleId, private _sideId: BidAskSideId) { }

    get styleId() { return this._styleId; }
    get sideId() { return this._sideId; }

    setAuctionQuantity(value: Integer | undefined) {
        if (value !== this._auctionVolume) {
            this._auctionVolume = value;
            if (this.getRecordCount() > 0) {
                const moreThanOneRecordAffected = this.processAuctionAndVolumeAhead(0, true);
                this.invalidateRecords(0, moreThanOneRecordAffected);
            }
        }
    }

    protected invalidateRecords(recordIndex: Integer, moreThanOneRecordAffected: boolean) {
        if (moreThanOneRecordAffected) {
            this.invalidateAllEvent();
        } else {
            this.invalidateRecordEvent(recordIndex);
        }
    }

    protected processAuctionAndVolumeAhead(recordIndex: Integer, doAllAuction: boolean) {
        let volumeAhead: Integer | undefined;
        if (recordIndex === 0) {
            volumeAhead = 0;
        } else {
            const previousRecord = this.getRecord(recordIndex - 1);
            const previousVolumeAhead = previousRecord.quantityAhead;
            if (previousVolumeAhead === undefined) {
                volumeAhead = undefined;
            } else {
                volumeAhead = previousVolumeAhead + previousRecord.getVolume();
            }
        }
        let record = this.getRecord(recordIndex);
        let prevRecordProcessResult = record.processAuctionAndVolumeAhead(volumeAhead, this._auctionVolume);
        // loop, updating successive records until no more changes to inAuction or quantityAhead
        let moreThanOneRecordAffected = false;
        const recordCount = this.getRecordCount();
        for (let idx = recordIndex + 1; idx < recordCount; idx++) {
            // limit the number of quantityAhead to save processing.  However must always do all inAuction
            if ( record.inAuction === false && idx >= this._quantityAheadNormalMaxRecordCount) {
                volumeAhead = undefined;
            } else {
                volumeAhead = prevRecordProcessResult.cumulativeVolume;
            }

            record = this.getRecord(idx);
            prevRecordProcessResult = record.processAuctionAndVolumeAhead(volumeAhead, this._auctionVolume);
            if (prevRecordProcessResult.inAuctionOrVolumeAheadOrPartialChanged) {
                moreThanOneRecordAffected = true;
            } else {
                if (!doAllAuction || record.inAuction) {
                    break;
                }
            }
        }

        return moreThanOneRecordAffected;
    }

    abstract close(): void;
    abstract finalise(): void;
    abstract toggleRecordOrderPriceLevel(idx: Integer): void;
    abstract setAllRecordsToOrder(): void;
    abstract setAllRecordsToPriceLevel(): void;
    abstract setNewPriceLevelAsOrder(value: boolean): void;

    protected abstract getRecordCount(): Integer;
    protected abstract getRecord(recordIndex: Integer): DepthRecord;
}

export namespace DepthSideGridDataStore {
    export type InsertRecordEventHandler = (this: void, index: Integer) => void;
    export type InsertRecordsEventHandler = (index: Integer, count: Integer) => void;
    export type DeleteRecordEventHandler = (this: void, index: Integer) => void;
    export type DeleteRecordsEventHandler = (index: Integer, count: Integer) => void;
    export type DeleteAllRecordsEventHandler = (this: void) => void;
    export type InvalidateAllEventHandler = (this: void) => void;
    export type InvalidateRecordEventHandler = (this: void, index: Integer) => void;
}
