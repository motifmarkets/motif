/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import Decimal from 'decimal.js-light';
import { dateToUtcYYYYMMDD, Integer, MapKey, newUndefinableDate, newUndefinableDecimal } from 'src/sys/internal-api';
import {
    BrokerageAccountId,
    ChartIntervalId,
    DataChannel,
    DataChannelId,
    ExchangeEnvironmentId,
    ExchangeId,
    ExchangeInfo,
    FeedClass,
    FeedClassId,
    FeedId,
    FeedInfo,
    IvemClass,
    IvemClassId,
    MarketId,
    MarketInfo,
    OrderId,
    OrderRequestFlagId, SymbolFieldId
} from './data-types';
import { IvemId } from './ivem-id';
import { LitIvemId } from './lit-ivem-id';
import { OrderDetails } from './order-details';
import { OrderRoute } from './order-route';
import { OrderTrigger } from './order-trigger';
import { PublisherSubscription } from './publisher-subscription';
import { PublisherSubscriptionDelayRetryAlgorithmId } from './publisher-subscription-delay-retry-algorithm';

export abstract class DataDefinition {
    private static _lastConstructedId = 0;

    private _id: Integer;
    private _referencableKey: MapKey;

    abstract get referencable(): boolean;
    get channelId() { return this._channelId; }
    get description(): string { return this.getDescription(); }

    constructor(private _channelId: DataChannelId) {
        this._id = ++DataDefinition._lastConstructedId;
    }

    get referencableKey() {
        if (this._referencableKey === undefined) {
            this._referencableKey = DataChannel.idToMapKey(this.channelId) + '|' + this.calculateChannelReferencableKey();
        }
        return this._referencableKey;
    }

    /** Create key specific to a channel which can be referenced.
     * By default, creates key unique across all channels but this normally cannot be referenced
     */
    protected calculateChannelReferencableKey() {
        return this._id.toString(10);
    }

    protected getDescription(): string {
        return 'Channel: ' + DataChannel.idToName(this._channelId);
    }
}

export abstract class PublisherSubscriptionDataDefinition extends DataDefinition {
    delayRetryAlgorithmId = PublisherSubscriptionDelayRetryAlgorithmId.Default;
    subscribabilityIncreaseRetryAllowed = true;
    publisherRequestSendPriorityId = PublisherSubscription.RequestSendPriorityId.Normal;

    protected assign(other: PublisherSubscriptionDataDefinition) {
        this.delayRetryAlgorithmId = other.delayRetryAlgorithmId;
        this.subscribabilityIncreaseRetryAllowed = this.subscribabilityIncreaseRetryAllowed;
        this.publisherRequestSendPriorityId = this.publisherRequestSendPriorityId;
    }
}

export abstract class MarketSubscriptionDataDefinition extends PublisherSubscriptionDataDefinition {
}

export abstract class FeedSubscriptionDataDefinition extends PublisherSubscriptionDataDefinition {
}

export abstract class BrokerageAccountSubscriptionDataDefinition extends PublisherSubscriptionDataDefinition {
    accountId: BrokerageAccountId;
    environmentId: ExchangeEnvironmentId;
}

export abstract class BrokerageAccountDataRecordsSubscriptionDataDefinition extends BrokerageAccountSubscriptionDataDefinition {
}

export class FeedsDataDefinition extends PublisherSubscriptionDataDefinition {
    override publisherRequestSendPriorityId = PublisherSubscription.RequestSendPriorityId.High;

    get referencable() { return true; }

    constructor() {
        super(DataChannelId.Feeds);
    }

    protected override calculateChannelReferencableKey() {
        return ''; // only is one (for now)
    }
}

export class ClassFeedsDataDefinition extends DataDefinition {
    classId: FeedClassId;

    get referencable() { return true; }

    constructor() {
        super(DataChannelId.ClassFeeds);
    }

    protected override calculateChannelReferencableKey() {
        return FeedClass.idToName(this.classId);
    }
}

export class TradingStatesDataDefinition extends MarketSubscriptionDataDefinition {
    override publisherRequestSendPriorityId = PublisherSubscription.RequestSendPriorityId.High;

    marketId: MarketId;

    get referencable() { return false; }

    constructor() {
        super(DataChannelId.TradingStates);
    }

    protected override getDescription(): string {
        return super.getDescription() + ' Query: Market: ' + MarketInfo.idToName(this.marketId);
    }
}

export class MarketsDataDefinition extends PublisherSubscriptionDataDefinition {
    override publisherRequestSendPriorityId = PublisherSubscription.RequestSendPriorityId.High;

    get referencable() { return true; }

    constructor() {
        super(DataChannelId.Markets);
    }

    protected override calculateChannelReferencableKey() {
        return ''; // only is one (for now)
    }
}

export class QueryMarketsDataDefinition extends PublisherSubscriptionDataDefinition {
    get referencable() { return false; }

    constructor() {
        super(DataChannelId.Markets);
    }

    protected override getDescription(): string {
        return super.getDescription() + ' Query';
    }
}

export class SymbolsDataDefinition extends MarketSubscriptionDataDefinition {
    marketId: MarketId;
    classId: IvemClassId;

    get referencable() { return true; }

    constructor() {
        super(DataChannelId.Symbols);
    }

    protected override calculateChannelReferencableKey() {
        return MarketInfo.idToName(this.marketId) + '|' + IvemClass.idToName(this.classId);
    }
}

export class SearchSymbolsDataDefinition extends MarketSubscriptionDataDefinition {
    cfi?: string;
    combinationLeg?: string;
    conditions?: SearchSymbolsDataDefinition.Condition[];
    count?: Integer;
    exchangeId?: ExchangeId;
    expiryDateMin?: Date;
    expiryDateMax?: Date;
    index?: boolean;
    ivemClassId?: IvemClassId;
    fullSymbol: boolean;
    marketIds?: readonly MarketId[];
    preferExact?: boolean;
    startIndex?: Integer;
    strikePriceMin?: Decimal;
    strikePriceMax?: Decimal;

    get referencable() { return false; }

    constructor() {
        super(DataChannelId.Symbols);
    }

    createCopy() {
        const result = new SearchSymbolsDataDefinition();
        result.assign(this);
        return result;
    }

    protected override assign(other: SearchSymbolsDataDefinition) {
        super.assign(other);

        this.cfi = other.cfi;
        this.combinationLeg = other.combinationLeg;
        this.conditions = SearchSymbolsDataDefinition.copyConditions(other.conditions);
        this.count = other.count;
        this.exchangeId = other.exchangeId;
        this.expiryDateMin = newUndefinableDate(other.expiryDateMin);
        this.expiryDateMax = newUndefinableDate(other.expiryDateMax);
        this.index = other.index;
        this.ivemClassId = other.ivemClassId;
        this.fullSymbol = other.fullSymbol;
        this.marketIds = other.marketIds === undefined ? undefined : other.marketIds.slice();
        this.preferExact = other.preferExact;
        this.startIndex = other.startIndex;
        this.strikePriceMin = newUndefinableDecimal(other.strikePriceMin);
        this.strikePriceMax = newUndefinableDecimal(other.strikePriceMax);
    }
}

export namespace SearchSymbolsDataDefinition {
    export const enum AttributeId {

    }

    export interface Condition {
        fieldIds?: readonly SymbolFieldId[];
        attributeIds?: readonly SearchSymbolsDataDefinition.AttributeId[];
        group?: string;
        isCaseSensitive?: boolean;
        matchIds?: Condition.MatchId[];
        text: string;
    }

    export namespace Condition {
        export const enum MatchId {
            fromStart,
            fromEnd,
            exact,
        }

        export function createCopy(condition: Condition) {
            const copiedCondition: Condition = {
                fieldIds: condition.fieldIds === undefined ? undefined : condition.fieldIds.slice(),
                attributeIds: condition.attributeIds === undefined ? undefined : condition.attributeIds.slice(),
                group: condition.group,
                isCaseSensitive: condition.isCaseSensitive,
                matchIds: condition.matchIds === undefined ? undefined : condition.matchIds.slice(),
                text: condition.text,
            };
            return copiedCondition;
        }
    }

    export function copyConditions(conditions: Condition[] | undefined) {
        if (conditions === undefined) {
            return undefined;
        } else {
            const count = conditions.length;
            const result = new Array<Condition>(count);
            for (let i = 0; i < count; i++) {
                const condition = conditions[i];
                result[i] = Condition.createCopy(condition);
            }
            return result;
        }
    }
}

// export class QuerySymbolsDataDefinition extends MarketSubscriptionDataDefinition {
//     // Required:
//     searchText: string;

//     // Optional:
//     exchangeId: ExchangeId | undefined;
//     marketIds: readonly MarketId[] | undefined;
//     fieldIds: readonly SearchSymbolsDataDefinition.FieldId[];
//     isPartial: boolean | undefined;
//     isCaseSensitive: boolean | undefined;
//     preferExact: boolean | undefined;
//     startIndex: Integer | undefined;
//     count: Integer | undefined;
//     targetDate: Date | undefined;
//     showFull: boolean | undefined;
//     accountId: string | undefined;
//     cfi: string | undefined;
//     // TODO add support for underlyingIvemId
//     underlyingIvemId: IvemId | undefined;

//     get referencable() { return false; }

//     constructor() {
//         super(DataChannelId.Symbols);
//     }
// }

// export namespace QuerySymbolsDataDefinition {
//     export const enum FieldId {
//         Code,
//         Name,
//         Short,
//         Long,
//         Ticker,
//         Gics,
//         Isin,
//         Base,
//         Ric,
//     }

//     export const defaultFieldIds = [FieldId.Code];

//     export namespace Field {
//         export type Id = FieldId;

//         interface Info {
//             id: Id;
//             jsonValue: string;
//             displayId: StringId;
//             descriptionId: StringId;
//         }

//         type InfoObject = { [id in keyof typeof FieldId]: Info };

//         const infoObject: InfoObject = {
//             Code: {
//                 id: FieldId.Code,
//                 jsonValue: 'Code',
//                 displayId: StringId.QuerySymbolsDataDefinitionFieldDisplay_Code,
//                 descriptionId: StringId.QuerySymbolsDataDefinitionFieldDescription_Code,
//             },
//             Name: {
//                 id: FieldId.Name,
//                 jsonValue: 'Name',
//                 displayId: StringId.QuerySymbolsDataDefinitionFieldDisplay_Name,
//                 descriptionId: StringId.QuerySymbolsDataDefinitionFieldDescription_Name,
//             },
//             Short: {
//                 id: FieldId.Short,
//                 jsonValue: 'Short',
//                 displayId: StringId.QuerySymbolsDataDefinitionFieldDisplay_Short,
//                 descriptionId: StringId.QuerySymbolsDataDefinitionFieldDescription_Short,
//             },
//             Long: {
//                 id: FieldId.Long,
//                 jsonValue: 'Long',
//                 displayId: StringId.QuerySymbolsDataDefinitionFieldDisplay_Long,
//                 descriptionId: StringId.QuerySymbolsDataDefinitionFieldDescription_Long,
//             },
//             Ticker: {
//                 id: FieldId.Ticker,
//                 jsonValue: 'Ticker',
//                 displayId: StringId.QuerySymbolsDataDefinitionFieldDisplay_Ticker,
//                 descriptionId: StringId.QuerySymbolsDataDefinitionFieldDescription_Ticker,
//             },
//             Gics: {
//                 id: FieldId.Gics,
//                 jsonValue: 'Gics',
//                 displayId: StringId.QuerySymbolsDataDefinitionFieldDisplay_Gics,
//                 descriptionId: StringId.QuerySymbolsDataDefinitionFieldDescription_Gics,
//             },
//             Isin: {
//                 id: FieldId.Isin,
//                 jsonValue: 'Isin',
//                 displayId: StringId.QuerySymbolsDataDefinitionFieldDisplay_Isin,
//                 descriptionId: StringId.QuerySymbolsDataDefinitionFieldDescription_Isin,
//             },
//             Base: {
//                 id: FieldId.Base,
//                 jsonValue: 'Base',
//                 displayId: StringId.QuerySymbolsDataDefinitionFieldDisplay_Base,
//                 descriptionId: StringId.QuerySymbolsDataDefinitionFieldDescription_Base,
//             },
//             Ric: {
//                 id: FieldId.Ric,
//                 jsonValue: 'Ric',
//                 displayId: StringId.QuerySymbolsDataDefinitionFieldDisplay_Ric,
//                 descriptionId: StringId.QuerySymbolsDataDefinitionFieldDescription_Ric,
//             },
//         } as const;

//         export const idCount = Object.keys(infoObject).length;
//         const infos = Object.values(infoObject);

//         export function idToDisplayId(id: Id) {
//             return infos[id].displayId;
//         }

//         export function idToJsonValue(id: Id) {
//             return infos[id].jsonValue;
//         }

//         export function tryJsonValueToId(jsonValue: string) {
//             for (let id = 0; id < idCount; id++) {
//                 if (infos[id].jsonValue === jsonValue) {
//                     return id;
//                 }
//             }
//             return undefined;
//         }

//         export function idToDisplay(id: Id) {
//             return Strings[idToDisplayId(id)];
//         }

//         export function idToDescriptionId(id: Id) {
//             return infos[id].descriptionId;
//         }

//         export function idToDescription(id: Id) {
//             return Strings[idToDescriptionId(id)];
//         }

//         export function idArrayToJsonValue(idArray: Id[]) {
//             const count = idArray.length;
//             const stringArray = new Array<string>(count);
//             for (let i = 0; i < count; i++) {
//                 const id = idArray[i];
//                 stringArray[i] = idToJsonValue(id);
//             }
//             return CommaText.fromStringArray(stringArray);
//         }

//         export function tryJsonValueToIdArray(value: string) {
//             const toStringArrayResult = CommaText.toStringArrayWithResult(value);
//             if (!toStringArrayResult.success) {
//                 return undefined;
//             } else {
//                 const stringArray = toStringArrayResult.array;
//                 const count = stringArray.length;
//                 const result = new Array<Id>(count);
//                 for (let i = 0; i < count; i++) {
//                     const jsonValue = stringArray[i];
//                     const id = tryJsonValueToId(jsonValue);
//                     if (id === undefined) {
//                         return undefined;
//                     } else {
//                         result[i] = id;
//                     }
//                 }

//                 return result;
//             }
//         }

//         export function initialise() {
//             const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
//             if (outOfOrderIdx >= 0) {
//                 throw new EnumInfoOutOfOrderError('QuerySymbolsDataDefinition.FieldId', outOfOrderIdx, idToDisplay(outOfOrderIdx));
//             }
//         }
//     }
// }

export class SecurityDataDefinition extends MarketSubscriptionDataDefinition {
    litIvemId: LitIvemId;

    get referencable() { return true; }

    constructor() {
        super(DataChannelId.Security);
    }

    protected override getDescription(): string {
        return super.getDescription();
    }

    protected override calculateChannelReferencableKey() {
        return this.litIvemId.name;
    }
}

export class QuerySecurityDataDefinition extends MarketSubscriptionDataDefinition {
    litIvemId: LitIvemId;

    get referencable() { return false; }

    constructor() {
        super(DataChannelId.Security);
    }

    protected override getDescription(): string {
        return super.getDescription();
    }
}

export class DepthDataDefinition extends MarketSubscriptionDataDefinition {
    litIvemId: LitIvemId;

    get referencable() { return true; }

    constructor() {
        super(DataChannelId.Depth);
    }

    protected override getDescription(): string {
        return super.getDescription() + ` LitIvemId: ${this.litIvemId.name}`;
    }

    protected override calculateChannelReferencableKey() {
        return this.litIvemId.mapKey;
    }
}

export class QueryDepthDataDefinition extends MarketSubscriptionDataDefinition {
    litIvemId: LitIvemId;

    get referencable() { return false; }

    constructor() {
        super(DataChannelId.Depth);
    }

    protected override getDescription(): string {
        return super.getDescription() + ` LitIvemId: ${this.litIvemId.name}`;
    }
}

export class DepthLevelsDataDefinition extends MarketSubscriptionDataDefinition {
    litIvemId: LitIvemId;

    get referencable() { return true; }

    constructor() {
        super(DataChannelId.DepthLevels);
    }

    protected override getDescription(): string {
        return super.getDescription() + ` Query: LitIvemId:  ${this.litIvemId.name}`;
    }

    protected override calculateChannelReferencableKey() {
        return this.litIvemId.mapKey;
    }
}

export class QueryDepthLevelsDataDefinition extends MarketSubscriptionDataDefinition {
    litIvemId: LitIvemId;

    get referencable() { return false; }

    constructor() {
        super(DataChannelId.DepthLevels);
    }

    protected override getDescription(): string {
        return super.getDescription() + ` LitIvemId: ${this.litIvemId.name}`;
    }
}

export class QueryTradesDataDefinition extends MarketSubscriptionDataDefinition {
    litIvemId: LitIvemId;
    count?: Integer;
    firstTradeId?: Integer;
    lastTradeId?: Integer;
    tradingDate?: Date; // #TestingRequired: I think this needs to be UTC time. But this should be checked.

    get referencable() { return false; }

    constructor() {
        super(DataChannelId.Trades);
    }

    protected override getDescription(): string {
        let result = `${super.getDescription()} Query: ${this.litIvemId.name}`;
        if (this.count !== undefined) {
            result += ` Count: ${this.count}`;
        }
        if (this.firstTradeId !== undefined) {
            result += ` FirstTradedId: ${this.firstTradeId}`;
        }
        if (this.lastTradeId !== undefined) {
            result += ` LastTradedId: ${this.lastTradeId}`;
        }
        if (this.tradingDate !== undefined) {
            result += ` TradingDate: ${dateToUtcYYYYMMDD(this.tradingDate)}`;
        }
        return result;
    }
}

export class TradesDataDefinition extends MarketSubscriptionDataDefinition {
    litIvemId: LitIvemId;

    get referencable() { return true; }

    constructor() {
        super(DataChannelId.Trades);
    }

    protected override getDescription(): string {
        return `${super.getDescription()} LitIvemId: ${this.litIvemId.name}`;
    }

    protected override calculateChannelReferencableKey() {
        return this.litIvemId.mapKey;
    }
}

export class LatestTradingDayTradesDataDefinition extends DataDefinition {
    litIvemId: LitIvemId;

    get referencable() { return true; }

    constructor() {
        super(DataChannelId.LatestTradingDayTrades);
    }

    protected override getDescription(): string {
        return super.getDescription() + ` LitIvemId: ${this.litIvemId.name}`;
    }

    protected override calculateChannelReferencableKey() {
        return this.litIvemId.mapKey;
    }
}

export class DayTradesDataDefinition extends DataDefinition {
    litIvemId: LitIvemId;

    private _date: Date | undefined;

    get referencable() { return true; }

    get date() { return this._date; }
    set date(value: Date |undefined) {
        if (value === undefined) {
            this._date = undefined;
        } else {
            value.setUTCHours(0, 0, 0, 0);
            this._date = value;
        }
    }

    constructor() {
        super(DataChannelId.DayTrades);
    }

    protected override getDescription(): string {
        const dateDescription = this._date === undefined ? '' : ' ' + dateToUtcYYYYMMDD(this._date);
        return super.getDescription() + ` LitIvemId: ${this.litIvemId.name} Date: ${dateDescription}`;
    }

    protected override calculateChannelReferencableKey() {
        const dateStr = this._date === undefined ? '' : dateToUtcYYYYMMDD(this._date);
        return dateStr + '|' + this.litIvemId.mapKey;
    }
}

export class LowLevelTopShareholdersDataDefinition extends PublisherSubscriptionDataDefinition {
    litIvemId: LitIvemId;
    tradingDate: Date | undefined;

    get referencable() { return true; }

    constructor() {
        super(DataChannelId.LowLevelTopShareholders);
    }

    protected override getDescription(): string {
        return super.getDescription();
    }

    protected override calculateChannelReferencableKey() {
        let key = this.litIvemId.name;
        if (this.tradingDate !== undefined) {
            key += '|' + this.tradingDate.toString();
        }
        return key;
    }
}

export class TopShareholdersDataDefinition extends DataDefinition {
    litIvemId: LitIvemId;
    tradingDate: Date | undefined;
    compareToTradingDate: Date | undefined;

    get referencable() { return true; }

    constructor() {
        super(DataChannelId.TopShareholders);
    }

    protected override getDescription(): string {
        return super.getDescription();
    }

    protected override calculateChannelReferencableKey() {
        let key = this.litIvemId.name;
        if (this.tradingDate !== undefined) {
            key += '|' + this.tradingDate.toString();
        }
        if (this.compareToTradingDate !== undefined) {
            key += '|' + this.compareToTradingDate.toString();
        }
        return key;
    }
}

export class BrokerageAccountsDataDefinition extends FeedSubscriptionDataDefinition {
    override publisherRequestSendPriorityId = PublisherSubscription.RequestSendPriorityId.High;

    get referencable() { return true; }

    constructor() {
        super(DataChannelId.BrokerageAccounts);
    }

    protected override getDescription(): string {
        return super.getDescription();
    }

    protected override calculateChannelReferencableKey() {
        return '';
    }
}

export class QueryBrokerageAccountsDataDefinition extends FeedSubscriptionDataDefinition {
    get referencable() { return false; }

    constructor() {
        super(DataChannelId.BrokerageAccounts);
    }

    protected override getDescription(): string {
        return super.getDescription() + ' Query';
    }
}

export abstract class OrdersBrokerageAccountSubscriptionDataDefinition extends BrokerageAccountDataRecordsSubscriptionDataDefinition {
}

export class BrokerageAccountOrdersDataDefinition extends OrdersBrokerageAccountSubscriptionDataDefinition {
    get referencable() { return true; }

    constructor() {
        super(DataChannelId.BrokerageAccountOrders);
    }

    protected override getDescription() {
        return `${super.getDescription()} AccountId: ${this.accountId}`;
    }

    protected override calculateChannelReferencableKey() {
        return this.accountId;
    }
}

export class QueryBrokerageAccountOrdersDataDefinition extends BrokerageAccountDataRecordsSubscriptionDataDefinition {
    orderId: OrderId | undefined = undefined;

    get referencable() { return false; }

    constructor() {
        super(DataChannelId.BrokerageAccountOrders);
    }

    protected override getDescription() {
        let result = `${super.getDescription()} Query: AccountId: ${this.accountId}`;
        if (this.orderId !== undefined) {
            result += ` OrderId: ${this.orderId}`;
        }
        return result;
    }
}

export class AllOrdersDataDefinition extends DataDefinition {
    get referencable() { return true; }

    constructor() {
        super(DataChannelId.AllOrders);
    }

    protected override calculateChannelReferencableKey() {
        return '';
    }
}

export abstract class HoldingsBrokerageAccountSubscriptionDataDefinition extends BrokerageAccountDataRecordsSubscriptionDataDefinition {
}

export class BrokerageAccountHoldingsDataDefinition extends HoldingsBrokerageAccountSubscriptionDataDefinition {
    get referencable() { return true; }

    constructor() {
        super(DataChannelId.BrokerageAccountHoldings);
    }

    protected override getDescription() {
        return `${super.getDescription()} AccountId: ${this.accountId}`;
    }

    protected override calculateChannelReferencableKey() {
        return this.accountId;
    }
}

export class QueryBrokerageAccountHoldingsDataDefinition extends HoldingsBrokerageAccountSubscriptionDataDefinition {
    ivemId: IvemId | undefined = undefined;

    get referencable() { return false; }

    constructor() {
        super(DataChannelId.BrokerageAccountHoldings);
    }

    protected override getDescription() {
        let result = `${super.getDescription()} Query: AccountId: ${this.accountId}`;
        if (this.ivemId !== undefined) {
            result += ` IvemId: ${this.ivemId.name}`;
        }
        return result;
    }
}

export class AllHoldingsDataDefinition extends DataDefinition {
    get referencable() { return true; }

    constructor() {
        super(DataChannelId.AllHoldings);
    }

    protected override calculateChannelReferencableKey() {
        return '';
    }
}

export abstract class BalancesBrokerageAccountSubscriptionDataDefinition extends BrokerageAccountDataRecordsSubscriptionDataDefinition {
}

export class BrokerageAccountBalancesDataDefinition extends BalancesBrokerageAccountSubscriptionDataDefinition {
    get referencable() { return true; }

    constructor() {
        super(DataChannelId.BrokerageAccountBalances);
    }

    protected override getDescription(): string {
        return `${super.getDescription()} AccountId: ${this.accountId}`;
    }

    protected override calculateChannelReferencableKey() {
        return this.accountId;
    }
}

export class QueryBrokerageAccountBalancesDataDefinition extends BalancesBrokerageAccountSubscriptionDataDefinition {
    get referencable() { return false; }

    constructor() {
        super(DataChannelId.BrokerageAccountBalances);
    }

    protected override getDescription() {
        return `${super.getDescription()} Query: AccountId: ${this.accountId}`;
    }
}

export class AllBalancesDataDefinition extends DataDefinition {
    get referencable() { return true; }

    constructor() {
        super(DataChannelId.AllBalances);
    }

    protected override calculateChannelReferencableKey() {
        return '';
    }
}

export abstract class TransactionsBrokerageAccountSubscriptionDataDefinition extends BrokerageAccountDataRecordsSubscriptionDataDefinition {
}

export class BrokerageAccountTransactionsDataDefinition extends TransactionsBrokerageAccountSubscriptionDataDefinition {
    get referencable() { return true; }

    constructor() {
        super(DataChannelId.BrokerageAccountTransactions);
    }

    protected override getDescription(): string {
        return `${super.getDescription()} AccountId: ${this.accountId}`;
    }

    protected override calculateChannelReferencableKey() {
        return this.accountId;
    }
}

export class QueryTransactionsDataDefinition extends TransactionsBrokerageAccountSubscriptionDataDefinition {
    override accountId: BrokerageAccountId;
    fromDate: Date | undefined;
    toDate: Date | undefined;
    count: Integer | undefined;
    tradingMarketId: MarketId | undefined;
    exchangeId: ExchangeId | undefined;
    code: string | undefined;
    orderId: OrderId | undefined;

    get referencable() { return false; }

    constructor() {
        super(DataChannelId.BrokerageAccountTransactions);
    }

    protected override getDescription() {
        let result = `${super.getDescription()} Query: AccountId: ${this.accountId}`;
        if (this.fromDate !== undefined) {
            result += ` FromDate: ${this.fromDate}`;
        }
        if (this.toDate !== undefined) {
            result += ` ToDate: ${this.toDate}`;
        }
        if (this.count !== undefined) {
            result += ` Count: ${this.count}`;
        }
        if (this.tradingMarketId !== undefined) {
            result += ` TradingMarket: ${MarketInfo.idToName(this.tradingMarketId)}`;
        }
        if (this.exchangeId !== undefined) {
            result += ` Exchange: ${ExchangeInfo.idToName(this.exchangeId)}`;
        }
        if (this.code !== undefined) {
            result += ` Code: ${this.code}`;
        }
        if (this.orderId !== undefined) {
            result += ` Order: ${this.orderId}`;
        }
        return result;
    }
}

export class AllTransactionsDataDefinition extends DataDefinition {
    get referencable() { return true; }

    constructor() {
        super(DataChannelId.AllTransactions);
    }

    protected override calculateChannelReferencableKey() {
        return '';
    }
}

export class OrderRequestsDataDefinition extends BrokerageAccountDataRecordsSubscriptionDataDefinition {
    // brokerageAccountGroup: BrokerageAccountGroup;

    get referencable() { return true; }

    constructor() {
        super(DataChannelId.OrderRequests);
    }

    // protected getDescription(): string {
    //     return `${super.getDescription()} GroupId: ${this.brokerageAccountGroup.id}`;
    // }

    // protected calculateChannelReferencableKey() {
    //     return this.brokerageAccountGroup.id;
    // }
}

export class QueryOrderRequestsDataDefinition extends BrokerageAccountDataRecordsSubscriptionDataDefinition {
    override accountId: BrokerageAccountId;
    orderId: OrderId | undefined;

    get referencable() { return false; }

    constructor() {
        super(DataChannelId.OrderRequests);
    }

    protected override getDescription() {
        let result = `${super.getDescription()} Query: AccountId: ${this.accountId}`;
        if (this.orderId !== undefined) {
            result += ` Order: ${this.orderId}`;
        }
        return result;
    }
}

export class OrderAuditDataDefinition extends BrokerageAccountDataRecordsSubscriptionDataDefinition {
    // brokerageAccountGroup: BrokerageAccountGroup;

    get referencable() { return true; }

    constructor() {
        super(DataChannelId.OrderAudit);
    }

    // protected getDescription(): string {
    //     return `${super.getDescription()} GroupId: ${this.brokerageAccountGroup.id}`;
    // }

    // protected calculateChannelReferencableKey() {
    //     return this.brokerageAccountGroup.id;
    // }
}

export class QueryOrderAuditDataDefinition extends BrokerageAccountDataRecordsSubscriptionDataDefinition {
    override accountId: BrokerageAccountId;
    fromDate: Date | undefined;
    toDate: Date | undefined;
    count: Integer | undefined;
    orderId: OrderId | undefined;

    get referencable() { return false; }

    constructor() {
        super(DataChannelId.OrderAudit);
    }

    protected override getDescription() {
        let result = `${super.getDescription()} Query: AccountId: ${this.accountId}`;
        if (this.fromDate !== undefined) {
            result += ` FromDate: ${this.fromDate}`;
        }
        if (this.toDate !== undefined) {
            result += ` ToDate: ${this.toDate}`;
        }
        if (this.count !== undefined) {
            result += ` Count: ${this.count}`;
        }
        if (this.orderId !== undefined) {
            result += ` Order: ${this.orderId}`;
        }
        return result;
    }
}

export class OrderStatusesDataDefinition extends FeedSubscriptionDataDefinition {
    override publisherRequestSendPriorityId = PublisherSubscription.RequestSendPriorityId.High;

    tradingFeedId: FeedId;

    get referencable() { return false; }

    constructor() {
        super(DataChannelId.OrderStatuses);
    }

    protected override getDescription(): string {
        return `${super.getDescription()} FeedId: ${FeedInfo.idToName(this.tradingFeedId)}`;
    }
}

export class QueryChartHistoryDataDefinition extends MarketSubscriptionDataDefinition {
    litIvemId: LitIvemId;
    intervalId: ChartIntervalId;
    count: Integer | undefined;
    fromDate: Date | undefined;
    toDate: Date | undefined;

    get referencable() { return false; }

    constructor() {
        super(DataChannelId.ChartHistory);
    }

    protected override getDescription(): string {
        return super.getDescription();
    }

    // not needed as not referencable
    protected override calculateChannelReferencableKey() {
        let key = this.litIvemId.name + '|' + this.intervalId.toString(10);
        if (this.fromDate !== undefined) {
            key += '|' + this.fromDate.toString();
        }
        if (this.toDate !== undefined) {
            key += '|' + this.toDate.toString();
        }
        return key;
    }
}

export abstract class OrderRequestDataDefinition extends BrokerageAccountDataRecordsSubscriptionDataDefinition {
    // Do not allow any retries
    override readonly delayRetryAlgorithmId = PublisherSubscriptionDelayRetryAlgorithmId.Never;
    override readonly subscribabilityIncreaseRetryAllowed = false;

    // Ensure sent as quickly as possible
    override readonly publisherRequestSendPriorityId = PublisherSubscription.RequestSendPriorityId.High;

    override accountId: BrokerageAccountId;
    flags: readonly OrderRequestFlagId[] | undefined;

    get referencable() { return false; }

    // can only reference via DataDefinition Id so do not need to re-implement calculateChannelReferencableKey()
}

export namespace OrderRequestDataDefinition {
    export function isPlace(definition: OrderRequestDataDefinition): definition is PlaceOrderRequestDataDefinition {
        return definition.channelId === DataChannelId.PlaceOrderRequest;
    }

    export function isAmend(definition: OrderRequestDataDefinition): definition is PlaceOrderRequestDataDefinition {
        return definition.channelId === DataChannelId.AmendOrderRequest;
    }

    export function isMove(definition: OrderRequestDataDefinition): definition is PlaceOrderRequestDataDefinition {
        return definition.channelId === DataChannelId.MoveOrderRequest;
    }

    export function isCancel(definition: OrderRequestDataDefinition): definition is PlaceOrderRequestDataDefinition {
        return definition.channelId === DataChannelId.CancelOrderRequest;
    }
}

export class PlaceOrderRequestDataDefinition extends OrderRequestDataDefinition {
    details: OrderDetails;
    route: OrderRoute;
    trigger: OrderTrigger;

    constructor() {
        super(DataChannelId.PlaceOrderRequest);
    }
}

export class AmendOrderRequestDataDefinition extends OrderRequestDataDefinition {
    details: OrderDetails;
    orderId: OrderId;
    route: OrderRoute | undefined;
    trigger: OrderTrigger | undefined;

    constructor() {
        super(DataChannelId.AmendOrderRequest);
    }
}

export class CancelOrderRequestDataDefinition extends OrderRequestDataDefinition {
    orderId: OrderId;

    constructor() {
        super(DataChannelId.CancelOrderRequest);
    }
}


export class MoveOrderRequestDataDefinition extends OrderRequestDataDefinition {
    orderId: OrderId;
    destination: BrokerageAccountId;

    constructor() {
        super(DataChannelId.MoveOrderRequest);
    }
}

export class ZenithExtConnectionDataDefinition extends DataDefinition {
    initialAuthAccessToken: string;
    zenithWebsocketEndpoint: string; // 'wss://wsapistaging.paritech.com:443/Zenith?version=1.6.1';
    useAuthOwnerZenithAuthentication = false;

    get referencable() { return true; }

    constructor() {
        super(DataChannelId.ZenithExtConnection);
    }

    protected override calculateChannelReferencableKey() {
        return this.zenithWebsocketEndpoint;
    }
}

export class ZenithServerInfoDataDefinition extends PublisherSubscriptionDataDefinition {
    get referencable() { return true; }

    constructor() {
        super(DataChannelId.ZenithServerInfo);
    }

    protected override getDescription(): string {
        return super.getDescription();
    }

    protected override calculateChannelReferencableKey() {
        return '';
    }
}
