/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import Decimal from 'decimal.js-light';
import {
    assert,
    Badness,
    compareInteger,
    ComparisonResult,
    Integer,
    mSecsPerMin,
    MultiEvent,
    rangedEarliestBinarySearch,
    rangedQuickSort,
    SourceTzOffsetDateTime,
    SysTick,
    UnreachableCaseError,
    UsableListChangeTypeId
} from 'sys-internal-api';
import {
    AuiChangeTypeId,
    BidAskSideId,
    DataDefinition,
    DataMessage,
    DataMessageTypeId,
    LitIvemId,
    MarketId,
    MovementId,
    TradeAffectsId,
    TradeFlagId,
    TradesDataDefinition,
    TradesDataMessage
} from './common/internal-api';
import { DataItem } from './data-item';
import { MarketSubscriptionDataItem } from './market-subscription-data-item';

export class TradesDataItem extends MarketSubscriptionDataItem implements TradesDataItem.UsableBadnessRecordAccess {
    private _litIvemId: LitIvemId;

    private _records: TradesDataItem.Record[] = [];
    private _recordCount: Integer;
    private _lastGrowTime: SysTick.Time | undefined;
    /** Extra capacity added to _records whenever it is grown (except for first time) */
    private _extraGrowCount: Integer;
    /** To ensure we do not frequently resize this._records, we will increase this._extraGrowCount till grow events
     * are occuring at an interval of more than _targetMinGrowIntervalTickSpan milliseconds */
    private _targetMinGrowIntervalTickSpan: Integer;
    private _mostRecentPriorFirstTradeId: Integer;

    private _listChangeMultiEvent = new MultiEvent<TradesDataItem.ListChangeEventHandler>();
    private _recordChangeMultiEvent = new MultiEvent<TradesDataItem.RecordChangeEventHandler>();
    private _outOfRangeUpdateChangeMultiEvent = new MultiEvent<TradesDataItem.OutOfRangeUpdateChangeEventHandler>();

    constructor(MyDataDefinition: DataDefinition) {
        super(MyDataDefinition);
        const tradesSubscriptionDefinition = this.definition as TradesDataDefinition;
        this._litIvemId = tradesSubscriptionDefinition.litIvemId;

        this.setMarketId(this._litIvemId.litId);

        this.reset();
    }

    get records() { return this._records; }
    get recordCount() { return this._recordCount; }
    get mostRecentPriorFirstTradeId() { return this._mostRecentPriorFirstTradeId; }

    getRecord(idx: Integer) {
        return this._records[idx];
    }

    override processSubscriptionPreOnline() { // virtual
        this.beginUpdate();
        try {
            this.notifyUpdateChange();
            super.processSubscriptionPreOnline();
            // TODO:HIGH Clear data item values here.
        } finally {
            this.endUpdate();
        }
    }

    override processMessage(msg: DataMessage) {
        if (msg.typeId !== DataMessageTypeId.Trades) {
            super.processMessage(msg);

        } else {
            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                this.notifyUpdateChange();

                assert(msg instanceof TradesDataMessage, 'ID:8116103435');
                const tradesMessage = msg as TradesDataMessage;
                const changes = tradesMessage.changes;
                this.processTradesMessageChanges(changes);
            } finally {
                this.endUpdate();
            }
        }
    }

    processTradesMessageUpdateChange(change: TradesDataMessage.UpdateChange) {
        const { found, index } = this.findRecordById(change.id);
        if (found) {
            this.updateRecord(index, change);
        } else {
            this.notifyOutOfRangeUpdateChange(change);
        }
    }

    subscribeListChangeEvent(handler: TradesDataItem.ListChangeEventHandler) {
        return this._listChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._listChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeRecordChangeEvent(handler: TradesDataItem.RecordChangeEventHandler) {
        return this._recordChangeMultiEvent.subscribe(handler);
    }

    unsubscribeRecordChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._recordChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeOutOfRangeUpdateChangeEvent(handler: TradesDataItem.OutOfRangeUpdateChangeEventHandler) {
        return this._outOfRangeUpdateChangeMultiEvent.subscribe(handler);
    }

    unsubscribeOutOfRangeUpdateChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._outOfRangeUpdateChangeMultiEvent.unsubscribe(subscriptionId);
    }

    protected override processUsableChanged() {
        if (this.usable) {
            this.notifyListChange(UsableListChangeTypeId.PreUsableClear, 0, 0);
            const count = this._recordCount;
            if (count > 0) {
                this.notifyListChange(UsableListChangeTypeId.PreUsableAdd, 0, count);
            }
            this.notifyListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.notifyListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }

    private notifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        const handlers = this._listChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, index, count);
        }
    }

    private checkUsableNotifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        if (this.usable) {
            this.notifyListChange(listChangeTypeId, index, count);
        }
    }

    private notifyRecordChange(index: Integer, oldRecord: TradesDataItem.Record) {
        const handlers = this._recordChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](index, oldRecord);
        }
    }

    private notifyOutOfRangeUpdateChange(change: TradesDataMessage.UpdateChange) {
        const handlers = this._outOfRangeUpdateChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](change);
        }
    }

    private checkGoodNotifyRecordChange(index: Integer, oldRecord: TradesDataItem.Record) {
        if (this.usable) {
            this.notifyRecordChange(index, oldRecord);
        }
    }

    private reset() {
        this._records.length = 0;
        this._recordCount = 0;
        this._lastGrowTime = undefined;
        this._extraGrowCount = TradesDataItem.initialExtraGrowCount;
        this._targetMinGrowIntervalTickSpan = TradesDataItem.defaultTargetMinGrowIntervalTickSpan;
    }

    private findRecordById(recordId: Integer) {
        const searchRecord = TradesDataItem.searchRecord;
        searchRecord.id = recordId;
        return rangedEarliestBinarySearch(this._records, searchRecord, TradesDataItem.Record.compareId, 0, this._recordCount);
    }

    private checkGrowRecordsCapacity(addCount: Integer) {
        const newRequiredCapacity = this._recordCount + addCount;
        if (this._records.length < newRequiredCapacity) {
            const lastGrowTime = this._lastGrowTime;
            const nowTime = SysTick.now();
            if (lastGrowTime === undefined) {
                this._records.length = newRequiredCapacity;
            } else {
                if (nowTime - lastGrowTime < this._targetMinGrowIntervalTickSpan) {
                    this._extraGrowCount *= 2;
                }

                this._records.length = newRequiredCapacity + this._extraGrowCount;
            }
            this._lastGrowTime = nowTime;
        }
    }

    private createRecord(change: TradesDataMessage.AddUpdateChange) {
        const record: TradesDataItem.Record = {
            id: change.id,
            price: change.price,
            quantity: change.quantity,
            time: change.time,
            flagIds: change.flagIds,
            trendId: change.trendId,
            bidAskSideId: change.sideId,
            affectsIds: change.affectsIds,
            conditionCodes: change.conditionCodes,
            buyDepthOrderId: change.buyDepthOrderId,
            buyBroker: change.buyBroker,
            buyCrossRef: change.buyCrossRef,
            sellDepthOrderId: change.sellDepthOrderId,
            sellBroker: change.sellBroker,
            sellCrossRef: change.sellCrossRef,
            marketId: change.marketId,
            relatedId: change.relatedId,
            attributes: change.attributes,
        };
        return record;
    }

    private appendSortedRange(addChanges: TradesDataMessage.AddChange[], rangeStartIdx: Integer, count: Integer) {
        this.checkGrowRecordsCapacity(count);

        const recordStartIdx = this._recordCount;
        let recordIdx = recordStartIdx;
        const nextRangeIdx = rangeStartIdx + count;
        for (let idx = rangeStartIdx; idx < nextRangeIdx; idx++) {
            this._records[recordIdx++] = this.createRecord(addChanges[idx]);
        }
        this._recordCount = recordIdx;

        this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, recordStartIdx, count);
    }

    private insertSortedRange(addChanges: TradesDataMessage.AddChange[], rangeStartIdx: Integer, count: Integer, recordIdx: Integer) {
        this.checkGrowRecordsCapacity(count);

        const recordStartIdx = recordIdx;
        const nextRangeIdx = rangeStartIdx + count;
        for (let idx = rangeStartIdx; idx < nextRangeIdx; idx++) {
            this._records[recordIdx++] = this.createRecord(addChanges[idx]);
        }
        this._recordCount = recordIdx;

        this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, recordStartIdx, count);
    }

    private scanSortedRange(addChanges: TradesDataMessage.AddChange[], rangeStartIdx: Integer, rangeCount: Integer, recordIdx: Integer) {
        // rangeCount will be at least 2
        const nextRangeIdx = rangeStartIdx + rangeCount;
        const nextRecord = this._records[recordIdx + 1];
        const nextRecordId = nextRecord.id;
        let rangeIdx = rangeStartIdx + 1; // first addChange definitely needs to be added
        let changeId: Integer;
        do {
            const change = addChanges[++rangeIdx];
            changeId = change.id;
        } while (changeId < nextRecordId && rangeIdx < nextRangeIdx);

        this.insertSortedRange(addChanges, rangeStartIdx, rangeIdx - rangeStartIdx, recordIdx);
        return rangeIdx;
    }

    private updateRecord(recordIdx: Integer, change: TradesDataMessage.AddUpdateChange) {
        const oldRecord = this._records[recordIdx];
        this._records[recordIdx] = this.createRecord(change);
        this.checkGoodNotifyRecordChange(recordIdx, oldRecord);
    }

    private processSortedRange(addChanges: TradesDataMessage.AddChange[], rangeStartIdx: Integer, count: Integer) {
        const nextRangeIdx = rangeStartIdx + count;
        let rangeIdx = rangeStartIdx;
        while (rangeIdx < nextRangeIdx) {
            const change = addChanges[rangeIdx];
            const { found, index: recordIdx } = this.findRecordById(change.id);
            if (found) {
                this.updateRecord(recordIdx, change);
                rangeIdx++;
            } else {
                const remainingCount = nextRangeIdx - rangeIdx;
                if (recordIdx >= this._recordCount) {
                    this.appendSortedRange(addChanges, rangeIdx, remainingCount);
                    rangeIdx = nextRangeIdx;
                } else {
                    if (remainingCount === 1) {
                        this.insertSortedRange(addChanges, rangeIdx, 1, recordIdx);
                        rangeIdx++;
                    } else {
                        rangeIdx = this.scanSortedRange(addChanges, rangeIdx, remainingCount, recordIdx);
                    }
                }
            }
        }
    }

    private addUnsortedRange(addChanges: TradesDataMessage.AddChange[], rangeStartIdx: Integer, count: Integer) {
        rangedQuickSort(addChanges, TradesDataMessage.AddUpdateChange.compareId, rangeStartIdx, count);
        if (this._recordCount === 0) {
            this.appendSortedRange(addChanges, rangeStartIdx, count);
        } else {
            const firstChangeId = addChanges[0].id;
            const lastRecordId = this._records[this._recordCount - 1].id;
            if (firstChangeId > lastRecordId) {
                this.appendSortedRange(addChanges, rangeStartIdx, count);
            } else {
                // This handles case where record(s) are added which are not the latest.  Most likely this will not occur
                this.processSortedRange(addChanges, rangeStartIdx, count);
            }
        }
    }

    private checkAddRange(changes: TradesDataMessage.Change[],
        rangeStartIdx: Integer, rangeEndPlusOneIdx: Integer) {
        if (rangeStartIdx >= 0) {
            const addChanges = changes as TradesDataMessage.AddChange[];
            const count = rangeEndPlusOneIdx - rangeStartIdx;
            this.addUnsortedRange(addChanges, rangeStartIdx, count);
        }
        return -1;
    }

    private processTradesMessageChanges(changes: TradesDataMessage.Change[]) {
        let addStartMsgIdx = -1;
        const count = changes.length;

        for (let idx = 0; idx < count; idx++) {
            const change = changes[idx];
            switch (change.typeId) {
                case AuiChangeTypeId.Initialise:
                    addStartMsgIdx = this.checkAddRange(changes, addStartMsgIdx, idx);
                    this.reset();
                    const initialiseChange = change as TradesDataMessage.InitialiseChange;
                    this._mostRecentPriorFirstTradeId = initialiseChange.mostRecentId;
                    break;

                case AuiChangeTypeId.Update:
                    addStartMsgIdx = this.checkAddRange(changes, addStartMsgIdx, idx);
                    this.processTradesMessageUpdateChange(change as TradesDataMessage.UpdateChange);
                    break;

                case AuiChangeTypeId.Add:
                    if (addStartMsgIdx < 0) {
                        addStartMsgIdx = idx;
                    }
                    break;

                default:
                    throw new UnreachableCaseError('TSDIPTM8734612098', change.typeId);
            }
        }

        this.checkAddRange(changes, addStartMsgIdx, count);
    }
}


export namespace TradesDataItem {
    export const initialExtraGrowCount = 10;
    export const defaultTargetMinGrowIntervalTickSpan: SysTick.Span = 15 * mSecsPerMin; // 15 minutes
    export type ListChangeEventHandler = (listChangeType: UsableListChangeTypeId, index: Integer, count: Integer) => void;
    export type RecordChangeEventHandler = (this: void, index: Integer, oldRecord: TradesDataItem.Record) => void;
    export type OutOfRangeUpdateChangeEventHandler = (this: void, updateChange: TradesDataMessage.UpdateChange) => void;

    export interface Record {
        id: Integer;
        price: Decimal | undefined;
        quantity: Integer | undefined;
        time: SourceTzOffsetDateTime | undefined;
        flagIds: readonly TradeFlagId[];
        trendId: MovementId | undefined;
        bidAskSideId: BidAskSideId | undefined;
        affectsIds: readonly TradeAffectsId[];
        conditionCodes: string | undefined;
        buyDepthOrderId: string | undefined;
        buyBroker: string | undefined;
        buyCrossRef: string | undefined;
        sellDepthOrderId: string | undefined;
        sellBroker: string | undefined;
        sellCrossRef: string | undefined;
        marketId: MarketId | undefined;
        relatedId: Integer | undefined;
        attributes: readonly string[];
    }

    export namespace Record {
        export function compareId(left: Record, right: Record): ComparisonResult {
            return compareInteger(left.id, right.id);
        }
    }

    export const searchRecord: Record = {
        id: 0,
        price: undefined,
        quantity: undefined,
        time: undefined,
        flagIds: [],
        trendId: undefined,
        bidAskSideId: undefined,
        affectsIds: [],
        conditionCodes: undefined,
        buyDepthOrderId: undefined,
        buyBroker: undefined,
        buyCrossRef: undefined,
        sellDepthOrderId: undefined,
        sellBroker: undefined,
        sellCrossRef: undefined,
        marketId: undefined,
        relatedId: undefined,
        attributes: [],
    };

    export interface UsableBadnessRecordAccess {
        readonly usable: boolean;
        readonly badness: Badness;

        readonly recordCount: number;

        getRecord(idx: Integer): Record;

        subscribeBadnessChangeEvent(handler: DataItem.BadnessChangeEventHandler): MultiEvent.DefinedSubscriptionId;
        unsubscribeBadnessChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void;

        subscribeListChangeEvent(handler: TradesDataItem.ListChangeEventHandler): MultiEvent.DefinedSubscriptionId;
        unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void;

        subscribeRecordChangeEvent(handler: TradesDataItem.RecordChangeEventHandler): MultiEvent.DefinedSubscriptionId;
        unsubscribeRecordChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void;
    }
}
