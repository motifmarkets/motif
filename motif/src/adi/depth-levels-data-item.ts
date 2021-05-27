/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    assert,
    comparePriceOrRemainder,
    Integer,
    Logger,
    MultiEvent,
    PriceOrRemainder,
    UnexpectedCaseError,
    UnreachableCaseError
} from 'src/sys/internal-api';
import {
    BidAskSideId,
    DataDefinition,
    DataMessage,
    DataMessageTypeId,
    DepthLevelsDataDefinition,
    DepthLevelsDataMessage,
    MarketId
} from './common/internal-api';
import { MarketSubscriptionDataItem } from './market-subscription-data-item';

export class DepthLevelsDataItem extends MarketSubscriptionDataItem {
    private _depthLevelsDefinition: DepthLevelsDataDefinition;

    private _bidLevels: DepthLevelsDataItem.Level[] = [];
    private _askLevels: DepthLevelsDataItem.Level[] = [];

    private _beforeBidLevelRemoveMultiEvent = new MultiEvent<DepthLevelsDataItem.BeforeLevelRemoveEventHandler>();
    private _afterBidLevelInsertMultiEvent = new MultiEvent<DepthLevelsDataItem.AfterLevelInsertEventHandler>();
    private _bidLevelChangeMultiEvent = new MultiEvent<DepthLevelsDataItem.LevelChangeEventHandler>();
    private _beforeAskLevelRemoveMultiEvent = new MultiEvent<DepthLevelsDataItem.BeforeLevelRemoveEventHandler>();
    private _afterAskLevelInsertMultiEvent = new MultiEvent<DepthLevelsDataItem.AfterLevelInsertEventHandler>();
    private _askLevelChangeMultiEvent = new MultiEvent<DepthLevelsDataItem.LevelChangeEventHandler>();
    private _beforeLevelsClearMultiEvent = new MultiEvent<DepthLevelsDataItem.BeforeLevelsClearEventHandler>();

    get depthLevelsDefinition() {
        return this._depthLevelsDefinition;
    }

    constructor(MyDataDefinition: DataDefinition) {
        super(MyDataDefinition);
        this._depthLevelsDefinition = this
            .definition as DepthLevelsDataDefinition;

        this.setMarketId(this._depthLevelsDefinition.litIvemId.litId);
    }

    getLevels(sideId: BidAskSideId): DepthLevelsDataItem.Level[] {
        switch (sideId) {
            case BidAskSideId.Bid:
                return this._bidLevels;

            case BidAskSideId.Ask:
                return this._askLevels;

            default:
                throw new UnreachableCaseError('DLDIGLFS9032287', sideId);
        }
    }

    processMessage(msg: DataMessage) {
        if (msg.typeId !== DataMessageTypeId.DepthLevels) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                switch (msg.typeId) {
                    case DataMessageTypeId.DepthLevels:
                        assert(
                            msg instanceof DepthLevelsDataMessage,
                            'ID:48723101902'
                        );
                        this.advisePublisherResponseUpdateReceived();
                        this.notifyUpdateChange();
                        this.processLevelsMessage(
                            msg as DepthLevelsDataMessage
                        );
                        break;

                    default:
                        throw new UnexpectedCaseError(
                            'DDIPM232984',
                            `${msg.typeId}`
                        );
                }
            } finally {
                this.endUpdate();
            }
        }
    }

    get bidRecords() {
        return this._bidLevels;
    }
    get askRecords() {
        return this._askLevels;
    }

    subscribeBeforeLevelRemoveEvent(
        sideId: BidAskSideId,
        handler: DepthLevelsDataItem.BeforeLevelRemoveEventHandler
    ) {
        switch (sideId) {
            case BidAskSideId.Bid:
                return this._beforeBidLevelRemoveMultiEvent.subscribe(handler);
            case BidAskSideId.Ask:
                return this._beforeAskLevelRemoveMultiEvent.subscribe(handler);
            default:
                throw new UnreachableCaseError('DDISBORE11148', sideId);
        }
    }

    unsubscribeBeforeLevelRemoveEvent(
        sideId: BidAskSideId,
        subscriptionId: MultiEvent.SubscriptionId
    ) {
        switch (sideId) {
            case BidAskSideId.Bid:
                this._beforeBidLevelRemoveMultiEvent.unsubscribe(
                    subscriptionId
                );
                break;
            case BidAskSideId.Ask:
                this._beforeAskLevelRemoveMultiEvent.unsubscribe(
                    subscriptionId
                );
                break;
            default:
                throw new UnreachableCaseError('DDIUBORE98447', sideId);
        }
    }

    subscribeAfterLevelInsertEvent(
        sideId: BidAskSideId,
        handler: DepthLevelsDataItem.AfterLevelInsertEventHandler
    ) {
        switch (sideId) {
            case BidAskSideId.Bid:
                return this._afterBidLevelInsertMultiEvent.subscribe(handler);
            case BidAskSideId.Ask:
                return this._afterAskLevelInsertMultiEvent.subscribe(handler);
            default:
                throw new UnreachableCaseError('DDISAOAE727266', sideId);
        }
    }

    unsubscribeAfterLevelInsertEvent(
        sideId: BidAskSideId,
        subscriptionId: MultiEvent.SubscriptionId
    ) {
        switch (sideId) {
            case BidAskSideId.Bid:
                this._afterBidLevelInsertMultiEvent.unsubscribe(subscriptionId);
                break;
            case BidAskSideId.Ask:
                this._afterAskLevelInsertMultiEvent.unsubscribe(subscriptionId);
                break;
            default:
                throw new UnreachableCaseError('DDIUAOAE188889', sideId);
        }
    }

    subscribeLevelChangeEvent(
        sideId: BidAskSideId,
        handler: DepthLevelsDataItem.LevelChangeEventHandler
    ) {
        switch (sideId) {
            case BidAskSideId.Bid:
                return this._bidLevelChangeMultiEvent.subscribe(handler);
            case BidAskSideId.Ask:
                return this._askLevelChangeMultiEvent.subscribe(handler);
            default:
                throw new UnreachableCaseError('DDISOCE22229', sideId);
        }
    }

    unsubscribeLevelChangeEvent(
        sideId: BidAskSideId,
        subscriptionId: MultiEvent.SubscriptionId
    ) {
        switch (sideId) {
            case BidAskSideId.Bid:
                this._bidLevelChangeMultiEvent.unsubscribe(subscriptionId);
                break;
            case BidAskSideId.Ask:
                this._askLevelChangeMultiEvent.unsubscribe(subscriptionId);
                break;
            default:
                throw new UnreachableCaseError('DDIUOCE09982', sideId);
        }
    }

    subscribeBeforeLevelsClearEvent(
        handler: DepthLevelsDataItem.BeforeLevelsClearEventHandler
    ) {
        return this._beforeLevelsClearMultiEvent.subscribe(handler);
    }

    unsubscribeBeforeLevelsClearEvent(
        subscriptionId: MultiEvent.SubscriptionId
    ) {
        this._beforeLevelsClearMultiEvent.unsubscribe(subscriptionId);
    }

    protected processSubscriptionPreOnline() {
        // virtual
        this.beginUpdate();
        try {
            this.clearLevels();
            super.processSubscriptionPreOnline();
        } finally {
            this.endUpdate();
        }
    }

    private notifyBeforeBidLevelRemove(levelIdx: Integer) {
        const handlers = this._beforeBidLevelRemoveMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](levelIdx);
        }
    }

    private notifyAfterBidLevelInsert(levelIdx: Integer) {
        const handlers = this._afterBidLevelInsertMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](levelIdx);
        }
    }

    private notifyBidLevelChange(
        levelIdx: Integer,
        changedFieldIds: DepthLevelsDataItem.Level.FieldId[]
    ) {
        const handlers = this._bidLevelChangeMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](levelIdx, changedFieldIds);
        }
    }

    private notifyBeforeAskLevelRemove(levelIdx: Integer) {
        const handlers = this._beforeAskLevelRemoveMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](levelIdx);
        }
    }

    private notifyAfterAskLevelInsert(levelIdx: Integer) {
        const handlers = this._afterAskLevelInsertMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](levelIdx);
        }
    }

    private notifyAskLevelChange(
        levelIdx: Integer,
        changedFieldIds: DepthLevelsDataItem.Level.FieldId[]
    ) {
        const handlers = this._askLevelChangeMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](levelIdx, changedFieldIds);
        }
    }

    private notifyAfterLevelInsert(sideId: BidAskSideId, levelIdx: Integer) {
        switch (sideId) {
            case BidAskSideId.Ask:
                this.notifyAfterAskLevelInsert(levelIdx);
                break;
            case BidAskSideId.Bid:
                this.notifyAfterBidLevelInsert(levelIdx);
                break;
            default:
                throw new UnreachableCaseError('DLDINALI129987', sideId);
        }
    }

    private notifyBeforeLevelRemove(sideId: BidAskSideId, levelIdx: Integer) {
        switch (sideId) {
            case BidAskSideId.Ask:
                this.notifyBeforeAskLevelRemove(levelIdx);
                break;
            case BidAskSideId.Bid:
                this.notifyBeforeBidLevelRemove(levelIdx);
                break;
            default:
                throw new UnreachableCaseError('DLDINBLR333822', sideId);
        }
    }

    private notifyLevelChange(
        sideId: BidAskSideId,
        levelIdx: Integer,
        changedFieldIds: DepthLevelsDataItem.Level.FieldId[]
    ) {
        switch (sideId) {
            case BidAskSideId.Ask:
                this.notifyAskLevelChange(levelIdx, changedFieldIds);
                break;
            case BidAskSideId.Bid:
                this.notifyBidLevelChange(levelIdx, changedFieldIds);
                break;
            default:
                throw new UnreachableCaseError('DLDINLC555842', sideId);
        }
    }

    private notifyBeforeLevelsClear() {
        const handlers = this._beforeLevelsClearMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index]();
        }
    }

    private clearLevels() {
        this.beginUpdate();
        try {
            const bidHadLevels = this._bidLevels.length > 0;
            const askHadLevels = this._askLevels.length > 0;
            if (bidHadLevels || askHadLevels) {
                this.notifyUpdateChange();
                this.notifyBeforeLevelsClear();
                this._bidLevels.length = 0;
                this._askLevels.length = 0;
            }
        } finally {
            this.endUpdate();
        }
    }

    private getLevelsAndRemainderAtMax(
        sideId: BidAskSideId
    ): DepthLevelsDataItem.LevelsAndSortDirection {
        switch (sideId) {
            case BidAskSideId.Bid:
                return { levels: this._bidLevels, lowToHighSorting: false };

            case BidAskSideId.Ask:
                return { levels: this._askLevels, lowToHighSorting: true };

            default:
                throw new UnreachableCaseError('DLDIGLARAM884209', sideId);
        }
    }

    private findSideLevelIndexById(
        list: DepthLevelsDataItem.Level[],
        id: string
    ): number {
        for (let index = 0; index < list.length; index++) {
            const level = list[index];
            if (level.id === id) {
                return index;
            }
        }
        return -1;
    }

    private findLevelIndexById(
        id: string
    ): DepthLevelsDataItem.FindLevelIndexByIdResult {
        let index: number | undefined;

        index = this.findSideLevelIndexById(this._bidLevels, id);
        if (index >= 0) {
            return {
                found: true,
                sideId: BidAskSideId.Bid,
                levels: this._bidLevels,
                index,
            };
        } else {
            index = this.findSideLevelIndexById(this._askLevels, id);
            if (index >= 0) {
                return {
                    found: true,
                    sideId: BidAskSideId.Ask,
                    levels: this._askLevels,
                    index,
                };
            } else {
                return {
                    found: false,
                    sideId: BidAskSideId.Ask, // ignored
                    levels: this._askLevels, // ignored
                    index: -1, // ignored
                };
            }
        }
    }

    private findSideLevelIndexByPrice(
        levels: DepthLevelsDataItem.Level[],
        lowToHighSorting: boolean,
        price: PriceOrRemainder
    ): DepthLevelsDataItem.FindLevelIndexByPriceResult {
        let Found = false;
        let L = 0;
        let H = levels.length - 1;
        while (L <= H) {
            /* eslint-disable no-bitwise */
            const mid = L + ((H - L) >> 1);
            /* eslint-enable no-bitwise */
            const cmp = comparePriceOrRemainder(
                levels[mid].price,
                price,
                lowToHighSorting
            );
            if (cmp < 0) {
                L = mid + 1;
            } else {
                H = mid - 1;
                if (cmp === 0) {
                    Found = true;
                }
            }
        }
        return {
            found: Found,
            index: L,
        };
    }

    private processMessage_AddLevel(
        msgLevel: DepthLevelsDataMessage.Level | undefined
    ) {
        if (msgLevel === undefined) {
            Logger.logDataError('DLDIPMALU834448', 'Add: Undefined Level');
        } else {
            const sideId = msgLevel.sideId;
            if (sideId === undefined) {
                Logger.logDataError(
                    'DLDIPMALS111984',
                    `Add: Undefined SideId. LitIvemId: ${this._depthLevelsDefinition.litIvemId.name}`
                );
            } else {
                const {
                    levels,
                    lowToHighSorting,
                } = this.getLevelsAndRemainderAtMax(sideId);
                const price = msgLevel.price;
                if (price === undefined) {
                    Logger.logDataError(
                        'DLDIPMALP68477',
                        `Add: Undefined Price. LitIvemId: ${this._depthLevelsDefinition.litIvemId.name}`
                    );
                } else {
                    const { found, index } = this.findSideLevelIndexByPrice(
                        levels,
                        lowToHighSorting,
                        price
                    );
                    if (found) {
                        Logger.logDataError(
                            'DLDIPMALF448633',
                            `Add: price already exists. LitIvemId: ${
                                this._depthLevelsDefinition.litIvemId.name
                            } \
                                                               Price: ${
                                                                   price ===
                                                                   null
                                                                       ? 'null'
                                                                       : price.toString()
                                                               }`
                        );
                    } else {
                        const level: DepthLevelsDataItem.Level = {
                            id: msgLevel.id,
                            sideId,
                            price,
                            orderCount: msgLevel.orderCount,
                            volume: msgLevel.volume,
                            marketId: msgLevel.marketId,
                            hasUndisclosed:
                                msgLevel.hasUndisclosed === undefined
                                    ? false
                                    : msgLevel.hasUndisclosed,
                        };
                        levels.splice(index, 0, level);
                        this.notifyAfterLevelInsert(sideId, index);
                    }
                }
            }
        }
    }

    private processMessage_UpdateLevel(
        msgLevel: DepthLevelsDataMessage.Level | undefined
    ) {
        if (msgLevel === undefined) {
            Logger.logDataError('DLDIPMULU488177', 'Update: Undefined Level');
        } else {
            const id = msgLevel.id;
            const { found, sideId, levels, index } = this.findLevelIndexById(
                id
            );
            if (!found) {
                Logger.logDataError(
                    'DLDIPMULF448633',
                    `update: id not found. LitIvemId: ${this._depthLevelsDefinition.litIvemId.name} Id: ${id}`
                );
            } else {
                const level = levels[index];
                const idCount = DepthLevelsDataItem.Level.Field.idCount;
                // set changedFieldIds length to maximum (id, sideId & price will not change)
                const changedFieldIds = new Array<DepthLevelsDataItem.Level.FieldId>(
                    idCount - 3
                );
                let count = 0;
                const newOrderCount = msgLevel.orderCount;
                if (level.orderCount !== newOrderCount) {
                    level.orderCount = newOrderCount;
                    changedFieldIds[count++] =
                        DepthLevelsDataItem.Level.FieldId.OrderCount;
                }
                const oldVolume = msgLevel.volume;
                const newVolume = msgLevel.volume;
                if (level.volume !== newVolume) {
                    level.volume = newVolume;
                    changedFieldIds[count++] =
                        DepthLevelsDataItem.Level.FieldId.Volume;
                }
                const newHasUndisclosed =
                    msgLevel.hasUndisclosed === undefined
                        ? false
                        : msgLevel.hasUndisclosed;
                if (level.hasUndisclosed !== newHasUndisclosed) {
                    level.hasUndisclosed = newHasUndisclosed;
                    changedFieldIds[count++] =
                        DepthLevelsDataItem.Level.FieldId.HasUndisclosed;
                }
                const newMarketId = msgLevel.marketId;
                if (level.marketId !== newMarketId) {
                    level.marketId = newMarketId;
                    changedFieldIds[count++] =
                        DepthLevelsDataItem.Level.FieldId.MarketId;
                }

                changedFieldIds.length = count;

                if (count > 0) {
                    this.notifyLevelChange(sideId, index, changedFieldIds);
                }
            }
        }
    }

    private processMessage_RemoveLevel(
        msgLevel: DepthLevelsDataMessage.Level | undefined
    ) {
        if (msgLevel === undefined) {
            Logger.logDataError('DLDIPMRLU666683', 'Remove: Undefined Level');
        } else {
            const id = msgLevel.id;
            const { found, sideId, levels, index } = this.findLevelIndexById(
                id
            );
            if (!found) {
                Logger.logDataError(
                    'DLDIPMRLF229827',
                    `Remove: id not found. LitIvemId: ${this._depthLevelsDefinition.litIvemId.name} Id: ${id}`
                );
            } else {
                this.notifyBeforeLevelRemove(sideId, index);
                levels.splice(index, 1);
            }
        }
    }

    private processLevelsMessage(msg: DepthLevelsDataMessage) {
        for (let index = 0; index < msg.levelChangeRecords.length; index++) {
            const cr = msg.levelChangeRecords[index];
            switch (cr.o) {
                case 'A':
                    this.processMessage_AddLevel(cr.level);
                    break;

                case 'U':
                    this.processMessage_UpdateLevel(cr.level);
                    break;

                case 'R':
                    this.processMessage_RemoveLevel(cr.level);
                    break;

                case 'C': // Clear All
                    this.clearLevels();
                    break;

                default:
                    throw new UnreachableCaseError('ID:30923101512', cr.o);
            }
        }
    }
}

export namespace DepthLevelsDataItem {
    export interface Level {
        id: string;
        sideId: BidAskSideId;
        price: PriceOrRemainder;
        orderCount: number | undefined; // Number of orders at this price level.
        volume: Integer | undefined; // Total number of shares at this price level.
        marketId: MarketId | undefined;
        hasUndisclosed: boolean;
    }

    export namespace Level {
        export const enum FieldId {
            Id,
            SideId,
            Price,
            OrderCount,
            Volume,
            HasUndisclosed,
            // eslint-disable-next-line @typescript-eslint/no-shadow
            MarketId,
        }

        export namespace Field {
            export const idCount = 7; // make sure matches number of FieldId enums
        }
    }

    export interface LevelsAndSortDirection {
        levels: DepthLevelsDataItem.Level[];
        lowToHighSorting: boolean;
    }

    export interface FindLevelIndexByIdResult {
        found: boolean;
        sideId: BidAskSideId;
        levels: DepthLevelsDataItem.Level[];
        index: Integer;
    }

    export interface FindLevelIndexByPriceResult {
        found: boolean;
        index: Integer;
    }

    export type LevelChangeEventHandler = (
        index: Integer,
        changedFieldIds: DepthLevelsDataItem.Level.FieldId[]
    ) => void;
    export type BeforeLevelRemoveEventHandler = (
        this: void,
        index: Integer
    ) => void;
    export type AfterLevelInsertEventHandler = (
        this: void,
        index: Integer
    ) => void;
    export type BeforeLevelsClearEventHandler = (this: void) => void;
}
