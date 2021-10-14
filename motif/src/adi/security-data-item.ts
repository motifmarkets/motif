/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from 'decimal.js-light';
import { RevRecordValueRecentChangeTypeId } from 'revgrid';
import { StringId, Strings } from 'src/res/internal-api';
import {
    assert,
    AssertInternalError,
    EnumInfoOutOfOrderError,
    Integer,
    isArrayEqualUniquely,
    isDecimalEqual,
    isDecimalGreaterThan,
    isUndefinableArrayEqualUniquely,
    MultiEvent,
    SourceTzOffsetDate,
    uniqueElementArraysOverlap
} from 'src/sys/internal-api';
import {
    CallOrPutId,
    DataDefinition,
    DataMessage,
    DataMessageTypeId,
    ExchangeId,
    FieldDataTypeId,
    IvemClassId,
    MarketId,
    MarketInfo,
    MovementId,
    SecurityDataDefinition,
    SecurityDataMessage,
    TradingState,
    TradingStates,
    ZenithSubscriptionDataId
} from './common/internal-api';
import { MarketSubscriptionDataItem } from './market-subscription-data-item';

export class SecurityDataItem extends MarketSubscriptionDataItem {
    private _code: string;
    private _exchange: ExchangeId | undefined;
    private _name: string | undefined;
    private _class: IvemClassId | undefined;
    private _cfi: string | undefined;
    private _tradingState: string | undefined;
    private _tradingStateAllowIds: TradingState.AllowIds | undefined;
    private _tradingStateReasonId: TradingState.ReasonId | undefined;
    private _tradingMarkets: MarketId[] | undefined;
    private _isIndex: boolean | undefined;
    private _expiryDate: SourceTzOffsetDate | undefined;
    private _strikePrice: Decimal | undefined;
    private _callOrPut: CallOrPutId | undefined;
    private _contractSize: Integer | undefined;
    private _subscriptionData: ZenithSubscriptionDataId[] | undefined;
    private _quotationBasis: string | undefined;
    private _open: Decimal | undefined;
    private _high: Decimal | undefined;
    private _low: Decimal | undefined;
    private _close: Decimal | undefined;
    private _settlement: Decimal | undefined;
    private _last: Decimal | undefined;
    private _trend: MovementId | undefined;
    private _bestAsk: Decimal | undefined;
    private _askCount: Integer | undefined;
    private _askQuantity: Integer | undefined;
    private _askUndisclosed: boolean | undefined;
    private _bestBid: Decimal | undefined;
    private _bidCount: Integer | undefined;
    private _bidQuantity: Integer | undefined;
    private _bidUndisclosed: boolean | undefined;
    private _numberOfTrades: Integer | undefined;
    private _volume: Integer | undefined;
    private _auctionPrice: Decimal | undefined;
    private _auctionQuantity: Integer | undefined;
    private _auctionRemainder: Integer | undefined;
    private _vWAP: Decimal | undefined;
    private _valueTraded: number | undefined;
    private _openInterest: Integer | undefined;
    private _shareIssue: Integer | undefined;
    private _statusNote: string | undefined;

    private _fieldValuesChangedMultiEvent = new MultiEvent<SecurityDataItem.FieldValuesChangedEvent>();

    constructor(MyDataDefinition: DataDefinition) {
        super(MyDataDefinition);

        if (!(super.getDefinition() instanceof SecurityDataDefinition)) {
            throw new AssertInternalError('SDICID2993', `${super.getDefinition().description}`);
        } else {
            const litIvemId = this.definition.litIvemId;
            if (litIvemId === undefined) {
                throw new AssertInternalError('SDICNL295776');
            } else {
                this._code = this.definition.litIvemId.code;
                this.setMarketId(this.definition.litIvemId.litId);
            }
        }
    }

    override get definition() { return super.getDefinition() as SecurityDataDefinition; }

    get code() { return this._code; }
    get exchange() { return this._exchange; }
    get name() { return this._name; }
    get class() { return this._class; }
    get cfi() { return this._cfi; }
    get tradingState() { return this._tradingState; }
    get tradingStateAllowIds() { return this._tradingStateAllowIds; }
    get tradingStateReasonId() { return this._tradingStateReasonId; }
    get tradingMarkets() { return this._tradingMarkets; }
    get isIndex() { return this._isIndex; }
    get expiryDate() { return this._expiryDate; }
    get strikePrice() { return this._strikePrice; }
    get callOrPut() { return this._callOrPut; }
    get contractSize() { return this._contractSize; }
    get subscriptionData() { return this._subscriptionData; }
    get quotationBasis() { return this._quotationBasis; }
    get open() { return this._open; }
    get high() { return this._high; }
    get low() { return this._low; }
    get close() { return this._close; }
    get settlement() { return this._settlement; }
    get last() { return this._last; }
    get trend() { return this._trend; }
    get bestAsk() { return this._bestAsk; }
    get askCount() { return this._askCount; }
    get askQuantity() { return this._askQuantity; }
    get askUndisclosed() { return this._askUndisclosed; }
    get bestBid() { return this._bestBid; }
    get bidCount() { return this._bidCount; }
    get bidQuantity() { return this._bidQuantity; }
    get bidUndisclosed() { return this._bidUndisclosed; }
    get numberOfTrades() { return this._numberOfTrades; }
    get volume() { return this._volume; }
    get auctionPrice() { return this._auctionPrice; }
    get auctionQuantity() { return this._auctionQuantity; }
    get auctionRemainder() { return this._auctionRemainder; }
    get vWAP() { return this._vWAP; }
    get valueTraded() { return this._valueTraded; }
    get openInterest() { return this._openInterest; }
    get shareIssue() { return this._shareIssue; }
    get statusNote() { return this._statusNote; }

    override processSubscriptionPreOnline() { // virtual
        this.beginUpdate();
        try {
            this.notifyUpdateChange();
            super.processSubscriptionPreOnline();

            const modifiedFieldIds = new Array<SecurityDataItem.FieldId>(SecurityDataItem.Field.idCount);
            let modifiedFieldCount = 0;

            // if (this._code !== this.definition.litIvemId.code) {
            //     this._code = this.definition.litIvemId.code;
            //     modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.Code;
            // }
            // if (this.marketId !== this.definition.litIvemId.litId) {
            //     this.setMarketId(this.definition.litIvemId.litId);
            //     modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.Market;
            // }
            if (this._exchange !== undefined) {
                this._exchange = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.Exchange;
            }
            if (this._name !== undefined) {
                this._name = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.Name;
            }
            if (this._class !== undefined) {
                this._class = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.Class;
            }
            if (this._cfi !== undefined) {
                this._cfi = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.Cfi;
            }
            if (this._tradingState !== undefined) {
                this._tradingState = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.TradingState;
            }
            if (this._tradingStateAllowIds !== undefined) {
                this._tradingStateAllowIds = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.TradingStateAllows;
            }
            if (this._tradingStateReasonId !== undefined) {
                this._tradingStateReasonId = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.TradingStateReason;
            }
            if (this._tradingMarkets !== undefined) {
                this._tradingMarkets = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.TradingMarkets;
            }
            if (this._isIndex !== undefined) {
                this._isIndex = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.IsIndex;
            }
            if (this._expiryDate !== undefined) {
                this._expiryDate = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.ExpiryDate;
            }
            if (this._strikePrice !== undefined) {
                this._strikePrice = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.StrikePrice;
            }
            if (this._callOrPut !== undefined) {
                this._callOrPut = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.CallOrPut;
            }
            if (this._contractSize !== undefined) {
                this._contractSize = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.ContractSize;
            }
            if (this._subscriptionData !== undefined) {
                this._subscriptionData = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.SubscriptionData;
            }
            if (this._quotationBasis !== undefined) {
                this._quotationBasis = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.QuotationBasis;
            }
            if (this._open !== undefined) {
                this._open = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.Open;
            }
            if (this._high !== undefined) {
                this._high = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.High;
            }
            if (this._low !== undefined) {
                this._low = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.Low;
            }
            if (this._close !== undefined) {
                this._close = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.Close;
            }
            if (this._settlement !== undefined) {
                this._settlement = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.Settlement;
            }
            if (this._last !== undefined) {
                this._last = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.Last;
            }
            if (this._trend !== undefined) {
                this._trend = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.Trend;
            }
            if (this._bestAsk !== undefined) {
                this._bestAsk = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.BestAsk;
            }
            if (this._askCount !== undefined) {
                this._askCount = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.AskCount;
            }
            if (this._askQuantity !== undefined) {
                this._askQuantity = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.AskQuantity;
            }
            if (this._askUndisclosed !== undefined) {
                this._askUndisclosed = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.AskUndisclosed;
            }
            if (this._bestBid !== undefined) {
                this._bestBid = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.BestBid;
            }
            if (this._bidCount !== undefined) {
                this._bidCount = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.BidCount;
            }
            if (this._bidQuantity !== undefined) {
                this._bidQuantity = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.BidQuantity;
            }
            if (this._bidUndisclosed !== undefined) {
                this._bidUndisclosed = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.BidUndisclosed;
            }
            if (this._numberOfTrades !== undefined) {
                this._numberOfTrades = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.NumberOfTrades;
            }
            if (this._volume !== undefined) {
                this._volume = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.Volume;
            }
            if (this._auctionPrice !== undefined) {
                this._auctionPrice = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.AuctionPrice;
            }
            if (this._auctionQuantity !== undefined) {
                this._auctionQuantity = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.AuctionQuantity;
            }
            if (this._auctionRemainder !== undefined) {
                this._auctionRemainder = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.AuctionRemainder;
            }
            if (this._vWAP !== undefined) {
                this._vWAP = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.VWAP;
            }
            if (this._valueTraded !== undefined) {
                this._valueTraded = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.ValueTraded;
            }
            if (this._openInterest !== undefined) {
                this._openInterest = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.OpenInterest;
            }
            if (this._shareIssue !== undefined) {
                this._shareIssue = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.ShareIssue;
            }
            if (this._statusNote !== undefined) {
                this._statusNote = undefined;
                modifiedFieldIds[modifiedFieldCount++] = SecurityDataItem.FieldId.StatusNote;
            }

            if (modifiedFieldCount > 0) {
                const valueChanges = new Array<SecurityDataItem.ValueChange>(modifiedFieldCount);
                for (let i = 0; i < modifiedFieldCount; i++) {
                    valueChanges[i] = {
                        fieldId: modifiedFieldIds[i],
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    }
                }
                this.notifyUpdateChange();
                this.notifyFieldValuesChanged(valueChanges);
            }

        } finally {
            this.endUpdate();
        }
    }

    /*AssignValues(SrcDataItem: TDataItem): void { // virtual
        super.AssignValues(SrcDataItem);
        const TypedSrc = SrcDataItem as TSecurityDataItem;
        this.FSecurityInfo = clone(TypedSrc.FSecurityInfo);
    }*/

    override processMessage(msg: DataMessage) { // virtual;
        if (msg.typeId !== DataMessageTypeId.Security) {
            super.processMessage(msg);
        } else {
            assert(msg instanceof SecurityDataMessage, 'ID:6905152711');
            const typedMsg = msg as SecurityDataMessage;

            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                const valueChanges = this.assignMessageSecurityInfo(typedMsg.securityInfo);

                if (valueChanges.length > 0) {
                    this.notifyUpdateChange();
                    this.notifyFieldValuesChanged(valueChanges);
                }
            } finally {
                this.endUpdate();
            }
        }
    }

    subscribeFieldValuesChangedEvent(handler: SecurityDataItem.FieldValuesChangedEvent) {
        return this._fieldValuesChangedMultiEvent.subscribe(handler);
    }

    unsubscribeFieldValuesChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._fieldValuesChangedMultiEvent.unsubscribe(subscriptionId);
    }

    protected override processMarketBecameAvailable() {
        this.updateTradingStateAllowsReason();
    }

    private notifyFieldValuesChanged(valueChanges: SecurityDataItem.ValueChange[]) {
        const handlers = this._fieldValuesChangedMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler(valueChanges);
        }
    }

    private updateTradingStateAllowsReason() {
        let allowIds: TradingState.AllowIds | undefined;
        let reasonId: TradingState.ReasonId | undefined;
        if (this.market === undefined || this._tradingState === undefined) {
            allowIds = undefined;
            reasonId = undefined;
        } else {
            const tradingStates = this.market.tradingStates;
            const state = TradingStates.find(tradingStates, this._tradingState);
            if (state === undefined) {
                allowIds = undefined;
                reasonId = undefined;
            } else {
                allowIds = state.allowIds;
                reasonId = state.reasonId;
            }
        }

        const result = new Array<SecurityDataItem.FieldId>(2);
        let count = 0;

        if (!isUndefinableArrayEqualUniquely<TradingState.AllowId>(allowIds, this._tradingStateAllowIds)) {
            this._tradingStateAllowIds = allowIds;
            result[count++] = SecurityDataItem.FieldId.TradingStateAllows;
        }

        if (reasonId !== this._tradingStateReasonId) {
            this._tradingStateReasonId = reasonId;
            result[count++] = SecurityDataItem.FieldId.TradingStateReason;
        }

        result.length = count;
        return result;
    }

    private assignMessageSecurityInfo(msgRec: SecurityDataMessage.Rec): SecurityDataItem.ValueChange[] {
        const valueChanges = new Array<SecurityDataItem.ValueChange>(SecurityDataItem.Field.idCount);
        let valueChangeCount = 0;

        if ((msgRec.code !== undefined) && (msgRec.code !== this._code)) {
            this._code = msgRec.code;
            valueChanges[valueChangeCount++] = {
                fieldId: SecurityDataItem.FieldId.Code,
                recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
            };
        }

        if ((msgRec.marketId !== undefined) && (msgRec.marketId !== this.marketId)) {
            throw new AssertInternalError('SDIAMSI232323998',
                `${MarketInfo.idToName(msgRec.marketId)} ${MarketInfo.idToName(this.marketId)}`
            );
        }

        if ((msgRec.exchangeId !== undefined) && (msgRec.exchangeId !== this._exchange)) {
            this._exchange = msgRec.exchangeId;
            valueChanges[valueChangeCount++] = {
                fieldId: SecurityDataItem.FieldId.Exchange,
                recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
            };
        }

        if ((msgRec.name !== undefined) && (msgRec.name !== this._name)) {
            this._name = msgRec.name;
            valueChanges[valueChangeCount++] = {
                fieldId: SecurityDataItem.FieldId.Name,
                recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
            };
        }

        if ((msgRec.classId !== undefined) && (msgRec.classId !== this._class)) {
            this._class = msgRec.classId;
            valueChanges[valueChangeCount++] = {
                fieldId: SecurityDataItem.FieldId.Class,
                recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
            };
        }

        if ((msgRec.cfi !== undefined) && (msgRec.cfi !== this._cfi)) {
            this._cfi = msgRec.cfi;
            valueChanges[valueChangeCount++] = {
                fieldId: SecurityDataItem.FieldId.Cfi,
                recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
            };
        }

        if ((msgRec.tradingState !== undefined) && (msgRec.tradingState !== this._tradingState)) {
            this._tradingState = msgRec.tradingState;
            valueChanges[valueChangeCount++] = {
                fieldId: SecurityDataItem.FieldId.TradingState,
                recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
            };

            const allowReasonModifiedFieldIds = this.updateTradingStateAllowsReason();
            for (const fieldId of allowReasonModifiedFieldIds) {
                valueChanges[valueChangeCount++] = {
                    fieldId: fieldId,
                    recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                };
            }
        }

        if (msgRec.marketIds !== undefined) {
            if ((this._tradingMarkets === undefined) ||
                !uniqueElementArraysOverlap<Integer>(msgRec.marketIds, this._tradingMarkets)
            ) {
                this._tradingMarkets = msgRec.marketIds;
                valueChanges[valueChangeCount++] = {
                    fieldId: SecurityDataItem.FieldId.TradingMarkets,
                    recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                };
            }
        }

        if ((msgRec.isIndex !== undefined) && (msgRec.isIndex !== this._isIndex)) {
            this._isIndex = msgRec.isIndex;
            valueChanges[valueChangeCount++] = {
                fieldId: SecurityDataItem.FieldId.IsIndex,
                recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
            };
        }

        if ((msgRec.expiryDate !== undefined) && (!SourceTzOffsetDate.isUndefinableEqual(msgRec.expiryDate, this._expiryDate))) {
            this._expiryDate = msgRec.expiryDate;
            valueChanges[valueChangeCount++] = {
                fieldId: SecurityDataItem.FieldId.ExpiryDate,
                recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
            };
        }

        if (msgRec.strikePrice !== undefined) {
            if (this._strikePrice === undefined || !isDecimalEqual(msgRec.strikePrice, this._strikePrice)) {
                this._strikePrice = msgRec.strikePrice;
                valueChanges[valueChangeCount++] = {
                    fieldId: SecurityDataItem.FieldId.StrikePrice,
                    recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                };
            }
        }

        if ((msgRec.callOrPutId !== undefined) && (msgRec.callOrPutId !== this._callOrPut)) {
            this._callOrPut = msgRec.callOrPutId;
            valueChanges[valueChangeCount++] = {
                fieldId: SecurityDataItem.FieldId.CallOrPut,
                recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
            };
        }

        if ((msgRec.contractSize !== undefined) && (msgRec.contractSize !== this._contractSize)) {
            this._contractSize = msgRec.contractSize;
            valueChanges[valueChangeCount++] = {
                fieldId: SecurityDataItem.FieldId.ContractSize,
                recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
            };
        }

        if (msgRec.subscriptionDataIds !== undefined) {
            if ((this._subscriptionData === undefined) ||
                !isArrayEqualUniquely<Integer>(msgRec.subscriptionDataIds, this._subscriptionData)
            ) {
                this._subscriptionData = msgRec.subscriptionDataIds;
                valueChanges[valueChangeCount++] = {
                    fieldId: SecurityDataItem.FieldId.SubscriptionData,
                    recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                };
            }
        }

        if (msgRec.quotationBasis !== undefined) {
            if (msgRec.quotationBasis === null) {
                if (this._quotationBasis !== undefined) {
                    this._quotationBasis = undefined;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.QuotationBasis,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                }
            } else {
                if (msgRec.quotationBasis !== this._quotationBasis) {
                    this._quotationBasis = msgRec.quotationBasis;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.QuotationBasis,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                }
            }
        }

        const newOpen = msgRec.open;
        if (newOpen !== undefined) {
            if (newOpen === null) {
                if (this._open !== undefined) {
                    this._open = undefined;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.Open,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                }
            } else {
                if (this._open === undefined) {
                    this._open = newOpen;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.Open,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                } else {
                    if (!isDecimalEqual(newOpen, this._open)) {
                        const recentChangeTypeId = isDecimalGreaterThan(newOpen, this._open)
                            ? RevRecordValueRecentChangeTypeId.Increase
                            : RevRecordValueRecentChangeTypeId.Decrease;
                        this._open = newOpen;
                        valueChanges[valueChangeCount++] = {
                            fieldId: SecurityDataItem.FieldId.Open,
                            recentChangeTypeId,
                        };
                    }
                }
            }
        }

        const newHigh = msgRec.high;
        if (newHigh !== undefined) {
            if (newHigh === null) {
                if (this._high !== undefined) {
                    this._high = undefined;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.High,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                }
            } else {
                if (this._high === undefined) {
                    this._high = newHigh;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.High,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                } else {
                    if (!isDecimalEqual(newHigh, this._high)) {
                        const recentChangeTypeId = isDecimalGreaterThan(newHigh, this._high)
                            ? RevRecordValueRecentChangeTypeId.Increase
                            : RevRecordValueRecentChangeTypeId.Decrease;
                        this._high = newHigh;
                        valueChanges[valueChangeCount++] = {
                            fieldId: SecurityDataItem.FieldId.High,
                            recentChangeTypeId,
                        };
                    }
                }
            }
        }

        const newLow = msgRec.low;
        if (newLow !== undefined) {
            if (newLow === null) {
                if (this._low !== undefined) {
                    this._low = undefined;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.Low,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                }
            } else {
                if (this._low === undefined) {
                    this._low = newLow;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.Low,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                } else {
                    if (!isDecimalEqual(newLow, this._low)) {
                        const recentChangeTypeId = isDecimalGreaterThan(newLow, this._low)
                            ? RevRecordValueRecentChangeTypeId.Increase
                            : RevRecordValueRecentChangeTypeId.Decrease;
                        this._low = newLow;
                        valueChanges[valueChangeCount++] = {
                            fieldId: SecurityDataItem.FieldId.Low,
                            recentChangeTypeId,
                        };
                    }
                }
            }
        }

        const newClose = msgRec.close;
        if (newClose !== undefined) {
            if (newClose === null) {
                if (this._close !== undefined) {
                    this._close = undefined;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.Close,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                }
            } else {
                if (this._close === undefined) {
                    this._close = newClose;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.Close,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                } else {
                    if (!isDecimalEqual(newClose, this._close)) {
                        const recentChangeTypeId = isDecimalGreaterThan(newClose, this._close)
                            ? RevRecordValueRecentChangeTypeId.Increase
                            : RevRecordValueRecentChangeTypeId.Decrease;
                        this._close = newClose;
                        valueChanges[valueChangeCount++] = {
                            fieldId: SecurityDataItem.FieldId.Close,
                            recentChangeTypeId,
                        };
                    }
                }
            }
        }

        const newSettlement = msgRec.settlement;
        if (newSettlement !== undefined) {
            if (newSettlement === null) {
                if (this._settlement !== undefined) {
                    this._settlement = undefined;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.Settlement,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                }
            } else {
                if (this._settlement === undefined) {
                    this._settlement = newSettlement;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.Settlement,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                } else {
                    if (!isDecimalEqual(newSettlement, this._settlement)) {
                        const recentChangeTypeId = isDecimalGreaterThan(newSettlement, this._settlement)
                            ? RevRecordValueRecentChangeTypeId.Increase
                            : RevRecordValueRecentChangeTypeId.Decrease;
                        this._settlement = newSettlement;
                        valueChanges[valueChangeCount++] = {
                            fieldId: SecurityDataItem.FieldId.Settlement,
                            recentChangeTypeId,
                        };
                    }
                }
            }
        }

        const newLast = msgRec.last;
        if (newLast !== undefined) {
            if (newLast === null) {
                if (this._last !== undefined) {
                    this._last = undefined;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.Last,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                }
            } else {
                if (this._last === undefined) {
                    this._last = newLast;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.Last,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                } else {
                    if (!isDecimalEqual(newLast, this._last)) {
                        const recentChangeTypeId = isDecimalGreaterThan(newLast, this._last)
                            ? RevRecordValueRecentChangeTypeId.Increase
                            : RevRecordValueRecentChangeTypeId.Decrease;
                        this._last = newLast;
                        valueChanges[valueChangeCount++] = {
                            fieldId: SecurityDataItem.FieldId.Last,
                            recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                        };
                    }
                }
            }
        }

        if ((msgRec.trend !== undefined) && (msgRec.trend !== this._trend)) {
            this._trend = msgRec.trend;
            valueChanges[valueChangeCount++] = {
                fieldId: SecurityDataItem.FieldId.Trend,
                recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
            };
        }

        const newBestAsk = msgRec.bestAsk;
        if (newBestAsk !== undefined) {
            if (newBestAsk === null) {
                if (this._bestAsk !== undefined) {
                    this._bestAsk = undefined;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.BestAsk,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                }
            } else {
                if (this._bestAsk === undefined) {
                    this._bestAsk = newBestAsk;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.BestAsk,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                } else {
                    if (!isDecimalEqual(newBestAsk, this._bestAsk)) {
                        const recentChangeTypeId = isDecimalGreaterThan(newBestAsk, this._bestAsk)
                            ? RevRecordValueRecentChangeTypeId.Increase
                            : RevRecordValueRecentChangeTypeId.Decrease;
                        this._bestAsk = newBestAsk;
                        valueChanges[valueChangeCount++] = {
                            fieldId: SecurityDataItem.FieldId.BestAsk,
                            recentChangeTypeId,
                        };
                    }
                }
            }
        }

        const newAskCount = msgRec.askCount;
        if (newAskCount !== undefined) {
            if (newAskCount !== this._askCount) {
                let recentChangeTypeId: RevRecordValueRecentChangeTypeId;
                if (this._askCount === undefined) {
                    recentChangeTypeId = RevRecordValueRecentChangeTypeId.Update;
                } else {
                    recentChangeTypeId = newAskCount > this._askCount
                        ? RevRecordValueRecentChangeTypeId.Increase
                        : RevRecordValueRecentChangeTypeId.Decrease;
                }
                this._askCount = newAskCount;
                valueChanges[valueChangeCount++] = {
                    fieldId: SecurityDataItem.FieldId.AskCount,
                    recentChangeTypeId,
                };
            }
        }

        const newAskQuantity = msgRec.askQuantity;
        if ((newAskQuantity !== undefined) && (newAskQuantity !== this._askQuantity)) {
            let recentChangeTypeId: RevRecordValueRecentChangeTypeId;
            if (this._askQuantity === undefined) {
                recentChangeTypeId = RevRecordValueRecentChangeTypeId.Update;
            } else {
                recentChangeTypeId = newAskQuantity > this._askQuantity
                    ? RevRecordValueRecentChangeTypeId.Increase
                    : RevRecordValueRecentChangeTypeId.Decrease;
            }
            this._askQuantity = newAskQuantity;
            valueChanges[valueChangeCount++] = {
                fieldId: SecurityDataItem.FieldId.AskQuantity,
                recentChangeTypeId,
            };
        }

        const newAskUndisclosed = msgRec.askUndisclosed;
        if ((newAskUndisclosed !== undefined) && (newAskUndisclosed !== this._askUndisclosed)) {
            this._askUndisclosed = newAskUndisclosed;
            valueChanges[valueChangeCount++] = {
                fieldId: SecurityDataItem.FieldId.AskUndisclosed,
                recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
            };
        }

        const newBestBid = msgRec.bestBid;
        if (newBestBid !== undefined) {
            if (newBestBid === null) {
                if (this._bestBid !== undefined) {
                    this._bestBid = undefined;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.BestBid,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                }
            } else {
                if (this._bestBid === undefined) {
                    this._bestBid = newBestBid;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.BestBid,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                } else {
                    if (!isDecimalEqual(newBestBid, this._bestBid)) {
                        const recentChangeTypeId = isDecimalGreaterThan(newBestBid, this._bestBid)
                            ? RevRecordValueRecentChangeTypeId.Increase
                            : RevRecordValueRecentChangeTypeId.Decrease;
                        this._bestBid = newBestBid;
                        valueChanges[valueChangeCount++] = {
                            fieldId: SecurityDataItem.FieldId.BestBid,
                            recentChangeTypeId,
                        };
                    }
                }
            }
        }

        const newBidCount = msgRec.bidCount;
        if (newBidCount !== undefined) {
            if (this._bidCount === undefined) {
                this._bidCount = newBidCount;
                valueChanges[valueChangeCount++] = {
                    fieldId: SecurityDataItem.FieldId.BidCount,
                    recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                };
            } else {
                if (newBidCount !== this._bidCount) {
                    const recentChangeTypeId = newBidCount > this._bidCount
                        ? RevRecordValueRecentChangeTypeId.Increase
                        : RevRecordValueRecentChangeTypeId.Decrease;
                    this._bidCount = newBidCount;
                    valueChanges[valueChangeCount++] = { fieldId: SecurityDataItem.FieldId.BidCount, recentChangeTypeId };
                }
            }
        }

        const newBidQuantity = msgRec.bidQuantity;
        if (newBidQuantity !== undefined) {
            if (this._bidQuantity === undefined) {
                this._bidQuantity = newBidQuantity;
                valueChanges[valueChangeCount++] = {
                    fieldId: SecurityDataItem.FieldId.BidQuantity,
                    recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                };
            } else {
                if (newBidQuantity !== this._bidQuantity) {
                    const recentChangeTypeId = newBidQuantity > this._bidQuantity
                        ? RevRecordValueRecentChangeTypeId.Increase
                        : RevRecordValueRecentChangeTypeId.Decrease;

                    this._bidQuantity = newBidQuantity;
                    valueChanges[valueChangeCount++] = { fieldId: SecurityDataItem.FieldId.BidQuantity, recentChangeTypeId };
                }
            }
        }

        const newBidUndisclosed = msgRec.bidUndisclosed;
        if ((newBidUndisclosed !== undefined) && (newBidUndisclosed !== this._bidUndisclosed)) {
            this._bidUndisclosed = newBidUndisclosed;
            valueChanges[valueChangeCount++] = {
                fieldId: SecurityDataItem.FieldId.BidUndisclosed,
                recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
            };
        }

        const newNumberOfTrades = msgRec.numberOfTrades;
        if (newNumberOfTrades !== undefined) {
            if (this._numberOfTrades === undefined) {
                this._numberOfTrades = newNumberOfTrades;
                valueChanges[valueChangeCount++] = {
                    fieldId: SecurityDataItem.FieldId.NumberOfTrades,
                    recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                };
            } else {
                if (newNumberOfTrades !== this._numberOfTrades) {
                    const recentChangeTypeId = newNumberOfTrades > this._numberOfTrades
                        ? RevRecordValueRecentChangeTypeId.Increase
                        : RevRecordValueRecentChangeTypeId.Decrease;

                    this._numberOfTrades = newNumberOfTrades;
                    valueChanges[valueChangeCount++] = { fieldId: SecurityDataItem.FieldId.NumberOfTrades, recentChangeTypeId };
                }
            }
        }

        const newVolume = msgRec.volume;
        if (newVolume !== undefined) {
            if (this._volume === undefined) {
                this._volume = newVolume;
                valueChanges[valueChangeCount++] = {
                    fieldId: SecurityDataItem.FieldId.Volume,
                    recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                };
            } else {
                if (newVolume !== this._volume) {
                    const recentChangeTypeId = newVolume > this._volume
                        ? RevRecordValueRecentChangeTypeId.Increase
                        : RevRecordValueRecentChangeTypeId.Decrease;

                    this._volume = newVolume;
                    valueChanges[valueChangeCount++] = { fieldId: SecurityDataItem.FieldId.Volume, recentChangeTypeId };
                }
            }
        }

        const newAuctionPrice = msgRec.auctionPrice;
        if (newAuctionPrice !== undefined) {
            if (newAuctionPrice === null) {
                if (this._auctionPrice !== undefined) {
                    this._auctionPrice = undefined;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.AuctionPrice,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                }
            } else {
                if (this._auctionPrice === undefined) {
                    this._auctionPrice = newAuctionPrice;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.AuctionPrice,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                } else {
                    if (!isDecimalEqual(newAuctionPrice, this._auctionPrice)) {
                        const recentChangeTypeId = isDecimalGreaterThan(newAuctionPrice, this._auctionPrice)
                            ? RevRecordValueRecentChangeTypeId.Increase
                            : RevRecordValueRecentChangeTypeId.Decrease;

                        this._auctionPrice = newAuctionPrice;
                        valueChanges[valueChangeCount++] = { fieldId: SecurityDataItem.FieldId.AuctionPrice, recentChangeTypeId };
                    }
                }
            }
        }

        const newAuctionQuantity = msgRec.auctionQuantity;
        if (newAuctionQuantity !== undefined) {
            if (newAuctionQuantity === null) {
                if (this._auctionQuantity !== undefined) {
                    this._auctionQuantity = undefined;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.AuctionQuantity,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                }
            } else {
                if (this._auctionQuantity === undefined) {
                    this._auctionQuantity = newAuctionQuantity;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.AuctionQuantity,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                } else {
                    if (newAuctionQuantity !== this._auctionQuantity) {
                        const recentChangeTypeId = newAuctionQuantity > this._auctionQuantity
                            ? RevRecordValueRecentChangeTypeId.Increase
                            : RevRecordValueRecentChangeTypeId.Decrease;

                        this._auctionQuantity = newAuctionQuantity;
                        valueChanges[valueChangeCount++] = { fieldId: SecurityDataItem.FieldId.AuctionQuantity, recentChangeTypeId };
                    }
                }
            }
        }

        const newAuctionRemainder = msgRec.auctionRemainder;
        if (newAuctionRemainder !== undefined) {
            if (newAuctionRemainder === null) {
                if (this._auctionRemainder !== undefined) {
                    this._auctionRemainder = undefined;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.AuctionRemainder,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                }
            } else {
                if (this._auctionRemainder === undefined) {
                    this._auctionRemainder = newAuctionRemainder;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.AuctionRemainder,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                } else {
                    if (newAuctionRemainder !== this._auctionRemainder) {
                        const recentChangeTypeId = newAuctionRemainder > this._auctionRemainder
                            ? RevRecordValueRecentChangeTypeId.Increase
                            : RevRecordValueRecentChangeTypeId.Decrease;

                        this._auctionRemainder = newAuctionRemainder;
                        valueChanges[valueChangeCount++] = { fieldId: SecurityDataItem.FieldId.AuctionRemainder, recentChangeTypeId };
                    }
                }
            }
        }

        const newVWAP = msgRec.vWAP;
        if (newVWAP !== undefined) {
            if (newVWAP === null) {
                if (this._vWAP !== undefined) {
                    this._vWAP = undefined;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.VWAP,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                }
            } else {
                if (this._vWAP === undefined) {
                    this._vWAP = newVWAP;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.VWAP,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                } else {
                    if (!isDecimalEqual(newVWAP, this._vWAP)) {
                        const recentChangeTypeId = newVWAP > this._vWAP
                            ? RevRecordValueRecentChangeTypeId.Increase
                            : RevRecordValueRecentChangeTypeId.Decrease;

                        this._vWAP = newVWAP;
                        valueChanges[valueChangeCount++] = { fieldId: SecurityDataItem.FieldId.VWAP, recentChangeTypeId };
                    }
                }
            }
        }

        const newValueTraded = msgRec.valueTraded;
        if (newValueTraded !== undefined) {
            if (this._valueTraded === undefined) {
                this._valueTraded = newValueTraded;
                valueChanges[valueChangeCount++] = {
                    fieldId: SecurityDataItem.FieldId.ValueTraded,
                    recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                };
            } else {
                if (newValueTraded !== this._valueTraded) {
                    const recentChangeTypeId = newValueTraded > this._valueTraded
                        ? RevRecordValueRecentChangeTypeId.Increase
                        : RevRecordValueRecentChangeTypeId.Decrease;

                    this._valueTraded = newValueTraded;
                    valueChanges[valueChangeCount++] = { fieldId: SecurityDataItem.FieldId.ValueTraded, recentChangeTypeId };
                }
            }
        }

        const newOpenInterest = msgRec.openInterest;
        if (newOpenInterest !== undefined) {
            if (newOpenInterest === null) {
                if (this._openInterest !== undefined) {
                    this._openInterest = undefined;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.OpenInterest,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                }
            } else {
                if (this._openInterest === undefined) {
                    this._openInterest = newOpenInterest;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.OpenInterest,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                } else {
                    if (newOpenInterest !== this._openInterest) {
                        const recentChangeTypeId = newOpenInterest > this._openInterest
                            ? RevRecordValueRecentChangeTypeId.Increase
                            : RevRecordValueRecentChangeTypeId.Decrease;

                        this._openInterest = newOpenInterest;
                        valueChanges[valueChangeCount++] = { fieldId: SecurityDataItem.FieldId.OpenInterest, recentChangeTypeId };
                    }
                }
            }
        }

        const newShareIssue = msgRec.shareIssue;
        if (newShareIssue !== undefined) {
            if (newShareIssue === null) {
                if (this._shareIssue !== undefined) {
                    this._shareIssue = undefined;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.ShareIssue,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                }
            } else {
                if (this._shareIssue === undefined) {
                    this._shareIssue = newShareIssue;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.ShareIssue,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                } else {
                    if (newShareIssue !== this._shareIssue) {
                        const recentChangeTypeId = newShareIssue > this._shareIssue
                            ? RevRecordValueRecentChangeTypeId.Increase
                            : RevRecordValueRecentChangeTypeId.Decrease;

                        this._shareIssue = newShareIssue;
                        valueChanges[valueChangeCount++] = { fieldId: SecurityDataItem.FieldId.ShareIssue, recentChangeTypeId };
                    }
                }
            }
        }

        const newStatusNote = msgRec.statusNote;
        if (newStatusNote !== undefined) {
            if (newStatusNote === null) {
                if (this._statusNote !== undefined) {
                    this._statusNote = undefined;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.StatusNote,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                }
            } else {
                if (newStatusNote !== this._statusNote) {
                    this._statusNote = newStatusNote;
                    valueChanges[valueChangeCount++] = {
                        fieldId: SecurityDataItem.FieldId.StatusNote,
                        recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                    };
                }
            }
        }

        valueChanges.length = valueChangeCount;
        return valueChanges;
    }
}

export namespace SecurityDataItem {
    export const enum FieldId {
        LitIvemId,
        Code,
        Market,
        Exchange,
        Name,
        Class,
        Cfi,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        TradingState,
        TradingStateAllows,
        TradingStateReason,
        TradingMarkets,
        IsIndex,
        ExpiryDate,
        StrikePrice,
        CallOrPut,
        ContractSize,
        SubscriptionData,
        QuotationBasis,
        Open,
        High,
        Low,
        Close,
        Settlement,
        Last,
        Trend,
        BestAsk,
        AskCount,
        AskQuantity,
        AskUndisclosed,
        BestBid,
        BidCount,
        BidQuantity,
        BidUndisclosed,
        NumberOfTrades,
        Volume,
        AuctionPrice,
        AuctionQuantity,
        AuctionRemainder,
        VWAP,
        ValueTraded,
        OpenInterest,
        ShareIssue,
        StatusNote,
    }

    export type FieldValuesChangedEvent = (this: void, valueChanges: SecurityDataItem.ValueChange[]) => void;

    export namespace Field {
        export type Id = SecurityDataItem.FieldId;
        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly dataTypeId: FieldDataTypeId;
            readonly displayId: StringId;
            readonly headingId: StringId;
        }

        type InfoObject = { [id in keyof typeof FieldId]: Info };

        const infoObject: InfoObject = {
            LitIvemId: {
                id: FieldId.LitIvemId,
                name: 'LitIvemId',
                dataTypeId: FieldDataTypeId.LitIvemId,
                displayId: StringId.SecurityFieldDisplay_Symbol,
                headingId: StringId.SecurityFieldHeading_Symbol,
            },
            Code: {
                id: FieldId.Code,
                name: 'Code',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.SecurityFieldDisplay_Code,
                headingId: StringId.SecurityFieldHeading_Code,
            },
            Market: {
                id: FieldId.Market,
                name: 'Market',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.SecurityFieldDisplay_Market,
                headingId: StringId.SecurityFieldHeading_Market,
            },
            Exchange: {
                id: FieldId.Exchange,
                name: 'Exchange',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.SecurityFieldDisplay_Exchange,
                headingId: StringId.SecurityFieldHeading_Exchange,
            },
            Name: {
                id: FieldId.Name,
                name: 'Name',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.SecurityFieldDisplay_Name,
                headingId: StringId.SecurityFieldHeading_Name,
            },
            Class: {
                id: FieldId.Class,
                name: 'Class',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.SecurityFieldDisplay_Class,
                headingId: StringId.SecurityFieldHeading_Class,
            },
            Cfi: {
                id: FieldId.Cfi,
                name: 'Cfi',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.SecurityFieldDisplay_Cfi,
                headingId: StringId.SecurityFieldHeading_Cfi,
            },
            TradingState: {
                id: FieldId.TradingState,
                name: 'TradingState',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.SecurityFieldDisplay_TradingState,
                headingId: StringId.SecurityFieldHeading_TradingState,
            },
            TradingStateAllows: {
                id: FieldId.TradingStateAllows,
                name: 'TradingStateAllows',
                dataTypeId: FieldDataTypeId.EnumerationArray,
                displayId: StringId.SecurityFieldDisplay_TradingStateAllows,
                headingId: StringId.SecurityFieldHeading_TradingStateAllows,
            },
            TradingStateReason: {
                id: FieldId.TradingStateReason,
                name: 'TradingStateReason',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.SecurityFieldDisplay_TradingStateReason,
                headingId: StringId.SecurityFieldHeading_TradingStateReason,
            },
            TradingMarkets: {
                id: FieldId.TradingMarkets,
                name: 'TradingMarkets',
                dataTypeId: FieldDataTypeId.EnumerationArray,
                displayId: StringId.SecurityFieldDisplay_TradingMarkets,
                headingId: StringId.SecurityFieldHeading_TradingMarkets,
            },
            IsIndex: {
                id: FieldId.IsIndex,
                name: 'IsIndex',
                dataTypeId: FieldDataTypeId.Boolean,
                displayId: StringId.SecurityFieldDisplay_IsIndex,
                headingId: StringId.SecurityFieldHeading_IsIndex,
            },
            ExpiryDate: {
                id: FieldId.ExpiryDate,
                name: 'ExpiryDate',
                dataTypeId: FieldDataTypeId.Date,
                displayId: StringId.SecurityFieldDisplay_ExpiryDate,
                headingId: StringId.SecurityFieldHeading_ExpiryDate,
            },
            StrikePrice: {
                id: FieldId.StrikePrice,
                name: 'StrikePrice',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.SecurityFieldDisplay_StrikePrice,
                headingId: StringId.SecurityFieldHeading_StrikePrice,
            },
            CallOrPut: {
                id: FieldId.CallOrPut,
                name: 'CallOrPut',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.SecurityFieldDisplay_CallOrPut,
                headingId: StringId.SecurityFieldHeading_CallOrPut,
            },
            ContractSize: {
                id: FieldId.ContractSize,
                name: 'ContractSize',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.SecurityFieldDisplay_ContractSize,
                headingId: StringId.SecurityFieldHeading_ContractSize,
            },
            SubscriptionData: {
                id: FieldId.SubscriptionData,
                name: 'SubscriptionData',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.SecurityFieldDisplay_SubscriptionData,
                headingId: StringId.SecurityFieldHeading_SubscriptionData,
            },
            QuotationBasis: {
                id: FieldId.QuotationBasis,
                name: 'QuotationBasis',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.SecurityFieldDisplay_QuotationBasis,
                headingId: StringId.SecurityFieldHeading_QuotationBasis,
            },
            Open: {
                id: FieldId.Open,
                name: 'Open',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.SecurityFieldDisplay_Open,
                headingId: StringId.SecurityFieldHeading_Open,
            },
            High: {
                id: FieldId.High,
                name: 'High',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.SecurityFieldDisplay_High,
                headingId: StringId.SecurityFieldHeading_High,
            },
            Low: {
                id: FieldId.Low,
                name: 'Low',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.SecurityFieldDisplay_Low,
                headingId: StringId.SecurityFieldHeading_Low,
            },
            Close: {
                id: FieldId.Close,
                name: 'Close',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.SecurityFieldDisplay_Close,
                headingId: StringId.SecurityFieldHeading_Close,
            },
            Settlement: {
                id: FieldId.Settlement,
                name: 'Settlement',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.SecurityFieldDisplay_Settlement,
                headingId: StringId.SecurityFieldHeading_Settlement,
            },
            Last: {
                id: FieldId.Last,
                name: 'Last',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.SecurityFieldDisplay_Last,
                headingId: StringId.SecurityFieldHeading_Last,
            },
            Trend: {
                id: FieldId.Trend,
                name: 'Trend',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.SecurityFieldDisplay_Trend,
                headingId: StringId.SecurityFieldHeading_Trend,
            },
            BestAsk: {
                id: FieldId.BestAsk,
                name: 'BestAsk',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.SecurityFieldDisplay_BestAsk,
                headingId: StringId.SecurityFieldHeading_BestAsk,
            },
            AskCount: {
                id: FieldId.AskCount,
                name: 'AskCount',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.SecurityFieldDisplay_AskCount,
                headingId: StringId.SecurityFieldHeading_AskCount,
            },
            AskQuantity: {
                id: FieldId.AskQuantity,
                name: 'AskQuantity',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.SecurityFieldDisplay_AskQuantity,
                headingId: StringId.SecurityFieldHeading_AskQuantity,
            },
            AskUndisclosed: {
                id: FieldId.AskUndisclosed,
                name: 'AskUndisclosed',
                dataTypeId: FieldDataTypeId.Boolean,
                displayId: StringId.SecurityFieldDisplay_AskUndisclosed,
                headingId: StringId.SecurityFieldHeading_AskUndisclosed,
            },
            BestBid: {
                id: FieldId.BestBid,
                name: 'BestBid',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.SecurityFieldDisplay_BestBid,
                headingId: StringId.SecurityFieldHeading_BestBid,
            },
            BidCount: {
                id: FieldId.BidCount,
                name: 'BidCount',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.SecurityFieldDisplay_BidCount,
                headingId: StringId.SecurityFieldHeading_BidCount,
            },
            BidQuantity: {
                id: FieldId.BidQuantity,
                name: 'BidQuantity',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.SecurityFieldDisplay_BidQuantity,
                headingId: StringId.SecurityFieldHeading_BidQuantity,
            },
            BidUndisclosed: {
                id: FieldId.BidUndisclosed,
                name: 'BidUndisclosed',
                dataTypeId: FieldDataTypeId.Boolean,
                displayId: StringId.SecurityFieldDisplay_BidUndisclosed,
                headingId: StringId.SecurityFieldHeading_BidUndisclosed,
            },
            NumberOfTrades: {
                id: FieldId.NumberOfTrades,
                name: 'NumberOfTrades',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.SecurityFieldDisplay_NumberOfTrades,
                headingId: StringId.SecurityFieldHeading_NumberOfTrades,
            },
            Volume: {
                id: FieldId.Volume,
                name: 'Volume',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.SecurityFieldDisplay_Volume,
                headingId: StringId.SecurityFieldHeading_Volume,
            },
            AuctionPrice: {
                id: FieldId.AuctionPrice,
                name: 'AuctionPrice',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.SecurityFieldDisplay_AuctionPrice,
                headingId: StringId.SecurityFieldHeading_AuctionPrice,
            },
            AuctionQuantity: {
                id: FieldId.AuctionQuantity,
                name: 'AuctionQuantity',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.SecurityFieldDisplay_AuctionQuantity,
                headingId: StringId.SecurityFieldHeading_AuctionQuantity,
            },
            AuctionRemainder: {
                id: FieldId.AuctionRemainder,
                name: 'AuctionReminder',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.SecurityFieldDisplay_AuctionRemainder,
                headingId: StringId.SecurityFieldHeading_AuctionRemainder,
            },
            VWAP: {
                id: FieldId.VWAP,
                name: 'VWAP',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.SecurityFieldDisplay_VWAP,
                headingId: StringId.SecurityFieldHeading_VWAP,
            },
            ValueTraded: {
                id: FieldId.ValueTraded,
                name: 'ValueTraded',
                dataTypeId: FieldDataTypeId.Number,
                displayId: StringId.SecurityFieldDisplay_ValueTraded,
                headingId: StringId.SecurityFieldHeading_ValueTraded,
            },
            OpenInterest: {
                id: FieldId.OpenInterest,
                name: 'OpenInterest',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.SecurityFieldDisplay_OpenInterest,
                headingId: StringId.SecurityFieldHeading_OpenInterest,
            },
            ShareIssue: {
                id: FieldId.ShareIssue,
                name: 'ShareIssue',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.SecurityFieldDisplay_ShareIssue,
                headingId: StringId.SecurityFieldHeading_ShareIssue,
            },
            StatusNote: {
                id: FieldId.StatusNote,
                name: 'StatusNote',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.SecurityFieldDisplay_StatusNote,
                headingId: StringId.SecurityFieldHeading_StatusNote,
            },
        };

        export const idCount = Object.keys(infoObject).length;
        const infos = Object.values(infoObject);

        export function idToName(id: Id) {
            return infos[id].name;
        }

        export function idToFieldDataTypeId(id: Id) {
            return infos[id].dataTypeId;
        }

        export function idToDisplay(id: Id) {
            return infos[id].displayId;
        }

        export function idToHeadingId(id: Id) {
            return infos[id].headingId;
        }

        export function idToHeading(id: Id) {
            return Strings[idToHeadingId(id)];
        }

        export function initialiseStaticField() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('SecurityDataItem.FieldId', outOfOrderIdx, infos[outOfOrderIdx].toString());
            }
        }
    }

    export interface ValueChange {
        readonly fieldId: Field.Id;
        readonly recentChangeTypeId: RevRecordValueRecentChangeTypeId | undefined;
    }

    export function valueChangeArrayIncludesFieldId(changes: readonly ValueChange[], fieldId: FieldId) {
        const count = changes.length;
        for (let i = 0; i < count; i++) {
            if (changes[i].fieldId === fieldId) {
                return true;
            }
        }
        return false;
    }

    export function valueChangeArrayIncludesAnyOfFieldIds(changes: readonly ValueChange[], fieldIds: readonly FieldId[]) {
        const changeCount = changes.length;
        for (let i = 0; i < changeCount; i++) {
            const changeFieldId = changes[i].fieldId;
            if (fieldIds.includes(changeFieldId)) {
                return true;
            }
        }
        return false;
    }

    export function initialiseStatic() {
        Field.initialiseStaticField();
    }
}

export namespace SecurityDataItemModule {
    export function initialiseStatic() {
        SecurityDataItem.initialiseStatic();
    }
}
