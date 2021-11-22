/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from 'src/res/internal-api';
import {
    AssertInternalError,
    Correctness,
    CorrectnessId,
    EnumInfoOutOfOrderError, Integer, isUndefinableArrayEqualUniquely,
    JsonElement, MapKey, MultiEvent,
    SourceTzOffsetDate,
    SourceTzOffsetDateTime
} from 'src/sys/internal-api';
import {
    FeedStatusId,
    FieldDataTypeId,
    MarketId,
    MarketInfo,
    MarketsDataMessage,
    TradingState,
    TradingStates
} from './common/internal-api';
import { DataItem } from './data-item';
import { DataRecord } from './data-record';
import { TradingMarketBoard, TradingMarketBoards } from './trading-market-board';
import { TradingStatesFetcher } from './trading-states-fetcher';

export class Market implements DataRecord {
    readonly marketId;
    readonly environmentId;
    readonly name;
    code;
    feedStatusId: FeedStatusId | undefined;
    tradingDate;
    marketTime;

    status: string | undefined;
    allowIds: TradingState.AllowIds | undefined;
    reasonId: TradingState.ReasonId | undefined;

    // Correctness is not fully implemented - might be now
    private _usable = false;
    private _correctnessId: CorrectnessId;

    private _mapKey: MapKey;

    private _changeEvent = new MultiEvent<Market.ChangeEvent>();
    private _feedStatusChangeEvent = new MultiEvent<Market.FeedStatusChangeEvent>();
    private _correctnessChangedEvent = new MultiEvent<Market.CorrectnessChangedEventHandler>();

    private _tradingStatesFetcher: TradingStatesFetcher | undefined;
    private _tradingMarketBoards: TradingMarketBoards | undefined;
    private _tradingStates: TradingStates = [];

    constructor(msgMarket: MarketsDataMessage.Market,
        private _listCorrectnessId: CorrectnessId,
    ) {
        this.marketId = msgMarket.marketId;
        this.environmentId = msgMarket.environmentId;
        this.code = msgMarket.code;
        this.feedStatusId = msgMarket.feedStatusId;
        this.tradingDate = msgMarket.tradingDate;
        this.marketTime = msgMarket.marketTime;
        this.setStatus(msgMarket.status);

        this.name = MarketInfo.idToName(this.marketId);

        this.updateTradingMarketBoards(msgMarket.tradingMarketBoards);

        this.updateCorrectness();
    }

    get usable() { return this._usable; }
    get correctnessId() { return this._correctnessId; }
    get tradingStates() { return this._tradingStates; }
    get tradingMarketBoards() { return this._tradingMarketBoards; }

    get mapKey() {
        if (this._mapKey === undefined) {
            this._mapKey = Market.Key.generateMapKey(this.marketId);
        }
        return this._mapKey;
    }

    initialise(subscribeDateItemFtn: DataItem.SubscribeDataItemFtn,
        unsubscribeDateItemFtn: DataItem.UnsubscribeDataItemFtn
    ) {
        this._tradingStatesFetcher = new TradingStatesFetcher(this.marketId, subscribeDateItemFtn, unsubscribeDateItemFtn);
        if (this._tradingStatesFetcher.completed) {
            // Query so this should never occur
            this.processTradingStatesFetchingCompleted();
        } else {
            this._tradingStatesFetcher.correctnessChangedEvent = () => this.handleTradingStatesFetcherCorrectnessChangedEvent();
            this.updateCorrectness();
        }
    }

    dispose() {
        this.checkDisposeTradingStatesFetcher();
    }

    setListCorrectness(value: CorrectnessId) {
        this._listCorrectnessId = value;
        this.updateCorrectness();
    }

    createKey(): Market.Key {
        return new Market.Key(this.marketId);
    }

    matchesKey(key: Market.Key): boolean {
        return key.marketId === this.marketId;
    }

    generateMapKey(): MapKey {
        return Market.Key.generateMapKey(this.marketId);
    }

    change(msgMarket: MarketsDataMessage.Market) {
        // eslint-disable-next-line max-len
        const changedFieldIds = new Array<Market.FieldId>(Market.Field.count - Market.Key.fieldCount); // won't include fields in key
        let changedCount = 0;
        const feedStatusChanged = msgMarket.feedStatusId !== this.feedStatusId;
        if (feedStatusChanged) {
            this.feedStatusId = msgMarket.feedStatusId;
            changedFieldIds[changedCount++] = Market.FieldId.FeedStatusId;
        }
        if (!SourceTzOffsetDate.isUndefinableEqual(msgMarket.tradingDate, this.tradingDate)) {
            this.tradingDate = msgMarket.tradingDate;
            changedFieldIds[changedCount++] = Market.FieldId.TradingDate;
        }
        if (!SourceTzOffsetDateTime.isUndefinableEqual(msgMarket.marketTime, this.marketTime)) {
            this.marketTime = msgMarket.marketTime;
            changedFieldIds[changedCount++] = Market.FieldId.MarketTime;
        }

        if (msgMarket.status !== this.status) {
            const setStatusChangedFieldIds = this.setStatus(msgMarket.status);
            changedFieldIds[changedCount++] = Market.FieldId.Status;
            for (let i = 0; i < setStatusChangedFieldIds.length; i++) {
                changedFieldIds[changedCount++] = setStatusChangedFieldIds[i];
            }
        }

        if (!this.isUndefinableTradingMarketBoardsEqual(msgMarket.tradingMarketBoards, this._tradingMarketBoards)) {
            this.updateTradingMarketBoards(msgMarket.tradingMarketBoards);
            changedFieldIds[changedCount++] = Market.FieldId.TradingMarkets;
        }

        if (changedCount >= 0) {
            if (feedStatusChanged) {
                this.notifyFeedStatusChange();
            }

            changedFieldIds.length = changedCount;
            this.notifyChange(changedFieldIds);
        }
    }

    setUnknown() {
        // eslint-disable-next-line max-len
        const changedFieldIds = new Array<Market.FieldId>(Market.Field.count - Market.Key.fieldCount); // won't include fields in key
        let changedCount = 0;
        const feedStatusChanged = this.feedStatusId !== undefined;
        if (feedStatusChanged) {
            this.feedStatusId = undefined;
            changedFieldIds[changedCount++] = Market.FieldId.FeedStatusId;
        }
        if (this.tradingDate !== undefined) {
            this.tradingDate = undefined;
            changedFieldIds[changedCount++] = Market.FieldId.TradingDate;
        }
        if (this.marketTime !== undefined) {
            this.marketTime = undefined;
            changedFieldIds[changedCount++] = Market.FieldId.MarketTime;
        }
        if (this.status !== undefined) {
            const setStatusChangedFieldIds = this.setStatus(undefined);
            changedFieldIds[changedCount++] = Market.FieldId.Status;
            for (let i = 0; i < setStatusChangedFieldIds.length; i++) {
                changedFieldIds[changedCount++] = setStatusChangedFieldIds[i];
            }
        }
        if (this._tradingMarketBoards !== undefined) {
            this._tradingMarketBoards = undefined;
            changedFieldIds[changedCount++] = Market.FieldId.TradingMarkets;
        }

        if (changedCount >= 0) {
            if (feedStatusChanged) {
                this.notifyFeedStatusChange();
            }

            changedFieldIds.length = changedCount;
            this.notifyChange(changedFieldIds);
        }
    }

    subscribeChangeEvent(handler: Market.ChangeEvent) {
        return this._changeEvent.subscribe(handler);
    }

    unsubscribeChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
         this._changeEvent.unsubscribe(subscriptionId);
    }

    subscribeFeedStatusChangeEvent(handler: Market.FeedStatusChangeEvent) {
        return this._feedStatusChangeEvent.subscribe(handler);
    }

    unsubscribeFeedStatusChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
         this._feedStatusChangeEvent.unsubscribe(subscriptionId);
    }

    subscribeCorrectnessChangedEvent(handler: Market.CorrectnessChangedEventHandler) {
        return this._correctnessChangedEvent.subscribe(handler);
    }

    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessChangedEvent.unsubscribe(subscriptionId);
    }

    private handleTradingStatesFetcherCorrectnessChangedEvent() {
        const fetcher = this._tradingStatesFetcher;
        if (fetcher === undefined) {
            throw new AssertInternalError('MHTSFCCE1923688399993');
        } else {
            if (fetcher.completed) {
                this.processTradingStatesFetchingCompleted();
            } else {
                this.updateCorrectness();
            }
        }
    }

    private notifyChange(changedFieldIds: Market.FieldId[]) {
        const handlers = this._changeEvent.copyHandlers();
        for (const handler of handlers) {
            handler(changedFieldIds);
        }
    }

    private notifyFeedStatusChange() {
        const handlers = this._feedStatusChangeEvent.copyHandlers();
        for (const handler of handlers) {
            handler();
        }
    }

    private notifyCorrectnessChanged() {
        const handlers = this._correctnessChangedEvent.copyHandlers();
        for (const handler of handlers) {
            handler();
        }
    }

    private setStatus(status: string | undefined) {
        this.status = status;
        return this.checkUpdateAllowIdsReasonId();
    }

    private checkUpdateAllowIdsReasonId() {
        const { allowIds, reasonId } = this.calculateAllowIdsReasonId(this.status);
        const changedFieldIds: Market.FieldId[] = [];
        if (!isUndefinableArrayEqualUniquely(allowIds, this.allowIds)) {
            this.allowIds = allowIds;
            changedFieldIds.push(Market.FieldId.AllowIds);
        }
        if (reasonId !== this.reasonId) {
            this.reasonId = reasonId;
            changedFieldIds.push(Market.FieldId.ReasonId);
        }
        return changedFieldIds;
    }

    private updateTradingMarketBoards(msgBoards: MarketsDataMessage.TradingMarketBoards | undefined) {
        if (msgBoards === undefined) {
            this._tradingMarketBoards = undefined;
        } else {
            const count = msgBoards.length;
            const tradingMarketBoards = new Array<TradingMarketBoard>(count);

            for (let i = 0; i < count; i++) {
                const msgState = msgBoards[i];
                const { allowIds, reasonId } = this.calculateAllowIdsReasonId(msgState.status);

                const tradingMarketBoard: TradingMarketBoard = {
                    id: msgState.id,
                    environmentId: msgState.environmentId,
                    status: msgState.status,
                    allowIds,
                    reasonId,
                };

                tradingMarketBoards[i] = tradingMarketBoard;
            }

            this._tradingMarketBoards = tradingMarketBoards;
        }
    }

    private isTradingMarketBoardsEqual(left: MarketsDataMessage.TradingMarketBoards, right: TradingMarketBoards) {
        if (left.length !== right.length) {
            return false;
        } else {
            // assume no duplicates
            for (const leftBoard of left) {
                const rightBoard = TradingMarketBoard.getMarketBoard(right, leftBoard.id, leftBoard.environmentId);
                if (rightBoard === undefined) {
                    return false;
                } else {
                    if (leftBoard.status !== rightBoard.status) {
                        return false;
                    }
                }
            }

            return true;
        }
    }

    private isUndefinableTradingMarketBoardsEqual(left: MarketsDataMessage.TradingMarketBoards | undefined,
        right: TradingMarketBoards | undefined) {
        if (left === undefined) {
            return right === undefined;
        } else {
            if (right === undefined) {
                return false;
            } else {
                return this.isTradingMarketBoardsEqual(left, right);
            }
        }
    }

    private updateCorrectness() {
        let correctnessId: CorrectnessId;
        if (this._tradingStatesFetcher === undefined) {
            correctnessId = this._listCorrectnessId;
        } else {
            correctnessId = Correctness.merge2Ids(this._listCorrectnessId, this._tradingStatesFetcher.correctnessId);
        }

        if (correctnessId !== this._correctnessId) {
            this._correctnessId = correctnessId;
            this._usable = Correctness.idIsUsable(correctnessId);
            // if (!this.usable) {
            //     this.setUnknown();
            // }
            this.notifyCorrectnessChanged();
        }
    }

    private checkDisposeTradingStatesFetcher() {
        if (this._tradingStatesFetcher !== undefined) {
            this._tradingStatesFetcher.finalise();
            this._tradingStatesFetcher = undefined;
        }
    }

    private processTradingStatesFetchingCompleted() {
        const fetcher = this._tradingStatesFetcher;
        if (fetcher === undefined) {
            throw new AssertInternalError('MPTSFC236828399993');
        } else {
            if (Correctness.idIsUsable(fetcher.correctnessId)) {
                this._tradingStates = fetcher.states;
                const changedFieldIds = this.checkUpdateAllowIdsReasonId();
                 // TradingMarketBoards has all fields of MarketsDataMessage.TradingMarketBoards
                this.updateTradingMarketBoards(this._tradingMarketBoards);
                changedFieldIds.push(Market.FieldId.TradingMarkets);
                this.notifyChange(changedFieldIds);
                this.checkDisposeTradingStatesFetcher();
            }
            this.updateCorrectness();
        }
    }

    private calculateAllowIdsReasonId(status: string | undefined) {
        let reasonId: TradingState.ReasonId | undefined;
        let allowIds: TradingState.AllowIds | undefined;
        if (status === undefined || this._tradingStates === undefined) {
            reasonId = undefined;
            allowIds = undefined;
        } else {
            const state = TradingStates.find(this._tradingStates, status);
            if (state === undefined) {
                reasonId = undefined;
                allowIds = undefined;
            } else {
                reasonId = state.reasonId;
                allowIds = state.allowIds;
            }
        }
        return { allowIds, reasonId };
    }
}

export namespace Market {

    export const enum FieldId {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        MarketId,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        FeedStatusId,
        TradingDate,
        MarketTime,
        Status,
        AllowIds,
        ReasonId,
        TradingMarkets,
    }

    export type incubatedEvent = (this: void, self: Market) => void;
    export type ChangeEvent = (this: void, changedFieldIds: Market.FieldId[]) => void;
    export type FeedStatusChangeEvent = (this: void) => void;
    export type CorrectnessChangedEventHandler = (this: void) => void;

    export namespace Field {
        interface Info {
            readonly id: FieldId;
            readonly name: string;
            readonly dataTypeId: FieldDataTypeId;
            readonly displayId: StringId;
            readonly headingId: StringId;
        }

        type InfosObject = { [id in keyof typeof FieldId]: Info };

        const infosObject: InfosObject = {
            MarketId: {
                id: FieldId.MarketId,
                name: 'MarketId',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.MarketFieldDisplay_MarketId,
                headingId: StringId.MarketFieldHeading_MarketId,
            },
            FeedStatusId: {
                id: FieldId.FeedStatusId,
                name: 'FeedStatusId',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.MarketFieldDisplay_FeedStatusId,
                headingId: StringId.MarketFieldHeading_FeedStatusId,
            },
            TradingDate: {
                id: FieldId.TradingDate,
                name: 'TradingDate',
                dataTypeId: FieldDataTypeId.Date,
                displayId: StringId.MarketFieldDisplay_TradingDate,
                headingId: StringId.MarketFieldHeading_TradingDate,
            },
            MarketTime: {
                id: FieldId.MarketTime,
                name: 'MarketTime',
                dataTypeId: FieldDataTypeId.DateTime,
                displayId: StringId.MarketFieldDisplay_MarketTime,
                headingId: StringId.MarketFieldHeading_MarketTime,
            },
            Status: {
                id: FieldId.Status,
                name: 'Status',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.MarketFieldDisplay_Status,
                headingId: StringId.MarketFieldHeading_Status,
            },
            AllowIds: {
                id: FieldId.AllowIds,
                name: 'Status',
                dataTypeId: FieldDataTypeId.EnumerationArray,
                displayId: StringId.MarketFieldDisplay_AllowIds,
                headingId: StringId.MarketFieldHeading_AllowIds,
            },
            ReasonId: {
                id: FieldId.ReasonId,
                name: 'Status',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.MarketFieldDisplay_ReasonId,
                headingId: StringId.MarketFieldHeading_ReasonId,
            },
            TradingMarkets: {
                id: FieldId.TradingMarkets,
                name: 'TradingMarkets',
                dataTypeId: FieldDataTypeId.EnumerationArray, // actually an interface array
                displayId: StringId.MarketFieldDisplay_TradingMarkets,
                headingId: StringId.MarketFieldHeading_TradingMarkets,
            },
        };

        export const count = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialiseField() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('Market.FieldId', outOfOrderIdx, infos[outOfOrderIdx].toString());
            }
        }

        export function idToName(id: FieldId) {
            return infos[id].name;
        }

        export function idToFieldDataTypeId(id: FieldId) {
            return infos[id].dataTypeId;
        }

        export function idToDisplayId(id: FieldId) {
            return infos[id].displayId;
        }

        export function idToDisplay(id: FieldId) {
            return Strings[idToDisplayId(id)];
        }

        export function idToHeadingId(id: FieldId) {
            return infos[id].headingId;
        }

        export function idToHeading(id: FieldId) {
            return Strings[idToHeadingId(id)];
        }
    }

    export class Key implements DataRecord.Key {
        static readonly jsonTag_MarketId = 'marketId';
        static readonly nullMarketIdJson = '';

        private _mapKey: MapKey;

        constructor(public marketId: MarketId | undefined) { }

        get mapKey() {
            if (this._mapKey === undefined) {
                this._mapKey = Key.generateMapKey(this.marketId);
            }
            return this._mapKey;
        }

        static createNull() {
            // will not match any valid holding
            return new Key(undefined);
        }

        assign(other: Key) {
            this.marketId = other.marketId;
        }

        saveToJson(element: JsonElement) {
            if (this.marketId === undefined) {
                element.setString(Key.jsonTag_MarketId, Key.nullMarketIdJson);
            } else {
                element.setString(Key.jsonTag_MarketId, MarketInfo.idToJsonValue(this.marketId));
            }
        }
    }

    export namespace Key {
        export const fieldCount = 1; // uses 1 field: marketId

        export function generateMapKey(marketId: MarketId | undefined): MapKey {
            return marketId === undefined ? '' : MarketInfo.idToName(marketId);
        }

        export function isEqual(left: Key, right: Key) {
            return left.marketId === right.marketId;
        }

        export function tryCreateFromJson(element: JsonElement) {
            const jsonId = element.tryGetString(Key.jsonTag_MarketId);
            if (jsonId === undefined) {
                return 'Undefined Id';
            } else {
                if (jsonId === Key.nullMarketIdJson) {
                    return Key.createNull();
                } else {
                    const marketId = MarketInfo.tryJsonValueToId(jsonId);
                    if (marketId === undefined) {
                        return `Unknown MarketId: ${jsonId}`;
                    } else {
                        return new Key(marketId);
                    }
                }
            }
        }
    }
}
