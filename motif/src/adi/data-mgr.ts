/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    assert,
    AssertInternalError,
    assigned,
    ComparableList,
    ComparisonResult,
    concatenateArrayUniquely,
    Integer,
    Logger,
    MapKey,
    mSecsPerSec,
    NotImplementedError,
    secsPerMin,
    SysTick,
    UnreachableCaseError
} from 'src/sys/internal-api';
import { AllBalancesDataItem } from './all-balances-data-item';
import { AllHoldingsDataItem } from './all-holdings-data-item';
import { AllOrdersDataItem } from './all-orders-data-item';
import { AmendOrderDataItem } from './amend-order-data-item';
import { BrokerageAccountBalancesDataItem } from './brokerage-account-balances-data-item';
import { BrokerageAccountHoldingsDataItem } from './brokerage-account-holdings-data-item';
import { BrokerageAccountOrdersDataItem } from './brokerage-account-orders-data-item';
import { BrokerageAccountsDataItem } from './brokerage-accounts-data-item';
import { CancelOrderDataItem } from './cancel-order-data-item';
import { ChartHistoryDataItem } from './chart-history-data-item';
import { ClassFeedsDataItem } from './class-feeds-data-item';
import {
    broadcastDataItemRequestNr,
    DataChannel,
    DataChannelId,
    DataDefinition,
    DataItemId,
    DataMessage,
    DataMessages,
    PublisherTypeId
} from './common/internal-api';
import { DataItem } from './data-item';
import { DataItemsActivationMgr } from './data-items-activation-mgr';
import { DayTradesDataItem } from './day-trades-data-item';
import { DepthDataItem } from './depth-data-item';
import { DepthLevelsDataItem } from './depth-levels-data-item';
import { ExtConnectionDataItem } from './ext-connection-data-item';
import { FeedsDataItem } from './feeds-data-item';
import { LatestTradingDayTradesDataItem } from './latest-trading-day-trades-data-item';
import { LowLevelTopShareholdersDataItem } from './low-level-top-shareholders-data-item';
import { MarketsDataItem } from './markets-data-item';
import { MoveOrderDataItem } from './move-order-data-item';
import { OrderStatusesDataItem } from './order-statuses-data-item';
import { PlaceOrderDataItem } from './place-order-data-item';
import { Publisher } from './publisher';
import { ZenithPublisher } from './publishers/internal-api';
import { SecurityDataItem } from './security-data-item';
import { SymbolsDataItem } from './symbols-data-item';
import { TopShareholdersDataItem } from './top-shareholders-data-item';
import { TradesDataItem } from './trades-data-item';
import { TradingStatesDataItem } from './trading-states-data-item';
import { TransactionsDataItem } from './transactions-data-item';
import { ZenithExtConnectionDataItem } from './zenith-ext-connection-data-item';
import { ZenithServerInfoDataItem } from './zenith-server-info-data-item';

export class DataMgr {
    private readonly _referencableDataItems = new DataMgr.ReferencableDataItemList();
    private readonly _allDataItems = new DataMgr.AllDataItems();
    private readonly _activationMgrs: DataItemsActivationMgr[];
    private _nextProcessTickTime: SysTick.Time;
    private _processInterval = 5 * secsPerMin * mSecsPerSec; // 5 minutes.

    private _permanentFeedsDataItem: DataItem | undefined;
    private _permanentMarketsDataItem: DataItem | undefined;
    private _permanentBrokerageAccountsDataItem: DataItem | undefined;
    // private _permanentBrokersDataItem: DataItem | undefined;
    private _permanentDependsOnChannels: DataChannelId[];

    private _dataSubscriptionsCachingEnabled = true;

    private _publishers: Publisher[] = [];

    private _beginMultipleSubscriptionChangesCount = 0;

    private readonly _orphanedDataItemList = new DataMgr.OrphanedDataItemList();

    constructor() {
        this._processInterval =
            this._nextProcessTickTime = SysTick.now() + this._processInterval;

        this._activationMgrs = [];
        this._activationMgrs.length = DataChannel.idCount;

        for (let index = 0; index < this._activationMgrs.length; index++) {
            this._activationMgrs[index] = new DataItemsActivationMgr();
            this._activationMgrs[index].beginMultipleActivationChangesEvent = () => this.handleBeginMultipleActivationChanges();
            this._activationMgrs[index].endMultipleActivationChangesEvent = () => this.handleEndMultipleActivationChanges();
            this._activationMgrs[index].activeSubscriptionsLimit = DataChannel.idToDefaultActiveLimit(index);
            this._activationMgrs[index].deactivationDelay = DataChannel.idToDefaultDeactivationDelay(index);
            this._activationMgrs[index].cacheDataSubscriptions = this._dataSubscriptionsCachingEnabled;
        }

        this._permanentDependsOnChannels = [];
    }

    get dataItemCount(): Integer {
        return this._allDataItems.count;
    }

    get dataSubscriptionCachingEnabled() { return this._dataSubscriptionsCachingEnabled; }
    set dataSubscriptionCachingEnabled(value: boolean) {
        this._dataSubscriptionsCachingEnabled = value;
        this.setActivationMgrsCacheDataSubscriptions(this._dataSubscriptionsCachingEnabled);
    }

    isPermanentSubscription(definition: DataDefinition): boolean {
        switch (definition.channelId) {
            case DataChannelId.Feeds:
            case DataChannelId.Markets:
            case DataChannelId.BrokerageAccounts:
                return true;
            // case DataChannelId.Brokers: return true;
            default:
                return false;
        }
    }

    deactivateAvailable(dataItem: DataItem): void {
        this._activationMgrs[dataItem.channelId].deactivateAvailable(dataItem);
    }

    process(nowTickTime: SysTick.Time): void {
        this.processPublishers();

        if (nowTickTime >= this._nextProcessTickTime) {
            for (let index = 0; index < this._activationMgrs.length; index++) {
                this._activationMgrs[index].checkForDeactivations(nowTickTime);
            }
            this._nextProcessTickTime += this._processInterval;
        }
    }

    forceFind(definition: DataDefinition) {
        let dataItem = this._referencableDataItems.get(definition);

        //   if not Found then
        if (dataItem === undefined) {
            dataItem = this.createDataItem(definition);
        }

        return dataItem;
    }

    deletePublishers(): void {
        Logger.log(Logger.LevelId.Info, 'Deleting Publishers');

        if (this.dataItemCount > 0) {
            Logger.log(Logger.LevelId.Warning, 'DataItemsStore is not empty (DF).  DataItemCount = ' + this.dataItemCount.toString(10));
        }

        this._publishers.length = 0;
    }

    subscribe(dataDefinition: DataDefinition) {
        let dataItem: DataItem | undefined;

        if (dataDefinition.referencable) {
            dataItem = this.checkForPermanentSubscription(dataDefinition);
        }

        if (dataItem === undefined) {
            if (dataDefinition.referencable) {
                dataItem = this.forceFind(dataDefinition);
                this.checkMakePermanentSubscription(dataItem);
            } else {
                dataItem = this.createDataItem(dataDefinition);
            }

            dataItem.incSubscribeCount();
        }

        return dataItem;
    }

    unsubscribe(dataItem: DataItem): void {
        if (!this.isPermanentSubscription(dataItem.definition)) {
            dataItem.decSubscribeCount();
        }
    }

    beginMultipleSubscriptionChanges(): void {
        if (this._beginMultipleSubscriptionChangesCount === 0) {
            for (let index = 0; index < this._publishers.length; index++) {
                this._publishers[index].batchSubscriptionChanges = true;
            }
        }
        this._beginMultipleSubscriptionChangesCount++;
    }

    endMultipleSubscriptionChanges(): void {
        this._beginMultipleSubscriptionChangesCount--;
        if (this._beginMultipleSubscriptionChangesCount === 0) {
            for (let index = 0; index < this._publishers.length; index++) {
                this._publishers[index].batchSubscriptionChanges = false;
            }
        }
        if (this._beginMultipleSubscriptionChangesCount < 0) {
            throw new AssertInternalError('DMEMSC2399388853');
        }
    }

    private handleWantActivationEvent(dataItem: DataItem) {
        this._activationMgrs[dataItem.channelId].wantActivation(dataItem);
    }

    private handleCancelWantActivationEvent(dataItem: DataItem) {
        this._activationMgrs[dataItem.channelId].cancelWantActivation(dataItem);
    }

    private handleKeepActivationEvent(dataItem: DataItem) {
        this._activationMgrs[dataItem.channelId].keepActivation(dataItem);
    }

    private handleAvailableForDeactivationEvent(dataItem: DataItem) {
        this._activationMgrs[dataItem.channelId].availableForDeactivation(dataItem);
    }

    private handleRequirePublisherEvent(definition: DataDefinition): Publisher {
        const publisherTypeId = PublisherTypeId.Zenith; // so far we only support Zenith
        const publisher = this.getPublisherFromType(publisherTypeId);
        return publisher;
    }

    private handleRequireDestructionEvent(dataItem: DataItem) {
        if (dataItem.definition.referencable) {
            this._referencableDataItems.remove(dataItem);
        }

        this._allDataItems.remove(dataItem);
    }

    private handleDataItemRequireDataItemEvent(definition: DataDefinition): DataItem {
        return this.subscribe(definition);
    }

    private handleDataItemReleaseDataItemEvent(dataItem: DataItem) {
        this.unsubscribe(dataItem);
    }

    private handleBeginMultipleActivationChanges() {
        this.beginMultipleSubscriptionChanges();
    }

    private handleEndMultipleActivationChanges() {
        this.endMultipleSubscriptionChanges();
    }

    private createDataItem(dataDefinition: DataDefinition): DataItem {

        let dataItem: DataItem;

        switch (dataDefinition.channelId) {
            case DataChannelId.ZenithExtConnection:
                dataItem = new ZenithExtConnectionDataItem(dataDefinition);
                break;

            case DataChannelId.ZenithQueryConfigure:
                throw new AssertInternalError('DMCDI12129984534'); // move out of here when DataItems are registered

            case DataChannelId.Feeds:
                dataItem = new FeedsDataItem(dataDefinition);
                break;

            case DataChannelId.ClassFeeds:
                dataItem = new ClassFeedsDataItem(dataDefinition);
                break;

            case DataChannelId.TradingStates:
                dataItem = new TradingStatesDataItem(dataDefinition);
                break;

            case DataChannelId.Markets:
                dataItem = new MarketsDataItem(dataDefinition);
                break;

            case DataChannelId.Symbols:
                dataItem = new SymbolsDataItem(dataDefinition);
                break;

            case DataChannelId.Security:
                dataItem = new SecurityDataItem(dataDefinition);
                break;

            case DataChannelId.Trades:
                dataItem = new TradesDataItem(dataDefinition);
                break;

            case DataChannelId.LatestTradingDayTrades:
                dataItem = new LatestTradingDayTradesDataItem(dataDefinition);
                break;

            case DataChannelId.DayTrades:
                dataItem = new DayTradesDataItem(dataDefinition);
                break;

            case DataChannelId.Depth:
                dataItem = new DepthDataItem(dataDefinition);
                break;

            case DataChannelId.DepthLevels:
                dataItem = new DepthLevelsDataItem(dataDefinition);
                break;

            case DataChannelId.LowLevelTopShareholders:
                dataItem = new LowLevelTopShareholdersDataItem(dataDefinition);
                break;

            case DataChannelId.TopShareholders:
                dataItem = new TopShareholdersDataItem(dataDefinition);
                break;

            case DataChannelId.BrokerageAccounts:
                dataItem = new BrokerageAccountsDataItem(dataDefinition);
                break;

            case DataChannelId.BrokerageAccountHoldings:
                dataItem = new BrokerageAccountHoldingsDataItem(dataDefinition);
                break;

            case DataChannelId.AllHoldings:
                dataItem = new AllHoldingsDataItem(dataDefinition);
                break;

            case DataChannelId.BrokerageAccountBalances:
                dataItem = new BrokerageAccountBalancesDataItem(dataDefinition);
                break;

            case DataChannelId.AllBalances:
                dataItem = new AllBalancesDataItem(dataDefinition);
                break;

            case DataChannelId.BrokerageAccountOrders:
                dataItem = new BrokerageAccountOrdersDataItem(dataDefinition);
                break;

            case DataChannelId.AllOrders:
                dataItem = new AllOrdersDataItem(dataDefinition);
                break;

            case DataChannelId.BrokerageAccountTransactions:
                dataItem = new TransactionsDataItem(dataDefinition);
                break;

            case DataChannelId.AllTransactions:
                throw new NotImplementedError('DMCDIAT3111043842');

            case DataChannelId.OrderRequests:
                throw new NotImplementedError('DMCDIOR2111043842');

            case DataChannelId.OrderAudit:
                throw new NotImplementedError('DMCDIOA393837522');

            case DataChannelId.PlaceOrderRequest:
                dataItem = new PlaceOrderDataItem(dataDefinition);
                break;

            case DataChannelId.AmendOrderRequest:
                dataItem = new AmendOrderDataItem(dataDefinition);
                break;

            case DataChannelId.CancelOrderRequest:
                dataItem = new CancelOrderDataItem(dataDefinition);
                break;

            case DataChannelId.MoveOrderRequest:
                dataItem = new MoveOrderDataItem(dataDefinition);
                break;

            case DataChannelId.OrderStatuses:
                dataItem = new OrderStatusesDataItem(dataDefinition);
                break;

            case DataChannelId.ZenithServerInfo:
                dataItem = new ZenithServerInfoDataItem(dataDefinition);
                break;

            case DataChannelId.ChartHistory:
                dataItem = new ChartHistoryDataItem(dataDefinition);
                break;

            case DataChannelId.Trades:
                dataItem = new TradesDataItem(dataDefinition);
                break;

            default:
                throw new UnreachableCaseError('DMCDI659933281', dataDefinition.channelId);
        }

        dataItem.onWantActivation = (aDataItem) => this.handleWantActivationEvent(aDataItem);
        dataItem.onCancelWantActivation = (aDataItem) => this.handleCancelWantActivationEvent(aDataItem);
        dataItem.onKeepActivation = (aDataItem) => this.handleKeepActivationEvent(aDataItem);
        dataItem.onAvailableForDeactivation = (aDataItem) => this.handleAvailableForDeactivationEvent(aDataItem);
        dataItem.onRequirePublisher = (definition) => this.handleRequirePublisherEvent(definition);
        dataItem.onRequireDestruction = (aDataItem) => this.handleRequireDestructionEvent(aDataItem);
        dataItem.onRequireDataItem = (Definition) => this.handleDataItemRequireDataItemEvent(Definition);
        dataItem.onReleaseDataItem = (aDataItem) => this.handleDataItemReleaseDataItemEvent(aDataItem);

        if (dataDefinition.referencable) {
            this._referencableDataItems.add(dataItem);
        }

        this._allDataItems.add(dataItem);

        return dataItem;
    }

    private checkForPermanentSubscription(definition: DataDefinition): DataItem | undefined {
        if (!this.isPermanentSubscription(definition)) {
            return undefined;
        } else {
            switch (definition.channelId) {
                case DataChannelId.Feeds:
                    return this._permanentFeedsDataItem;

                case DataChannelId.Markets:
                    return this._permanentMarketsDataItem;

                case DataChannelId.BrokerageAccounts:
                    return this._permanentBrokerageAccountsDataItem;

                // case DataChannelId.Brokers:
                //     return this._permanentBrokersDataItem;

                // dcOrderExecReportSubbedObagas:
                // begin
                //     Assert(Definition is TDataDefinition_OrderExecReportSubbedObagas);
                //     Assert((Definition as TDataDefinition_OrderExecReportSubbedObagas).AggregationType = baatAll);
                //     Result := FPermanentAllOrderExecReportDataItem
                // end;

                default:
                    throw new AssertInternalError('DMCFPS55555993', definition.description);
            }
        }
    }

    private checkMakePermanentSubscription(dataItem: DataItem) {
        const definition = dataItem.definition;

        if (this.isPermanentSubscription(definition)) {
            const channelId = definition.channelId;

            switch (channelId) {
                case DataChannelId.Feeds:
                    this._permanentFeedsDataItem = dataItem;
                    break;

                case DataChannelId.Markets:
                    this._permanentMarketsDataItem = dataItem;
                    break;

                case DataChannelId.BrokerageAccounts:
                    this._permanentBrokerageAccountsDataItem = dataItem;
                    break;

                // case DataChannelId.Brokers:
                //     this._permanentBrokersDataItem = dataItem;
                //     break;


                default:
                    throw new AssertInternalError('DMCMPS56834343', definition.description);
            }

            this._permanentDependsOnChannels = concatenateArrayUniquely(this._permanentDependsOnChannels,
                DataChannel.idToFullDependsOnSet(channelId));
        }
    }

    private unsubscribePermanentSubscriptions() {
        // if (this._permanentBrokersDataItem) {
        //     this._permanentBrokersDataItem.decSubscribeCount();
        //     this._permanentBrokersDataItem = undefined;
        // }

        if (this._permanentFeedsDataItem !== undefined) {
            this._permanentFeedsDataItem.decSubscribeCount();
            this._permanentFeedsDataItem = undefined;
        }

        if (this._permanentMarketsDataItem !== undefined) {
            this._permanentMarketsDataItem.decSubscribeCount();
            this._permanentMarketsDataItem = undefined;
        }

        if (this._permanentBrokerageAccountsDataItem !== undefined) {
            this._permanentBrokerageAccountsDataItem.decSubscribeCount();
            this._permanentBrokerageAccountsDataItem = undefined;
        }

    }

    private removeOrphanedDataItems() {
        const remainingDataItemCount = this.dataItemCount;
        let orphanCount = 0;

        if (remainingDataItemCount > 0) {
            orphanCount = 0;
            this._orphanedDataItemList.capacity = remainingDataItemCount;
            const iterator = this._allDataItems.values();
            let iteratorResult = iterator.next();
            while (!iteratorResult.done) {
                const dataItem = iteratorResult.value;

                const cond1 = !(dataItem instanceof ExtConnectionDataItem);
                const cond2 = !this.isPermanentSubscription(dataItem.definition);
                const cond3 = !this._permanentDependsOnChannels.includes(dataItem.channelId);

                if (cond1 && cond2 && cond3) {
                    Logger.log(Logger.LevelId.Warning, 'Orphaned DataItem: ' + dataItem.definition.description);
                    this._orphanedDataItemList.add(dataItem);
                    orphanCount++;
                }
                iteratorResult = iterator.next();
            }
        }
        this._orphanedDataItemList.deactivateDataItems();

        if (orphanCount > 0) {
            Logger.log(Logger.LevelId.Warning, 'Number of Orphaned DataItems: ' + orphanCount.toString(10));
        }
    }

    private setActivationMgrsCacheDataSubscriptions(value: boolean) {
        for (let index = 0; index < this._activationMgrs.length; index++) {
            this._activationMgrs[index].cacheDataSubscriptions = value;
        }
    }

    private createPublisher(typeId: PublisherTypeId): Publisher {
        switch (typeId) {
            case PublisherTypeId.Zenith:
                return new ZenithPublisher();

            default:
                throw new UnreachableCaseError('DMCFS299987', typeId);
        }
    }

    private getPublisherFromType(typeId: PublisherTypeId) {

        for (let index = 0; index < this._publishers.length; index++) {
            if (this._publishers[index].publisherTypeId === typeId) {
                return this._publishers[index];
            }
        }

        const publisher = this.createPublisher(typeId);
        this._publishers.push(publisher);
        if (this._beginMultipleSubscriptionChangesCount > 0) {
            publisher.batchSubscriptionChanges = true;
        }
        return publisher;
    }

    private processPublishers() {
        const processMessages = (Msgs: DataMessages): void => {
            if (Msgs) {
                for (let index = 0; index < Msgs.count; index++) {
                    const msg = Msgs.getItem(index);
                    this.processMessage(msg);
                }
            }
        };

        for (let index = 0; index < this._publishers.length; index++) {
            const Msgs = this._publishers[index].getMessages(SysTick.now());
            processMessages(Msgs);
        }
    }

    private processMessage(msg: DataMessage) {
        assert(assigned(msg.dataItemId), 'DataItemId must be assigned.');

        const dataItem = this._allDataItems.get(msg.dataItemId);
        if (dataItem !== undefined) {
            const dataItemRequestNr = msg.dataItemRequestNr;
            if (dataItemRequestNr === dataItem.activeRequestNr || dataItemRequestNr === broadcastDataItemRequestNr) {
                dataItem.processMessage(msg);
            }

            if (dataItem.deactivationDelayed && !dataItem.online) {
                this.deactivateAvailable(dataItem);
            }
        }
    }
}

export namespace DataMgr {
    export type DelayDeactivationEvent = (this: void, dataItem: DataItem, delay: number) => number; // Return "delay".

    export class ReferencableDataItemList {
        private _map = new Map<MapKey, DataItem>();

        get(definition: DataDefinition) {
            return this._map.get(definition.referencableKey);
        }

        remove(dataItem: DataItem) {
            const definition = dataItem.definition;
            if (!(definition instanceof DataDefinition)) {
                throw new AssertInternalError('DMRDILR6993966');
            } else {
                this._map.delete(definition.referencableKey);
            }
        }

        add(dataItem: DataItem) {
            const definition = dataItem.definition;
            const mapKey = definition.referencableKey;
            if (this._map.has(mapKey)) {
                throw new AssertInternalError('DMRDILADI699453322', definition.description);
            } else {
                this._map.set(mapKey, dataItem);
            }
        }
    }

    export class AllDataItems {
        private _map = new Map<DataItemId, DataItem>();

        get count() {
            return this._map.size;
        }

        get(id: DataItemId) {
            return this._map.get(id);
        }

        remove(dataItem: DataItem) {
            return this._map.delete(dataItem.id);
        }

        add(dataItem: DataItem) {
            if (this._map.has(dataItem.id)) {
                throw new AssertInternalError('DMADILADI40028669', dataItem.definition.description);
            } else {
                this._map.set(dataItem.id, dataItem);
            }
        }

        values() {
            return this._map.values();
        }
    }

    export class OrphanedDataItemList extends ComparableList<DataItem | undefined> {
        deactivateDataItems() {
            this.sort(OrphanedDataItemList.compareItems);

            for (let index = this.count - 1; index >= 0; index--) {
                const dataItem = this.getItem(index);
                if (dataItem !== undefined && dataItem.active) {
                    dataItem.deactivate();
                    this.setItem(index, undefined);
                }
            }

            this.clear();
        }
    }

    export namespace OrphanedDataItemList {
        export function compareItems(left: DataItem | undefined, right: DataItem | undefined) {
            if (left === undefined) {
                if (right === undefined) {
                    return ComparisonResult.LeftEqualsRight;
                } else {
                    return ComparisonResult.LeftGreaterThanRight;
                }
            } else {
                if (right === undefined) {
                    return ComparisonResult.LeftLessThanRight;
                } else {
                    return DataChannel.compareDependencyIndex(left.channelId, right.channelId);
                }
            }
        }
    }
}
