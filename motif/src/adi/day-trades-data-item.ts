/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from 'res-internal-api';
import {
    AssertInternalError,
    Badness,
    compareInteger,
    ComparisonResult,
    EnumInfoOutOfOrderError,
    Integer,
    Logger,
    mSecsPerMin,
    MultiEvent,
    rangedEarliestBinarySearch,
    SysTick,
    UnreachableCaseError,
    UsableListChangeTypeId
} from 'sys-internal-api';
import {
    DataDefinition,
    DayTradesDataDefinition,
    LatestTradingDayTradesDataDefinition, LitIvemId, QueryTradesDataDefinition, TradeFlagId
} from './common/internal-api';
import { DataItem } from './data-item';
import { LatestTradingDayTradesDataItem } from './latest-trading-day-trades-data-item';
import { TradesDataItem } from './trades-data-item';

export class DayTradesDataItem extends DataItem {
    private _litIvemId: LitIvemId;
    private _date: Date | undefined;

    private _records: DayTradesDataItem.Record[] = [];
    private _recordCount: Integer;
    private _lastGrowTime: SysTick.Time | undefined;
    /** Extra capacity added to _records whenever it is grown (except for first time) */
    private _extraGrowCount: Integer;
    /** To ensure we do not frequently resize this._records, we will increase this._extraGrowCount till grow events
     * are occuring at an interval of more than _targetMinGrowIntervalTickSpan milliseconds */
    private _targetMinGrowIntervalTickSpan: Integer;

    private _latestDataItem: LatestTradingDayTradesDataItem;
    private _datedDataItem: TradesDataItem;
    private _dataItemRecordAccess: TradesDataItem.UsableBadnessRecordAccess;

    private _badnessChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _listChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _recordChangeSubscriptionId: MultiEvent.SubscriptionId;

    private _listChangeMultiEvent = new MultiEvent<DayTradesDataItem.ListChangeEventHandler>();
    private _recordChangeMultiEvent = new MultiEvent<DayTradesDataItem.RecordChangeEventHandler>();

    constructor(dataDefinition: DataDefinition) {
        super(dataDefinition);
        const typedDefinition = this.definition as DayTradesDataDefinition;
        this._litIvemId = typedDefinition.litIvemId;
        this._date = typedDefinition.date;

        this.reset();
    }

    get records() { return this._records; }
    get recordCount() { return this._recordCount; }

    subscribeListChangeEvent(handler: DayTradesDataItem.ListChangeEventHandler) {
        return this._listChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._listChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeRecordChangeEvent(handler: DayTradesDataItem.RecordChangeEventHandler) {
        return this._recordChangeMultiEvent.subscribe(handler);
    }

    unsubscribeRecordChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._recordChangeMultiEvent.unsubscribe(subscriptionId);
    }

    // subscribeCountChangeEvent(handler: DayTradesDataItem.ListChangeEventHandler) {
    //     return this._listChangeMultiEvent.subscribe(handler);
    // }

    // unsubscribeCountChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
    //     this._listChangeMultiEvent.unsubscribe(subscriptionId);
    // }

    protected override start() {
        if (this._date === undefined) {
            const latestDefinition = new LatestTradingDayTradesDataDefinition();
            latestDefinition.litIvemId = this._litIvemId;
            this._latestDataItem = this.subscribeDataItem(latestDefinition) as LatestTradingDayTradesDataItem;
            this._dataItemRecordAccess = this._latestDataItem;
        } else {
            const datedDefinition = new QueryTradesDataDefinition();
            datedDefinition.litIvemId = this._litIvemId;
            datedDefinition.tradingDate = this._date;
            this._datedDataItem = this.subscribeDataItem(datedDefinition) as TradesDataItem;
            this._dataItemRecordAccess = this._datedDataItem;
        }

        this._listChangeSubscriptionId = this._dataItemRecordAccess.subscribeListChangeEvent(
            (listChangeTypeId, index, count) => this.handleListChangeEvent(listChangeTypeId, index, count)
        );
        this._recordChangeSubscriptionId = this._dataItemRecordAccess.subscribeRecordChangeEvent(
            (index, oldTradeRecord) => this.handleRecordChangeEvent(index, oldTradeRecord)
        );
        this._badnessChangeSubscriptionId = this._dataItemRecordAccess.subscribeBadnessChangeEvent(
            () => this.handleBadnessChangeEvent()
        );

        if (this._dataItemRecordAccess.usable) {
            const dataItemRecordCount = this._dataItemRecordAccess.recordCount;
            if (dataItemRecordCount > 0) {
                this.processListChange(UsableListChangeTypeId.PreUsableAdd, 0, dataItemRecordCount);
            }
            this.processListChange(UsableListChangeTypeId.Usable, 0, 0);
        }

        super.start();
    }

    protected override stop() {
        if (this._dataItemRecordAccess !== undefined) {
            this._dataItemRecordAccess.unsubscribeListChangeEvent(this._listChangeSubscriptionId);
            this._dataItemRecordAccess.unsubscribeRecordChangeEvent(this._recordChangeSubscriptionId);
            this._dataItemRecordAccess.unsubscribeBadnessChangeEvent(this._badnessChangeSubscriptionId);
        }

        // one of latest or dated DataItems should be defined
        if (this._latestDataItem !== undefined) {
            this.unsubscribeDataItem(this._latestDataItem);
        }
        if (this._datedDataItem !== undefined) {
            this.unsubscribeDataItem(this._datedDataItem);
        }
    }

    protected calculateUsabilityBadness() {
        return this._dataItemRecordAccess.badness;
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

    private handleBadnessChangeEvent() {
        this.checkSetUnusuable(this._dataItemRecordAccess.badness);
    }

    private handleListChangeEvent(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        this.processListChange(listChangeTypeId, index, count);
    }

    private handleRecordChangeEvent(index: Integer, oldTradeRecord: TradesDataItem.Record) {
        this.processRecordChange(index, oldTradeRecord);
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

    private notifyRecordChange(index: Integer) {
        const handlers = this._recordChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](index);
        }
    }

    private checkGoodNotifyRecordChange(index: Integer) {
        if (this.usable) {
            this.notifyRecordChange(index);
        }
    }

    private reset() {
        this._records.length = 0;
        this._recordCount = 0;
        this._lastGrowTime = undefined;
        this._extraGrowCount = DayTradesDataItem.initialExtraGrowCount;
        this._targetMinGrowIntervalTickSpan = DayTradesDataItem.defaultTargetMinGrowIntervalTickSpan;
    }

    private findRecordById(recordId: Integer) {
        const searchRecord = DayTradesDataItem.searchRecord;
        searchRecord.tradeRecord.id = recordId;
        return rangedEarliestBinarySearch(this._records, searchRecord, DayTradesDataItem.Record.compareId, 0, this._recordCount);
    }

    private createRecord(index: number, tradeRecord: TradesDataItem.Record) {
        const result: DayTradesDataItem.Record = {
            index,
            typeId: DayTradesDataItem.Record.TypeId.Trade,
            tradeRecord,
            relatedRecord: undefined,
            cancellerRecord: undefined,
        };
        return result;
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

    private shuffleRecordsUp(index: Integer, count: Integer) {
        let dstIdx = this._recordCount + count - 1;
        for (let srcIdx = this._recordCount - 1; srcIdx >= index; srcIdx--) {
            const record = this._records[srcIdx];
            record.index = dstIdx;
            this._records[dstIdx--] = record;
        }
    }

    private calculateRecordNotCancelledTypeId(tradeRecord: TradesDataItem.Record) {
        const isCancel = tradeRecord.flagIds.includes(TradeFlagId.Cancel);
        return isCancel ? DayTradesDataItem.Record.TypeId.Canceller : DayTradesDataItem.Record.TypeId.Trade;
    }

    private updateRecordCancelled(recordId: Integer, cancelled: boolean) {
        const { found, index } = this.findRecordById(recordId);
        if (!found) {
            Logger.logDataError('DTDIURCF8777434024', this.definition.description);
            return undefined;
        } else {
            const record = this._records[index];
            const isAlreadyCancelled = record.typeId === DayTradesDataItem.Record.TypeId.Cancelled;
            if (isAlreadyCancelled === cancelled) {
                return undefined;
            } else {
                if (cancelled) {
                    record.typeId = DayTradesDataItem.Record.TypeId.Cancelled;
                } else {
                    record.typeId = this.calculateRecordNotCancelledTypeId(record.tradeRecord);
                }
                return index;
            }
        }
    }

    private checkInsertCancel(index: Integer) {
        const record = this._records[index];
        const tradeRecord = record.tradeRecord;
        const isCancel = tradeRecord.flagIds.includes(TradeFlagId.Cancel);
        if (!isCancel) {
            return undefined;
        } else {
            record.typeId = DayTradesDataItem.Record.TypeId.Canceller;
            const relatedId = tradeRecord.relatedId;
            if (relatedId === undefined) {
                Logger.logDataError('DTDICIC56694559', this.definition.description);
                return undefined;
            } else {
                return this.updateRecordCancelled(relatedId, true);
            }
        }
    }

    private insertRecords(index: Integer, count: Integer) {
        this.checkGrowRecordsCapacity(count);

        if (index < this._recordCount) {
            this.shuffleRecordsUp(index, count);
        }

        for (let i = 0; i < count; i++) {
            const recIdx = index + i;
            this._records[recIdx] = this.createRecord(recIdx, this._dataItemRecordAccess.getRecord(recIdx));
        }

        this._recordCount += count;

        const afterCountIdx = index + count;
        let changedRecordIndices: Integer[] | undefined;
        let changedRecordCount = 0;
        for (let insertIdx = index; insertIdx < afterCountIdx; insertIdx++) {
            const cancelledRecordIdx = this.checkInsertCancel(insertIdx);
            if (cancelledRecordIdx !== undefined) {
                if (changedRecordIndices === undefined) {
                    changedRecordIndices = new Array<Integer>(afterCountIdx - insertIdx); // maximum possible
                }
                changedRecordIndices[changedRecordCount++] = cancelledRecordIdx;
            }
        }

        if (changedRecordIndices !== undefined) {
            changedRecordIndices.length = changedRecordCount;
        }

        return changedRecordIndices;
    }

    private processListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                this.setUnusable(this._dataItemRecordAccess.badness);
                break;
            case UsableListChangeTypeId.PreUsableClear:
                this.setUnusable(Badness.preUsableClear);
                this.reset();
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                this.setUnusable(Badness.preUsableAdd);
                this.insertRecords(index, count);
                break;
            case UsableListChangeTypeId.Usable:
                this.trySetUsable();
                break;
            case UsableListChangeTypeId.Insert:
                const changedRecordIndices = this.insertRecords(index, count);
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, index, count);
                // changeRecordIndices contains indices of records affected by cancellations
                // make sure these are notified after insertion

                if (changedRecordIndices !== undefined) {
                    const changedRecordCount = changedRecordIndices.length;
                    for (let i = 0; i < changedRecordCount; i++) {
                        const changeIdx = changedRecordIndices[i];
                        this.checkGoodNotifyRecordChange(changeIdx);
                    }
                }
                break;
            case UsableListChangeTypeId.Remove:
                throw new AssertInternalError('DTDIPLCR193888369', this.definition.description);
            case UsableListChangeTypeId.Clear:
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Clear, 0, 0);
                this.reset();
                break;
            default:
                throw new UnreachableCaseError('DTDIPLCU10009134', listChangeTypeId);
        }
    }

    private processRecordChange(index: Integer, oldTradeRecord: TradesDataItem.Record) {
        const record = this._records[index];
        const newTradeRecord = record.tradeRecord;
        const oldIsCancel = oldTradeRecord.flagIds.includes(TradeFlagId.Cancel);
        const newIsCancel = newTradeRecord.flagIds.includes(TradeFlagId.Cancel);
        if (oldIsCancel !== newIsCancel) {
            // this should never happen
            const oldRelatedId = oldTradeRecord.relatedId;
            const newRelatedId = newTradeRecord.relatedId;
            if (oldRelatedId !== undefined && oldRelatedId !== newRelatedId) {
                const changedRecordIdx = this.updateRecordCancelled(oldRelatedId, false);
                if (changedRecordIdx !== undefined) {
                    this.checkGoodNotifyRecordChange(changedRecordIdx);
                }
            }
            if (newRelatedId === undefined) {
                Logger.logDataError('DTDIPRC454500281', this.definition.description);
            } else {
                const changedRecordIdx = this.updateRecordCancelled(newRelatedId, newIsCancel);
                if (changedRecordIdx !== undefined) {
                    record.relatedRecord = this._records[changedRecordIdx];
                    this.checkGoodNotifyRecordChange(changedRecordIdx);
                }
            }
            record.typeId = this.calculateRecordNotCancelledTypeId(newTradeRecord);
        }
    }
}

export namespace DayTradesDataItem {
    export const initialExtraGrowCount = 10;
    export const defaultTargetMinGrowIntervalTickSpan: SysTick.Span = 15 * mSecsPerMin; // 15 minutes
    export type ListChangeEventHandler = (this: void, listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) => void;
    export type RecordChangeEventHandler = (this: void, index: Integer) => void;

    export interface Record {
        index: number;
        typeId: Record.TypeId;
        tradeRecord: TradesDataItem.Record;
        relatedRecord: Record | undefined;
        cancellerRecord: Record | undefined;
    }

    export namespace Record {
        export function compareId(left: Record, right: Record): ComparisonResult {
            return compareInteger(left.tradeRecord.id, right.tradeRecord.id);
        }

        export const enum TypeId {
            Trade,
            Canceller,
            Cancelled,
        }

        export namespace Type {
            export type Id = TypeId;

            interface Info {
                readonly id: Id;
                readonly sortOrder: Integer;
                readonly displayId: StringId;
            }

            type InfosObject = { [id in keyof typeof TypeId]: Info };

            const infosObject: InfosObject = {
                Trade: {
                    id: TypeId.Trade,
                    sortOrder: 10,
                    displayId: StringId.DayTradesDataItemRecordTypeIdDisplay_Trade,
                },
                Canceller: {
                    id: TypeId.Canceller,
                    sortOrder: 20,
                    displayId: StringId.DayTradesDataItemRecordTypeIdDisplay_Canceller,
                },
                Cancelled: {
                    id: TypeId.Cancelled,
                    sortOrder: 30,
                    displayId: StringId.DayTradesDataItemRecordTypeIdDisplay_Cancelled,
                },
            };

            export const idCount = Object.keys(infosObject).length;
            const infos = Object.values(infosObject);

            export function initialise() {
                const outOfOrderIdx = infos.findIndex((info, idx) => info.id !== idx);
                if (outOfOrderIdx >= 0) {
                    throw new EnumInfoOutOfOrderError('DayTradesDataItem.Record.TypeId', outOfOrderIdx, idToDisplay(outOfOrderIdx));
                }
            }

            export function idToDisplayId(id: Id) {
                return infos[id].displayId;
            }

            export function idToDisplay(id: Id) {
                return Strings[idToDisplayId(id)];
            }

            export function sortCompareId(left: Id, right: Id) {
                return compareInteger(infos[left].id, infos[right].id);
            }
        }
    }

    export const searchRecord: Record = {
        index: -1,
        typeId: Record.TypeId.Trade,
        tradeRecord: TradesDataItem.searchRecord,
        relatedRecord: undefined,
        cancellerRecord: undefined,
    };

    export namespace Field {
        export const enum Id {
            Id,
            Price,
            Quantity,
            Time,
            FlagIds,
            TrendId,
            BidAskSideId,
            AffectsIds,
            ConditionCodes,
            BuyDepthOrderId,
            BuyBroker,
            BuyCrossRef,
            SellDepthOrderId,
            SellBroker,
            SellCrossRef,
            MarketId,
            RelatedId,
            Attributes,
            RecordTypeId,
        }

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly isBrokerPrivateData: boolean;
        }

        type InfosObject = { [id in keyof typeof Id]: Info };

        const infosObject: InfosObject = {
            Id: {
                id: Id.Id,
                name: 'Id',
                isBrokerPrivateData: false,
            },
            Price: {
                id: Id.Price,
                name: 'Price',
                isBrokerPrivateData: false,
            },
            Quantity: {
                id: Id.Quantity,
                name: 'Quantity',
                isBrokerPrivateData: false,
            },
            Time: {
                id: Id.Time,
                name: 'Time',
                isBrokerPrivateData: false,
            },
            FlagIds: {
                id: Id.FlagIds,
                name: 'FlagIds',
                isBrokerPrivateData: false,
            },
            TrendId: {
                id: Id.TrendId,
                name: 'TrendId',
                isBrokerPrivateData: false,
            },
            BidAskSideId: {
                id: Id.BidAskSideId,
                name: 'BidAskSideId',
                isBrokerPrivateData: false,
            },
            AffectsIds: {
                id: Id.AffectsIds,
                name: 'AffectsIds',
                isBrokerPrivateData: false,
            },
            ConditionCodes: {
                id: Id.ConditionCodes,
                name: 'ConditionCodes',
                isBrokerPrivateData: false,
            },
            BuyDepthOrderId: {
                id: Id.BuyDepthOrderId,
                name: 'BuyDepthOrderId',
                isBrokerPrivateData: false,
            },
            BuyBroker: {
                id: Id.BuyBroker,
                name: 'BuyBroker',
                isBrokerPrivateData: true,
            },
            BuyCrossRef: {
                id: Id.BuyCrossRef,
                name: 'BuyCrossRef',
                isBrokerPrivateData: true,
            },
            SellDepthOrderId: {
                id: Id.SellDepthOrderId,
                name: 'SellDepthOrderId',
                isBrokerPrivateData: false,
            },
            SellBroker: {
                id: Id.SellBroker,
                name: 'SellBroker',
                isBrokerPrivateData: true,
            },
            SellCrossRef: {
                id: Id.SellCrossRef,
                name: 'SellCrossRef',
                isBrokerPrivateData: true,
            },
            MarketId: {
                id: Id.MarketId,
                name: 'MarketId',
                isBrokerPrivateData: false,
            },
            RelatedId: {
                id: Id.RelatedId,
                name: 'RelatedId',
                isBrokerPrivateData: false,
            },
            Attributes: {
                id: Id.Attributes,
                name: 'Attributes',
                isBrokerPrivateData: false,
            },
            RecordTypeId: {
                id: Id.RecordTypeId,
                name: 'RecordTypeId',
                isBrokerPrivateData: false,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: number) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('DayTradeDataItem.Field.Id', outOfOrderIdx, `${idToName(outOfOrderIdx)}`);
            }
        }

        export function idToName(id: Id) {
            return infos[id].name;
        }

        export function idToIsBrokerPrivateData(id: Id) {
            return infos[id].isBrokerPrivateData;
        }
    }
}

export namespace DayTradesDataItemModule {
    export function initialiseStatic() {
        DayTradesDataItem.Field.initialise();
        DayTradesDataItem.Record.Type.initialise();
    }
}
