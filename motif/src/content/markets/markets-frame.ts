/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AssertInternalError,
    Badness,
    CoreSettings,
    Correctness,
    FeedStatus,
    Integer,
    Market,
    MarketBoard,
    MarketInfo,
    MarketsDataDefinition,
    MarketsDataItem,
    MultiEvent,
    SourceTzOffsetDate,
    SourceTzOffsetDateTime,
    TextFormatterService,
    TradingMarketBoard,
    TradingState,
    UnreachableCaseError,
    UsableListChangeTypeId
} from '@motifmarkets/motif-core';
import { ContentFrame } from '../content-frame';

export class MarketsFrame extends ContentFrame {
    marketCountChangedEvent: MarketsFrame.MarketsCountChangedEventHandler;
    tradingMarketBoardCountChangedEvent: MarketsFrame.TradingMarketBoardCountChangedEventHandler;

    private _marketsDataItem: MarketsDataItem;
    private _marketsListChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _marketsBadnessChangeSubscriptionId: MultiEvent.SubscriptionId;

    private _marketWrappers: MarketsFrame.MarketWrapper[] = [];
    private _displayRecords: MarketsFrame.DisplayRecord[] = [];

    private _marketCount = 0;
    private _offlineMarketCount = 0;
    private _tradingMarketBoardCount = 0;

    constructor(
        private readonly _componentAccess: MarketsFrame.ComponentAccess,
        private readonly _coreSettings: CoreSettings,
        private readonly _adi: AdiService,
        private readonly _textFormatterService: TextFormatterService,
    ) {
        super();
    }

    get displayRecords() { return this._displayRecords; }
    get marketCount() { return this._marketCount; }
    get offlineMarketCount() { return this._offlineMarketCount; }
    get tradingMarketCount() { return this._tradingMarketBoardCount; }

    initialise() {
        const dataDefinition = new MarketsDataDefinition();
        this._marketsDataItem = this._adi.subscribe(dataDefinition) as MarketsDataItem;
        this._marketsListChangeSubscriptionId = this._marketsDataItem.subscribeListChangeEvent(
            (listChangeTypeId, index, count) => this.handleMarketsListChangeEvent(listChangeTypeId, index, count)
        );
        this._marketsBadnessChangeSubscriptionId = this._marketsDataItem.subscribeBadnessChangeEvent(
            () => this.handleMarketsBadnessChangeEvent()
        );

        if (this._marketsDataItem.usable) {
            const count = this._marketsDataItem.count;
            if (count > 0) {
                this.processMarketsListChange(UsableListChangeTypeId.PreUsableAdd, 0, count);
            }
            this.processMarketsListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.processMarketsListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }

        const badness = this.calculateBadness();
        this._componentAccess.hideBadnessWithVisibleDelay(badness);

        this.updateDisplayRecordsAndCounts();
    }

    override finalise() {
        if (this._marketsDataItem !== undefined) {
            this._marketsDataItem.unsubscribeListChangeEvent(this._marketsListChangeSubscriptionId);
            this._marketsListChangeSubscriptionId = undefined;
            this._marketsDataItem.unsubscribeBadnessChangeEvent(this._marketsBadnessChangeSubscriptionId);
            this._marketsBadnessChangeSubscriptionId = undefined;
            this._adi.unsubscribe(this._marketsDataItem);
        }

        super.finalise();
    }

    private handleMarketsListChangeEvent(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        const marketsChanged = this.processMarketsListChange(listChangeTypeId, index, count);
        if (marketsChanged) {
            this.updateDisplayRecordsAndCounts();
        }
    }

    private handleMarketsBadnessChangeEvent() {
        const badness = this.calculateBadness();
        this._componentAccess.setBadness(badness);
        this.updateDisplayRecordsAndCounts();
    }

    private handleMarketChangeEvent() {
        this.updateDisplayRecordsAndCounts();
    }

    private notifyMarketCountChanged() {
        if (this.marketCountChangedEvent !== undefined) {
            this.marketCountChangedEvent();
        }
    }

    private notifyTradingMarketBoardCountChanged() {
        if (this.tradingMarketBoardCountChangedEvent !== undefined) {
            this.tradingMarketBoardCountChangedEvent();
        }
    }

    private calculateBadness() {
        return this._marketsDataItem.badness;
    }

    private processMarketsListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable: {
                const UnusableBadness = this.calculateBadness();
                this._componentAccess.setBadness(UnusableBadness);
                return true;
            }
            case UsableListChangeTypeId.PreUsableClear: {
                return this.clearMarkets();
            }
            case UsableListChangeTypeId.PreUsableAdd: {
                return this.insertMarkets(index, count);
            }
            case UsableListChangeTypeId.Usable: {
                const Usablebadness = this.calculateBadness();
                this._componentAccess.setBadness(Usablebadness);
                return true;
            }
            case UsableListChangeTypeId.Insert: {
                return this.insertMarkets(index, count);
            }
            case UsableListChangeTypeId.Replace: {
                throw new AssertInternalError('CIDFPMLCRP09134');
            }
            case UsableListChangeTypeId.Remove: {
                return this.removeMarkets(index, count);
            }
            case UsableListChangeTypeId.Clear: {
                return this.clearMarkets();
            }
            default:
                throw new UnreachableCaseError('CIDFPMLCU09134', listChangeTypeId);
        }
    }

    private clearMarkets() {
        if (this._marketWrappers.length === 0) {
            return false;
        } else {
            for (const wrapper of this._marketWrappers) {
                wrapper.finalise();
            }

            this._marketWrappers.length = 0;
            return true;
        }
    }

    private insertMarkets(index: Integer, count: Integer) {
        if (count === 0) {
            return false;
        } else {
            const newMarketWrappers = new Array<MarketsFrame.MarketWrapper>(count);
            let recordIdx = index;
            for (let i = 0; i < count; i++) {
                const market = this._marketsDataItem.records[recordIdx++];
                const wrapper = new MarketsFrame.MarketWrapper(market);
                wrapper.changeEvent = () => this.handleMarketChangeEvent();
                newMarketWrappers[i] = wrapper;
            }

            this._marketWrappers.splice(index, 0, ...newMarketWrappers);

            return true;
        }
    }

    private removeMarkets(index: Integer, count: Integer) {
        if (count === 0) {
            return false;
        } else {
            for (let i = index; i < index + count; i++) {
                const wrapper = this._marketWrappers[i];
                wrapper.finalise();
            }

            this._marketWrappers.splice(index, count);

            return true;
        }
    }

    private updateDisplayRecordsAndCounts() {
        const markets = this._marketsDataItem.records;

        const marketCount = markets.length;
        let offlineMarketCount = 0;
        let tradingMarketBoardCount = 0;

        for (const market of markets) {
            const tradingMarketBoards = market.tradingMarketBoards;
            if (tradingMarketBoards !== undefined) {
                tradingMarketBoardCount += tradingMarketBoards.length;
            }
        }
        const displayRecords = new Array<MarketsFrame.DisplayRecord>(marketCount + tradingMarketBoardCount);

        let idx = 0;
        for (const market of markets) {
            displayRecords[idx++] = this.createMarketDisplayRecord(market);
            const feedStatusId = market.feedStatusId;
            if (feedStatusId === undefined) {
                offlineMarketCount++;
            } else {
                const correctnessId = FeedStatus.idToCorrectnessId(feedStatusId);
                if (Correctness.idIsUnusable(correctnessId)) {
                    offlineMarketCount++;
                }
            }

            const tradingMarketBoards = market.tradingMarketBoards;
            if (tradingMarketBoards !== undefined) {
                for (const board of tradingMarketBoards) {
                    displayRecords[idx++] = this.createMarketBoardDisplayRecord(board);
                }
            }
        }

        this._displayRecords = displayRecords;
        this._componentAccess.notifyDisplayRecordsChanged();

        if (this._marketCount !== marketCount || this._offlineMarketCount !== offlineMarketCount) {
            this._marketCount = marketCount;
            this._offlineMarketCount = offlineMarketCount;
            this.notifyMarketCountChanged();
        }

        if (this._tradingMarketBoardCount !== tradingMarketBoardCount) {
            this._tradingMarketBoardCount = tradingMarketBoardCount;
            this.notifyTradingMarketBoardCountChanged();
        }
    }

    private createMarketDisplayRecord(market: Market) {
        let tradingDateStr: string;
        const tradingDate = market.tradingDate;
        if (tradingDate === undefined) {
            tradingDateStr = '';
        } else {
            const utcTimezonedTradingDate = SourceTzOffsetDate.getUtcTimezonedDate(tradingDate);
            tradingDateStr = this._textFormatterService.formatDate(utcTimezonedTradingDate); // utcTimezonedTradingDate.toLocaleString();
        }

        let marketTimeStr: string;
        const marketTime = market.marketTime;
        if (marketTime === undefined) {
            marketTimeStr = '';
        } else {
            const utcTimezonedMarketTime =
                SourceTzOffsetDateTime.getTimezonedDate(marketTime, this._coreSettings.format_DateTimeTimezoneModeId);
            marketTimeStr = this._textFormatterService.formatDateTime(utcTimezonedMarketTime); // utcTimezonedMarketTime.toLocaleString();
        }

        const record: MarketsFrame.DisplayRecord = {
            name: MarketInfo.idToDisplay(market.marketId),
            board: false,
            status: market.status ?? '',
            reason: this.reasonIdToDisplay(market.reasonId),
            allows: this.allowIdsToDisplay(market.allowIds),
            feedStatus: market.feedStatusId === undefined ? '' : FeedStatus.idToDisplay(market.feedStatusId),
            tradingDate: tradingDateStr,
            marketTime: marketTimeStr,
        };
        return record;
    }

    private createMarketBoardDisplayRecord(board: TradingMarketBoard) {
        const record: MarketsFrame.DisplayRecord = {
            name: MarketBoard.idToDisplay(board.id),
            board: true,
            status: board.status,
            reason: this.reasonIdToDisplay(board.reasonId),
            allows: this.allowIdsToDisplay(board.allowIds),
            feedStatus: '',
            tradingDate: '',
            marketTime: '',
        };
        return record;
    }

    private allowIdsToDisplay(allowIds: TradingState.AllowIds | undefined) {
        let display: string;
        if (allowIds === undefined) {
            display = '';
        } else {
            const allowCount = allowIds.length;
            const allowDisplays = new Array<string>(allowCount);
            for (let i = 0; i < allowCount; i++) {
                allowDisplays[i] = TradingState.Allow.idToDisplay(allowIds[i]);
            }
            display = allowDisplays.join(',');
        }
        return display;
    }

    private reasonIdToDisplay(reasonId: TradingState.ReasonId | undefined) {
        return reasonId === undefined ? '' : TradingState.Reason.idToDisplay(reasonId);
    }
}

export namespace MarketsFrame {
    export type MarketsCountChangedEventHandler = (this: void) => void;
    export type TradingMarketBoardCountChangedEventHandler = (this: void) => void;

    export interface DisplayRecord {
        name: string;
        board: boolean;
        status: string;
        reason: string;
        allows: string;
        feedStatus: string;
        tradingDate: string;
        marketTime: string;
    }

    export class MarketWrapper {
        changeEvent: MarketWrapper.ChangeEventHandler;

        private _changeSubscriptionId: MultiEvent.SubscriptionId;

        constructor(private _market: Market) {
            this._changeSubscriptionId = this._market.subscribeChangeEvent(
                (changedFieldIds) => this.handleChangeEvent(changedFieldIds)
            );
        }

        finalise() {
            this._market.unsubscribeChangeEvent(this._changeSubscriptionId);
        }

        private handleChangeEvent(changedFieldIds: Market.FieldId[]) {
            this.changeEvent(changedFieldIds);
        }
    }

    export namespace MarketWrapper {
        export type ChangeEventHandler = (this: void, changedFieldIds: Market.FieldId[]) => void;
    }

    export interface ComponentAccess {
        notifyDisplayRecordsChanged(): void;

        setBadness(value: Badness): void;
        hideBadnessWithVisibleDelay(badness: Badness): void;
    }
}
