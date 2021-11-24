/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BidAskSide, BidAskSideId, DepthDataItem, DepthStyleId } from 'adi-internal-api';
import { RevRecordIndex, RevRecordInvalidatedValue, RevRecordStore } from 'revgrid';
import {
    AssertInternalError,
    CorrectnessId,
    Integer,
    isDecimalEqual,
    Logger,
    moveElementInArray,
    MultiEvent,
    UnreachableCaseError
} from 'sys-internal-api';
import { DepthRecord } from './depth-record';
import { DepthSideGridRecordStore } from './depth-side-grid-record-store';
import { FullDepthRecord, OrderFullDepthRecord, PriceLevelFullDepthRecord } from './full-depth-record';

export class FullDepthSideGridRecordStore extends DepthSideGridRecordStore implements RevRecordStore {
    private _newPriceLevelAsOrder: boolean;

    private _dataItem: DepthDataItem;
    private _dataItemOrders: DepthDataItem.Order[];
    private _dataItemFinalised = true;
    private _orderIndex: FullDepthRecord[] = [];
    private _records: FullDepthRecord[] = [];

    private _dataCorrectnessChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _afterOrderAddSubscriptionId: MultiEvent.SubscriptionId;
    private _beforeOrderRemoveSubscriptionId: MultiEvent.SubscriptionId;
    private _orderChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _orderMoveAndChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _ordersClearSubscriptionId: MultiEvent.SubscriptionId;

    private _sideIdDisplay: string; // only used for debugging

    // required for debugging only - remove later
    constructor(styleId: DepthStyleId, sideId: BidAskSideId) {
        super(styleId, sideId);
        this._sideIdDisplay = BidAskSide.idToDisplay(sideId);
    }

    get recordCount(): number { return this.getRecordCount(); }

    finalise() {
        this.finaliseDataItem();
    }

    open(value: DepthDataItem, expand: boolean) {
        this._dataItem = value;
        this._dataItemOrders = this._dataItem.getOrders(this.sideId);

        this._dataCorrectnessChangeSubscriptionId = this._dataItem.subscribeCorrectnessChangeEvent(
            () => this.processDataCorrectnessChange()
        );

        this._afterOrderAddSubscriptionId = this._dataItem.subscribeAfterOrderInsertEvent(
            this.sideId, (index) => this.handleAfterOrderInsertEvent(index)
        );
        this._beforeOrderRemoveSubscriptionId = this._dataItem.subscribeBeforeOrderRemoveEvent(
            this.sideId, (index) => this.handleBeforeOrderRemoveEvent(index)
        );
        this._orderChangeSubscriptionId = this._dataItem.subscribeOrderChangeEvent(
            this.sideId,
            (index, oldQuantity, oldHasUndisclosed, valueChanges) =>
                this.handleOrderChangeEvent(index, oldQuantity, oldHasUndisclosed, valueChanges)
        );
        this._orderMoveAndChangeSubscriptionId = this._dataItem.subscribeOrderMoveAndChangeEvent(
            this.sideId,
            (fromIndex, toIndex, oldQuantity, oldHasUndisclosed, valueChanges) =>
                this.handleOrderMoveAndChangeEvent(fromIndex, toIndex, oldQuantity, oldHasUndisclosed, valueChanges)
        );
        this._ordersClearSubscriptionId = this._dataItem.subscribeBeforeOrdersClearEvent(() => this.handleOrdersClearEvent());

        this._dataItemFinalised = false;

        this.processDataCorrectnessChange();
    }

    close() {
        this.clearOrders();
        this.finaliseDataItem();
        this.resetOpenPopulated();
    }

    toggleRecordOrderPriceLevel(recordIndex: Integer) {
        const record = this._records[recordIndex];
        switch (record.typeId) {
            case DepthRecord.TypeId.Order:
                this.convertOrderToPriceLevel(record as OrderFullDepthRecord);
                break;
            case DepthRecord.TypeId.PriceLevel:
                this.convertPriceLevelToOrder(record as PriceLevelFullDepthRecord);
                break;
            default:
                throw new UnreachableCaseError('FDSGDSTROPL55857', record.typeId);
        }
    }

    setAllRecordsToOrder() {
        const oldLength = this._records.length;
        if (this._orderIndex.length > 0) {
            this._records.length = this._orderIndex.length;
            for (let i = 0; i < this._orderIndex.length; i++) {
                this._records[i] = new OrderFullDepthRecord(i, this._dataItemOrders[i], 0, this._auctionVolume);
                this._orderIndex[i] = this._records[i];
            }
            this.processAuctionAndVolumeAhead(0, true);
        }
        this._newPriceLevelAsOrder = true;

        this.eventifyRecordsLoaded();

        this.checkConsistency();
    }

    setAllRecordsToPriceLevel() {
        let recordCount = 0;
        const oldLength = this._records.length;
        if (this._orderIndex.length > 0) {
            this._records.length = this._orderIndex.length; // maximum possible
            let additionalOrderCount = 0;
            let record = new PriceLevelFullDepthRecord(0, this._dataItemOrders[0], 0, this._auctionVolume);
            let firstAdditionalOrderIdx = 1;
            this._orderIndex[0] = record;
            for (let i = 1; i < this._orderIndex.length; i++) {
                if (isDecimalEqual(this._dataItemOrders[i].price, record.price)) {
                    additionalOrderCount++;
                } else {
                    if (additionalOrderCount > 0) {
                        record.addOrders(this._dataItemOrders, firstAdditionalOrderIdx, additionalOrderCount);
                    }
                    this._records[recordCount++] = record;

                    record = new PriceLevelFullDepthRecord(record.index + 1, this._dataItemOrders[i], 0, this._auctionVolume);
                    firstAdditionalOrderIdx = i + 1;
                    additionalOrderCount = 0;
                }
                this._orderIndex[i] = record;
            }

            if (additionalOrderCount > 0) {
                record.addOrders(this._dataItemOrders, firstAdditionalOrderIdx, additionalOrderCount);
            }
            this._records[recordCount++] = record;

            this._records.length = recordCount;

            this.processAuctionAndVolumeAhead(0, true);
        }

        this.eventifyRecordsLoaded();

        this._newPriceLevelAsOrder = false;
        this.checkConsistency();
    }

    setNewPriceLevelAsOrder(value: boolean) {
        this._newPriceLevelAsOrder = true;
    }

    // GridDataStore methods
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
                this.populateRecords(this._newPriceLevelAsOrder);
                break;
            case CorrectnessId.Suspect:
                break;
            default:
                throw new UnreachableCaseError('FDSGDS88843', this._dataItem.correctnessId);
        }
    }

    private handleAfterOrderInsertEvent(index: Integer) {
        if (this._dataItem.usable) {
            if (debug) { Logger.logDebug(`Depth: ${this._sideIdDisplay} AfterOrderInsert: ${index}`); }
            this.insertOrder(index);
            this.checkConsistency();
        }
    }

    private handleBeforeOrderRemoveEvent(index: Integer) {
        if (this._dataItem.usable) {
            if (debug) { Logger.logDebug(`Depth: ${this._sideIdDisplay} BeforeOrderRemove: ${index}`); }
            this.checkConsistency(); // before
            this.removeOrder(index);
        }
    }

    private handleOrderChangeEvent(index: Integer,
        oldQuantity: Integer,
        oldHasUndisclosed: boolean,
        valueChanges: DepthDataItem.Order.ValueChange[]
    ) {
        if (this._dataItem.usable) {
            if (debug) {
                Logger.logDebug(`Depth: ${this._sideIdDisplay}` +
                    ` OrderChange: ${index} ${oldQuantity} ${oldHasUndisclosed} ${valueChanges}`
                );
            }
            this.changeOrder(index, oldQuantity, oldHasUndisclosed, valueChanges);
            this.checkConsistency();
        }
    }

    private handleOrderMoveAndChangeEvent(fromIndex: Integer, toIndex: Integer,
        oldQuantity: Integer,
        oldHasUndisclosed: boolean,
        valueChanges: DepthDataItem.Order.ValueChange[]
    ) {
        if (this._dataItem.usable) {
            if (debug) {
                Logger.logDebug(`Depth: ${this._sideIdDisplay} OrderMoveAndChange: ${fromIndex} ${toIndex} ` +
                    `${oldQuantity} ${oldHasUndisclosed} ${valueChanges}`
                );
            }
            this.moveAndChangeOrder(fromIndex, toIndex, oldQuantity, oldHasUndisclosed, valueChanges);
            this.checkConsistency();
        }
    }

    private handleOrdersClearEvent() {
        if (this._dataItem.usable) {
            if (debug) { Logger.logDebug(`Depth: ${BidAskSide.idToDisplay(this.sideId)} OrdersClear`); }
            this.checkConsistency(); // clear happens before
            this.clearOrders();
        }
    }

    private checkConsistency() {
        if (debug) {
            if (this._orderIndex.length !== this._dataItemOrders.length) {
                throw new AssertInternalError(`Depth: OrderIndex length error: ${this._orderIndex.length} ${this._dataItemOrders.length}`);
            } else {
                let recordIndex = 0;
                let levelOrderIndex = 0;
                for (let i = 0; i < this._orderIndex.length; i++) {
                    if (recordIndex >= this._records.length) {
                        throw new AssertInternalError('DepthCheckConsistencey: records length', `${i} ${recordIndex}`);
                    }
                    const record = this._records[recordIndex];
                    if (this._orderIndex[i] !== record) {
                        throw new AssertInternalError('DepthCheckConsistencey: orderIndex', `${i} ${recordIndex}`);
                    } else {
                        switch (record.typeId) {
                            case DepthRecord.TypeId.Order:
                                const orderRecord = record as OrderFullDepthRecord;
                                if (orderRecord.order !== this._dataItemOrders[i]) {
                                    throw new AssertInternalError('DepthCheckConsistencey: order dataItemOrder', `${i} ${recordIndex}`);
                                } else {
                                    recordIndex++;
                                    levelOrderIndex = 0;
                                }
                                break;
                            case DepthRecord.TypeId.PriceLevel:
                                const levelRecord = record as PriceLevelFullDepthRecord;
                                if (levelOrderIndex >= levelRecord.orders.length) {
                                    throw new AssertInternalError('DepthCheckConsistencey: levelOrderCount',
                                        `${i}  ${recordIndex} ${levelOrderIndex}`);
                                } else {
                                    if (levelRecord.orders[levelOrderIndex] !== this._dataItemOrders[i]) {
                                        throw new AssertInternalError('DepthCheckConsistencey: level dataItemOrder',
                                            `${i}  ${recordIndex} ${levelOrderIndex}`);
                                    } else {
                                        levelOrderIndex++;
                                        if (levelOrderIndex >= levelRecord.orders.length) {
                                            recordIndex++;
                                            levelOrderIndex = 0;
                                        }
                                    }
                                }
                                break;
                            default:
                                throw new UnreachableCaseError('FDSGDSCCR29987', record.typeId);
                        }
                    }
                }
            }
        }
    }

    private reindexRecords(fromIndex: Integer) {
        for (let i = fromIndex; i < this._records.length; i++) {
            this._records[i].index = i;
        }
    }

    /**
     *
     * @param recordIndex
     * @param doAllAuction
     * Set doAllAuction to true when existing auction and volumeAhead values no longer consistent
     */
    private createFullDepthRecordForNewPriceLevel(index: Integer, order: DepthDataItem.Order,
        volumeAhead: Integer | undefined, auctionQuantity: Integer | undefined
    ) {
        if (this._newPriceLevelAsOrder) {
            return new OrderFullDepthRecord(index, order, volumeAhead, auctionQuantity);
        } else {
            return new PriceLevelFullDepthRecord(index, order, volumeAhead, auctionQuantity);
        }
    }

    private insertOrder(index: Integer) {
        const order = this._dataItemOrders[index];

        // if not last, see if merge into successive order's price record or see if first (as first has not previous)
        if (index < this._orderIndex.length) {
            const succOrderRecord = this._orderIndex[index]; // not spliced yet so successive order is still at index
            if (FullDepthRecord.isPriceLevel(succOrderRecord)) {
                if (isDecimalEqual(succOrderRecord.price, order.price)) {
                    if (debug) { Logger.logDebug(`Depth: ${this._sideIdDisplay} Insert-MergeSuccessive: ${index}`); }
                    succOrderRecord.addOrder(order);
                    const lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(succOrderRecord.index, false);
                    this._orderIndex.splice(index, 0, succOrderRecord);
                    this.eventifyInvalidateRecordAndFollowingRecords(succOrderRecord.index, lastAffectedFollowingRecordIndex);
                    return;
                }
            }

            if (index === 0) {
                if (debug) { Logger.logDebug(`Depth: ${this._sideIdDisplay} Insert-First: ${index}`); }
                // new price level at first record position
                const firstRecord = this.createFullDepthRecordForNewPriceLevel(0, order, 0, this._auctionVolume);
                this._records.unshift(firstRecord);
                this.reindexRecords(1);
                const lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(0, false);
                this._orderIndex.splice(0, 0, firstRecord);
                this.eventifyRecordInserted(0, lastAffectedFollowingRecordIndex);
                return;
            }
        }

        // If not first, see if previous record is price and same price.  If so, merge
        if (index > 0) {
            const prevOrderRecord = this._orderIndex[index - 1];
            if (FullDepthRecord.isPriceLevel(prevOrderRecord)) {
                if (isDecimalEqual(prevOrderRecord.price, order.price)) {
                    if (debug) { Logger.logDebug(`Depth: ${this._sideIdDisplay} Insert-MergePrevious: ${index}`); }
                    prevOrderRecord.addOrder(order);
                    // eslint-disable-next-line @typescript-eslint/no-shadow
                    const lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(prevOrderRecord.index, false);
                    this._orderIndex.splice(index, 0, prevOrderRecord);
                    this.eventifyInvalidateRecordAndFollowingRecords(prevOrderRecord.index, lastAffectedFollowingRecordIndex);
                    return;
                }
            }

            // no merge required and not first. Add new record
            if (debug) { Logger.logDebug(`Depth: ${this._sideIdDisplay} Insert-NewButNotOnly: ${index}`); }
            const recordIndex = prevOrderRecord.index + 1;
            const record = this.createFullDepthRecordForNewPriceLevel(recordIndex, order,
                prevOrderRecord.cumulativeQuantity, this._auctionVolume);
            if (index === this._records.length) {
                if (debug) { Logger.logDebug(`Depth: ${this._sideIdDisplay} Insert-NewButNotOnly-Last: ${index}`); }
            }
            this._records.splice(recordIndex, 0, record); // may be last
            this.reindexRecords(recordIndex + 1);
            const lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(recordIndex, false);
            this._orderIndex.splice(index, 0, record); // may be last
            this.eventifyRecordInserted(recordIndex, lastAffectedFollowingRecordIndex);
            return;
        }

        if (debug) { Logger.logDebug(`Depth: ${this._sideIdDisplay} Insert-NewOnly: ${index}`); }
        // first and only record
        const onlyRecord = this.createFullDepthRecordForNewPriceLevel(0, order, 0, this._auctionVolume);
        this._records.push(onlyRecord);
        this._orderIndex.push(onlyRecord);
        onlyRecord.processAuctionAndVolumeAhead(0, this._auctionVolume);
        this.eventifyRecordInserted(0, undefined);
    }

    private removeRecord(recordIndex: Integer) {
        this._records.splice(recordIndex, 1);
        let lastAffectedFollowingRecordIndex: Integer | undefined;
        if (recordIndex >= this._records.length) {
            lastAffectedFollowingRecordIndex = undefined;
        } else {
            this.reindexRecords(recordIndex);
            lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(recordIndex, false);
        }
        this.eventifyRecordDeleted(recordIndex, lastAffectedFollowingRecordIndex);
    }

    private removeOrder(index: Integer) {
        const record = this._orderIndex[index];
        const recordIndex = record.index;
        this._orderIndex.splice(index, 1);
        switch (record.typeId) {
            case DepthRecord.TypeId.Order:
                if (debug) { Logger.logDebug(`Depth: ${this._sideIdDisplay} Remove-Order: ${index}`); }
                this.removeRecord(recordIndex);
                break;
            case DepthRecord.TypeId.PriceLevel:
                const priceLevelRecord = record as PriceLevelFullDepthRecord;
                if (priceLevelRecord.count === 1) {
                    if (debug) { Logger.logDebug(`Depth: ${this._sideIdDisplay} Remove-LastPrice: ${index}`); }
                    this.removeRecord(recordIndex);
                } else {
                    if (debug) { Logger.logDebug(`Depth: ${this._sideIdDisplay} Remove-NotLastPrice: ${index}`); }
                    // remove order from existing price level record
                    const order = this._dataItemOrders[index];
                    priceLevelRecord.removeOrder(order, order.quantity, order.hasUndisclosed);
                    const lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(recordIndex, false);
                    this.eventifyInvalidateRecordAndFollowingRecords(recordIndex, lastAffectedFollowingRecordIndex);
                }
                break;
            default:
                throw new UnreachableCaseError('FDSGDSMACO12121', record.typeId);
        }
    }

    private changeOrder(index: Integer,
        oldQuantity: Integer,
        oldHasUndisclosed: boolean,
        valueChanges: DepthDataItem.Order.ValueChange[]
    ) {
        const record = this._orderIndex[index];
        let invalidatedValues: RevRecordInvalidatedValue[];
        switch (record.typeId) {
            case DepthRecord.TypeId.Order:
                if (debug) {
                    Logger.logDebug(`Depth: ${this._sideIdDisplay}` +
                        ` OrderChange-Order: ${index} ${oldQuantity} ${oldHasUndisclosed} ${valueChanges}`
                    );
                }
                invalidatedValues = (record as OrderFullDepthRecord).processOrderValueChanges(valueChanges);
                break;
            case DepthRecord.TypeId.PriceLevel:
                if (debug) {
                    Logger.logDebug(`Depth: ${this._sideIdDisplay}` +
                        ` OrderChange-Price: ${index} ${oldQuantity} ${oldHasUndisclosed} ${valueChanges}`
                    );
                }
                const newOrder = this._dataItemOrders[index];
                invalidatedValues = (record as PriceLevelFullDepthRecord).processOrderChange(
                    newOrder, oldQuantity, oldHasUndisclosed, valueChanges
                );
                break;
            default:
                throw new UnreachableCaseError('FDSGDSMACO12122', record.typeId);
        }
        const lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(record.index, false);
        this.eventifyInvalidateRecordAndValuesAndFollowingRecords(record.index, invalidatedValues, lastAffectedFollowingRecordIndex);
        this.eventifyInvalidateRecordAndFollowingRecords(record.index, lastAffectedFollowingRecordIndex);
    }

    private moveAndChangeOrder(
        fromOrderIdx: Integer,
        toOrderIdx: Integer,
        oldQuantity: Integer,
        oldHasUndisclosed: boolean,
        valueChanges: DepthDataItem.Order.ValueChange[]
    ) {
        // order has already been modified and moved to toIndex in DataItem
        // work out whether fromIndex record will be deleted or have order extracted
        const newOrder = this._dataItemOrders[toOrderIdx];
        const fromRecord = this._orderIndex[fromOrderIdx];
        const fromRecordIdx = fromRecord.index;
        const fromToBeDemerged = fromRecord.getCount() > 1;

        let toRecordInvalidatedValues: RevRecordInvalidatedValue[] | undefined;

        // work out whether toIndex record will be created or have order merged
        let toRecord = this._orderIndex[toOrderIdx];
        let toToBeMerged: boolean;
        if (toRecord.typeId === DepthRecord.TypeId.PriceLevel && isDecimalEqual(toRecord.getPrice(), newOrder.price)) {
            // merge into existing toRecord
            toToBeMerged = true;
        } else {
            // see if merge with record on other side
            if (toOrderIdx > fromOrderIdx) {
                // check if merge into next record
                if (toRecord.index === this._records.length - 1) {
                    // toRecord is last record. No next record
                    toToBeMerged = false;
                } else {
                    const nextRecord = this._records[toRecord.index + 1];
                    if (nextRecord.typeId === DepthRecord.TypeId.PriceLevel && isDecimalEqual(nextRecord.getPrice(), newOrder.price)) {
                        // merge into next
                        toRecord = nextRecord;
                        toToBeMerged = true;
                    } else {
                        // insert after toRecord
                        toToBeMerged = false;
                    }
                }
            } else {
                // check if merge into previous record
                if (toRecord.index === 0) {
                    // toRecord is first record. No previous record
                    toToBeMerged = false;
                } else {
                    const prevRecord = this._records[toRecord.index - 1];
                    if (prevRecord.typeId === DepthRecord.TypeId.PriceLevel && isDecimalEqual(prevRecord.getPrice(), newOrder.price)) {
                        // merge into previous
                        toRecord = prevRecord;
                        toToBeMerged = true;
                    } else {
                        // insert before toRecord
                        toToBeMerged = false;
                    }
                }
            }
        }

        const toRecordIdx = toRecord.index;

        if (fromToBeDemerged && toToBeMerged && toRecord === fromRecord) {
            // does not move out of current price level record
            const toPriceLevelRecord = toRecord as PriceLevelFullDepthRecord;
            toRecordInvalidatedValues = toPriceLevelRecord.processOrderChange(newOrder, oldQuantity, oldHasUndisclosed, valueChanges);
        } else {
            // merge, demerge, shuffle, remove and insert as necessary
            if (fromToBeDemerged) {
                const fromPriceLevelRecord = fromRecord as PriceLevelFullDepthRecord;
                fromPriceLevelRecord.removeOrder(newOrder, oldQuantity, oldHasUndisclosed);

                if (toToBeMerged) {
                    if (debug) {
                        Logger.logDebug(`Depth: ${this._sideIdDisplay} OrderMoveAndChange - fromDemerge, toMerge:` +
                            ` ${fromOrderIdx} ${toOrderIdx} ${oldQuantity} ${oldHasUndisclosed} ${valueChanges}`
                        );
                    }
                    const toPriceLevelRecord = toRecord as PriceLevelFullDepthRecord;
                    toPriceLevelRecord.addOrder(newOrder);
                } else {
                    // create and insert 'to' record
                    if (debug) {
                        Logger.logDebug(`Depth: ${this._sideIdDisplay} OrderMoveAndChange - fromDemerge, to:` +
                            ` ${fromOrderIdx} ${toOrderIdx} ${oldQuantity} ${oldHasUndisclosed} ${valueChanges}`
                        );
                    }
                    let toVolumeAhead: Integer | undefined;
                    if (toRecordIdx === 0) {
                        toVolumeAhead = 0;
                    } else {
                        const prevRecord = this._records[toRecordIdx - 1];
                        toVolumeAhead = prevRecord.cumulativeQuantity;
                    }
                    toRecord = this.createFullDepthRecordForNewPriceLevel(toRecordIdx, newOrder, toVolumeAhead, this._auctionVolume);
                    this._records.splice(toRecordIdx, 0, toRecord);
                    this.reindexRecords(toRecordIdx + 1);
                    this.eventifyRecordInserted(toRecordIdx, undefined);
                }
            } else {
                if (toToBeMerged) {
                    if (debug) {
                        Logger.logDebug(`Depth: ${this._sideIdDisplay} OrderMoveAndChange - from, toMerge:` +
                            ` ${fromOrderIdx} ${toOrderIdx} ${oldQuantity} ${oldHasUndisclosed} ${valueChanges}`
                        );
                    }
                    const toPriceLevelRecord = toRecord as PriceLevelFullDepthRecord;
                    toPriceLevelRecord.addOrder(newOrder);

                    // delete 'from' record
                    this._records.splice(fromRecordIdx, 1);
                    this.reindexRecords(fromRecordIdx);
                    this.eventifyRecordDeleted(fromRecordIdx, undefined);
                } else {
                    if (debug) {
                        Logger.logDebug(`Depth: ${this._sideIdDisplay} OrderMoveAndChange - from, to:` +
                            ` ${fromOrderIdx} ${toOrderIdx} ${oldQuantity} ${oldHasUndisclosed} ${valueChanges}`
                        );
                    }
                    // shuffle records to remove and make space for 'from' at toIndex
                    if (toRecordIdx > fromRecordIdx) {
                        for (let i = fromRecordIdx; i < toRecordIdx; i++) {
                            this._records[i] = this._records[i + 1];
                            this._records[i].index = i;
                        }
                    } else {
                        for (let i = fromRecordIdx; i > toRecordIdx; i--) {
                            this._records[i] = this._records[i - 1];
                            this._records[i].index = i;
                        }
                    }

                    // move 'from' record to space at toRecordIdx
                    this._records[toRecordIdx] = fromRecord;
                    this._records[toRecordIdx].index = toRecordIdx;
                    switch (fromRecord.typeId) {
                        case DepthRecord.TypeId.Order:
                            toRecordInvalidatedValues = (fromRecord as OrderFullDepthRecord).processMovedWithOrderChange(valueChanges);
                            break;
                        case DepthRecord.TypeId.PriceLevel:
                            toRecordInvalidatedValues = (fromRecord as PriceLevelFullDepthRecord).processMovedWithOrderChange(
                                newOrder, oldQuantity, oldHasUndisclosed, valueChanges
                            );
                            break;
                        default:
                            throw new UnreachableCaseError('FDSGDSMACO12121', fromRecord.typeId);
                    }
                }
            }
        }

        // reindex and recalculate Auction and Quantity Ahead
        let lowRecordIdx: Integer;
        if (toRecordIdx > fromRecordIdx) {
            lowRecordIdx = fromRecordIdx;
        } else {
            lowRecordIdx = toRecordIdx;
        }
        this.reindexRecords(lowRecordIdx + 1);
        this.processAuctionAndVolumeAhead(lowRecordIdx, false);

        // update order index
        moveElementInArray<FullDepthRecord>(this._orderIndex, fromOrderIdx, toOrderIdx);
        this._orderIndex[toOrderIdx] = toRecord;

        const recordCount = this._records.length;
        if (toRecordInvalidatedValues === undefined) {
            this.eventifyInvalidateRecords(lowRecordIdx, recordCount - lowRecordIdx);
        } else {
            this.eventifyInvalidateRecordsAndRecordValues(lowRecordIdx, recordCount - lowRecordIdx, toRecordIdx, toRecordInvalidatedValues);
        }
    }

    private clearOrders() {
        this._orderIndex.length = 0;
        this._records.length = 0;
        this.eventifyAllRecordsDeleted();
    }

    private convertOrderToPriceLevel(record: OrderFullDepthRecord) {
        let orderIdx = this._orderIndex.indexOf(record);
        if (orderIdx < 0) {
            throw new AssertInternalError('FDSGDSFDRCOTPL11134', `${orderIdx}`);
        } else {
            // find first order record with same price
            const price = record.getPrice();
            while (--orderIdx >= 0 ) {
                if (!isDecimalEqual(this._orderIndex[orderIdx].getPrice(), price)) {
                    break;
                }
            }
            const firstOrderIdx = ++orderIdx;

            // create price level record
            const firstOrderRecord = this._orderIndex[firstOrderIdx];
            const levelRecordIndex = firstOrderRecord.index;
            if (!FullDepthRecord.isOrder(firstOrderRecord)) {
                throw new AssertInternalError('FDSGDSFDSGDSCOTPL22245', `${firstOrderRecord}`);
            } else {
                const levelRecord = new PriceLevelFullDepthRecord(levelRecordIndex,
                    firstOrderRecord.order, firstOrderRecord.volumeAhead, this._auctionVolume
                );

                // replace first order record with price level record
                this._orderIndex[firstOrderIdx] = levelRecord;
                this._records[levelRecordIndex] = levelRecord;

                // find range of additional orders with same price
                const firstAdditionalOrderIdx = firstOrderIdx + 1;
                orderIdx = firstAdditionalOrderIdx;
                const orderIndexLength = this._orderIndex.length;
                while (orderIdx < orderIndexLength) {
                    if (isDecimalEqual(this._dataItemOrders[orderIdx].price, price)) {
                        // throw a test in here to confirm is order record
                        const additionalOrderRecord = this._orderIndex[orderIdx];
                        if (!FullDepthRecord.isOrder(additionalOrderRecord)) {
                            throw new AssertInternalError('FDSGDSFDSGDSCOTPL98732', `${additionalOrderRecord.index}`);
                        } else {
                            this._orderIndex[orderIdx++] = levelRecord;
                        }
                    } else {
                        break;
                    }
                }

                // add additional orders to record and insert record in _records
                const additionalOrderCount = orderIdx - firstAdditionalOrderIdx;
                if (additionalOrderCount === 0) {
                    // fix Auction quantity and invalidate
                    const lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(levelRecord.index, false);
                    this.eventifyRecordsSplicedAndInvalidateUpTo(levelRecordIndex, 1, 1, lastAffectedFollowingRecordIndex);
                } else {
                    levelRecord.addOrders(this._dataItemOrders, firstAdditionalOrderIdx, additionalOrderCount);
                    // remove additional order records and from orderIndex
                    this._records.splice(levelRecordIndex + 1, additionalOrderCount);
                    this.reindexRecords(levelRecordIndex);
                    // fix Auction quantity and invalidate
                    const lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(levelRecordIndex, false);
                    this.eventifyRecordsSplicedAndInvalidateUpTo(
                        levelRecordIndex,
                        1 + additionalOrderCount,
                        1,
                        lastAffectedFollowingRecordIndex
                    );
                }
            }
        }
        this.checkConsistency();
    }

    private convertPriceLevelToOrder(record: PriceLevelFullDepthRecord) {
        const firstOrderIdx = this._orderIndex.indexOf(record);
        if (firstOrderIdx < 0) {
            throw new AssertInternalError('FDSGDSFDRCOTPL11136', `${firstOrderIdx}`);
        } else {
            const firstRecordIdx = record.index;

            // replace existing record with first order record
            const firstRecord = new OrderFullDepthRecord(firstRecordIdx, this._dataItemOrders[firstOrderIdx],
                record.volumeAhead, this._auctionVolume);
            this._orderIndex[firstOrderIdx] = firstRecord;
            this._records[record.index] = firstRecord;

            const additionalOrderCount = record.orders.length - 1;
            if (additionalOrderCount === 0) {
                // no additional orders
                // fix Auction quantity and invalidate
                const lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(firstRecord.index, false);
                this.eventifyRecordsSplicedAndInvalidateUpTo(firstRecord.index, 1, 1, lastAffectedFollowingRecordIndex);
            } else {
                // create order records for subsequent orders at this price
                const firstAdditionalOrderIdx = firstOrderIdx + 1;

                const firstAdditionalRecordIdx = firstRecordIdx + 1;
                const additionalOrderRecords = new Array<OrderFullDepthRecord>(additionalOrderCount);
                for (let i = 0; i < additionalOrderCount; i++) {
                    const recordIdx = firstAdditionalRecordIdx + i;
                    const order = this._dataItemOrders[firstAdditionalOrderIdx + i];
                    const additionalOrderRecord = new OrderFullDepthRecord(recordIdx, order, 0, this._auctionVolume);
                    additionalOrderRecords[i] = additionalOrderRecord;

                    // replace level record in orderIndex with additional order record
                    const orderIdx = firstAdditionalOrderIdx + i;
                    this._orderIndex[orderIdx] = additionalOrderRecord;
                }

                // add additional order records to _records
                this._records.splice(firstAdditionalRecordIdx, 0, ...additionalOrderRecords);
                this.reindexRecords(firstRecordIdx);

                const lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(firstRecord.index, false);
                this.eventifyRecordsSplicedAndInvalidateUpTo(
                    firstRecord.index,
                    1,
                    1 + additionalOrderCount,
                    lastAffectedFollowingRecordIndex
                );
            }
        }
        this.checkConsistency();
    }

    private populateRecords(expand: boolean) {
        this._orderIndex.length = this._dataItemOrders.length;
        if (expand) {
            this.setAllRecordsToOrder();
        } else {
            this.setAllRecordsToPriceLevel();
        }
        this.checkConsistency();

        super.checkResolveOpenPopulated(true);
    }

    private finaliseDataItem() {
        if (!this._dataItemFinalised) {
            this._dataItem.unsubscribeCorrectnessChangeEvent(this._dataCorrectnessChangeSubscriptionId);
            this._dataItem.unsubscribeAfterOrderInsertEvent(this.sideId, this._afterOrderAddSubscriptionId);
            this._dataItem.unsubscribeBeforeOrderRemoveEvent(this.sideId, this._beforeOrderRemoveSubscriptionId);
            this._dataItem.unsubscribeOrderChangeEvent(this.sideId, this._orderChangeSubscriptionId);
            this._dataItem.unsubscribeOrderMoveAndChangeEvent(this.sideId, this._orderMoveAndChangeSubscriptionId);
            this._dataItem.unsubscribeBeforeOrdersClearEvent(this._ordersClearSubscriptionId);

            this._dataItemFinalised = true;
        }
    }
}

const debug = false;
