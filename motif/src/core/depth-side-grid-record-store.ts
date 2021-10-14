/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevRecordIndex, RevRecordInvalidatedValue } from 'revgrid';
import { BidAskSideId, DepthStyleId } from 'src/adi/internal-api';
import { Integer } from 'src/sys/internal-api';
import { DepthRecord } from './depth-record';

export abstract class DepthSideGridRecordStore {
    recordInsertedEvent: DepthSideGridRecordStore.RecordInsertedEventHandler;
    recordsInsertedEvent: DepthSideGridRecordStore.RecordsInsertedEventHandler;
    recordDeletedEvent: DepthSideGridRecordStore.RecordDeletedEventHandler;
    recordsDeletedEvent: DepthSideGridRecordStore.RecordsDeletedEventHandler;
    allRecordsDeletedEvent: DepthSideGridRecordStore.AllRecordsDeletedEventHandler;
    invalidateAllEvent: DepthSideGridRecordStore.InvalidateAllEventHandler;
    invalidateRecordsEvent: DepthSideGridRecordStore.InvalidateRecordsEventHandler;
    invalidateRecordAndFollowingRecordsEvent: DepthSideGridRecordStore.InvalidateRecordAndFollowingRecordsEventHandler;
    invalidateRecordAndValuesAndFollowingRecordsEventer: DepthSideGridRecordStore.InvalidateRecordAndValuesAndFollowingRecordsEventHandler;
    invalidateRecordsAndRecordValuesEventer: DepthSideGridRecordStore.InvalidateRecordsAndRecordValuesEventHandler;

    protected _auctionVolume: Integer | undefined;
    protected _volumeAheadNormalMaxRecordCount = 15; // make setting in future

    private _openPopulated = false;
    private _openPopulatedSuccess = false;
    private _openPopulatedResolves = new Array<DepthSideGridRecordStore.OpenPopulatedResolve>();

    constructor(private _styleId: DepthStyleId, private _sideId: BidAskSideId) { }

    get styleId() { return this._styleId; }
    get sideId() { return this._sideId; }

    resetOpenPopulated() {
        this.resolveOpenPopulated(false);
        this._openPopulated = false;
        this._openPopulatedSuccess = false;
    }

    waitOpenPopulated(): Promise<boolean> {
        if (this._openPopulated === true) {
            return Promise.resolve(this._openPopulatedSuccess); // Open population already occured
        } else {
            return new Promise<boolean>((resolve) => { this._openPopulatedResolves.push(resolve); });
        }
    }

    setAuctionQuantity(value: Integer | undefined) {
        if (value !== this._auctionVolume) {
            this._auctionVolume = value;
            if (this.getRecordCount() > 0) {
                const lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(0, true);
                this.invalidateRecordAndFollowingRecordsEvent(0, lastAffectedFollowingRecordIndex);
            }
        }
    }

    protected checkResolveOpenPopulated(success: boolean) {
        if (!this._openPopulated) {
            this._openPopulated = true;
            this._openPopulatedSuccess = success; // in case wait has not been called yet
            this.resolveOpenPopulated(success);
        }
    }

    protected processAuctionAndVolumeAhead(recordIndex: Integer, doAllAuction: boolean) {
        let volumeAhead: Integer | undefined;
        if (recordIndex === 0) {
            volumeAhead = 0;
        } else {
            const previousRecord = this.getRecord(recordIndex - 1);
            const previousVolumeAhead = previousRecord.volumeAhead;
            if (previousVolumeAhead === undefined) {
                volumeAhead = undefined;
            } else {
                volumeAhead = previousVolumeAhead + previousRecord.getVolume();
            }
        }
        let record = this.getRecord(recordIndex);
        let prevRecordProcessResult = record.processAuctionAndVolumeAhead(volumeAhead, this._auctionVolume);
        // loop, updating successive records until no more changes to inAuction or volumeAhead
        let lastAffectedFollowingRecordIndex: Integer | undefined;
        const recordCount = this.getRecordCount();
        for (let idx = recordIndex + 1; idx < recordCount; idx++) {
            // limit the number of volumeAhead to save processing.  However must always do all inAuction
            if ( record.inAuction === false && idx >= this._volumeAheadNormalMaxRecordCount) {
                volumeAhead = undefined;
            } else {
                volumeAhead = prevRecordProcessResult.cumulativeVolume;
            }

            record = this.getRecord(idx);
            prevRecordProcessResult = record.processAuctionAndVolumeAhead(volumeAhead, this._auctionVolume);
            if (prevRecordProcessResult.inAuctionOrVolumeAheadOrPartialChanged) {
                lastAffectedFollowingRecordIndex = idx;
            } else {
                if (!doAllAuction || record.inAuction) {
                    break;
                }
            }
        }

        return lastAffectedFollowingRecordIndex;
    }

    private resolveOpenPopulated(success: boolean) {
        if (this._openPopulatedResolves.length > 0) {
            for (const resolve of this._openPopulatedResolves) {
                resolve(success);
            }
            this._openPopulatedResolves.length = 0;
        }
    }

    abstract finalise(): void;
    abstract close(): void;
    abstract toggleRecordOrderPriceLevel(idx: Integer): void;
    abstract setAllRecordsToOrder(): void;
    abstract setAllRecordsToPriceLevel(): void;
    abstract setNewPriceLevelAsOrder(value: boolean): void;
    abstract getRecord(recordIndex: RevRecordIndex): DepthRecord;

    protected abstract getRecordCount(): Integer;
}

export namespace DepthSideGridRecordStore {
    export type RecordInsertedEventHandler = (this: void, index: Integer, lastAffectedFollowingRecordIndex: Integer | undefined) => void;
    export type RecordsInsertedEventHandler = (index: Integer, count: Integer, allInvalidated: boolean) => void;
    export type RecordDeletedEventHandler = (this: void, index: Integer, lastAffectedFollowingRecordIndex: Integer | undefined) => void;
    export type RecordsDeletedEventHandler = (index: Integer, count: Integer, allInvalidated: boolean) => void;
    export type AllRecordsDeletedEventHandler = (this: void) => void;
    export type InvalidateAllEventHandler = (this: void) => void;
    export type InvalidateRecordsEventHandler = (this: void, index: Integer, count: Integer) => void;
    export type InvalidateRecordAndFollowingRecordsEventHandler = (this: void, index: Integer, lastAffectedFollowingRecordIndex: Integer | undefined) => void;
    export type InvalidateRecordAndValuesAndFollowingRecordsEventHandler = (this: void,
        recordIndex: Integer,
        invalidatedRecordValues: RevRecordInvalidatedValue[],
        lastAffectedFollowingRecordIndex: Integer | undefined
    ) => void;
    export type InvalidateRecordsAndRecordValuesEventHandler = (this: void,
        recordIndex: Integer,
        count: Integer,
        valuesRecordIndex: Integer,
        invalidatedRecordValues: RevRecordInvalidatedValue[]
    ) => void;

    export type OpenPopulatedResolve = (this: void, success: boolean) => void;
}
