/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

/* eslint-disable @typescript-eslint/no-shadow */
// Version 3

import { Integer } from 'src/sys/internal-api';

export namespace Zenith {

    type CommaString = string;

    // Zenith dates are provided as either ISO-8601 or `YYYY-MM-DD` formmated strings.
    export type DateYYYYMMDD = string;
    export type DateTimeIso8601 = string;
    export type DateOptionalTimeIso8601 = string;

    export type Time = string;
    export const timeDayTerminatorChar = '.';
    export const TimeHoursMinutesSecondsSeparatorChar = ':';
    export const timeFractionalSecondsIntroducerChar = '.';

    // Decimals are provided as number
    export type Decimal = number;

    // Physical-messages are the messages sent to and from external service. (Zenith physical-messages
    // are strings and sent over a websocket.)
    export type PhysicalMessage = string;

    export interface MessageContainer {
        Controller: MessageContainer.Controller;
        Topic: string;
        TransactionID?: Integer;
        Action: MessageContainer.Action;
        // eslint-disable-next-line @typescript-eslint/ban-types
        Data?: object | string | string[];
        Confirm?: boolean;
    }

    export namespace MessageContainer {
        export const enum Controller {
            Zenith = 'Zenith',
            Auth = 'Auth',
            Fragments = 'Fragments',
            Market = 'Market',
            News = 'News',
            Trading = 'Trading',
            Watchlist = 'Watchlist',
        }

        export const enum Action {
            Sub = 'Sub',
            Unsub = 'Unsub',
            Error = 'Error',
            Publish = 'Publish',
            Cancel = 'Cancel',
        }
    }

    export type RequestMessageContainer = MessageContainer;

    export type SubUnsubMessageContainer = RequestMessageContainer;

    export interface ResponseUpdateMessageContainer extends MessageContainer {
        Data: ResponseUpdateMessageContainer.Data;
    }

    export namespace ResponseUpdateMessageContainer {
        // eslint-disable-next-line @typescript-eslint/ban-types
        export type Payload = object;

        // Note that Error type = undefined specifies 'NotAuthorised' Error.  This may be converted to an error code in the future
        export type Error = string | string[] | undefined;

        export namespace Error {
            export const enum Code {
                Retry = 'Retry',
                Limited = 'Limited',
            }
        }

        export type Data = Payload | Error;
    }

    export const topicArgumentsAnnouncer = '!';
    export const topicArgumentsSeparator = '.';
    export const marketDelimiter = ':';
    export const exchangeEnvironmentOpenChar = '[';
    export const exchangeEnvironmentCloseChar = ']';
    export const commaTextSeparator = ',';

    export const enum SubscriptionData {
        Asset = 'Asset',
        Trades = 'Trades',
        Depth = 'Depth',
        DepthFull = 'DepthFull',
        DepthShort = 'DepthShort',
        All = 'All',
    }

    export const enum FeedStatus {
        Initialising = 'Initialising',
        Active = 'Active', // Feed is online and updating
        Closed = 'Closed', // Feed is outside hours and updating
        Inactive = 'Inactive', // Feed is outside hours and read-only
        Impaired = 'Impaired', // Feed is offline when it shouldn't be
        Expired = 'Expired', // New market state loading
    }

    export const enum ExchangeEnvironment {
        Production = '',
        Delayed = 'Delayed',
        Demo = 'Demo',
    }

    export const enum Exchange {
        Asx = 'ASX',
        Cxa = 'CXA',
        Nsx = 'NSX',
        Nzx = 'NZX',
        Myx = 'MYX',
        Calastone = 'Calastone',
        Ptx = 'PTX',
        Fnsx = 'FNSX',
        AsxCxa = 'ASX+CXA',
    }

    // used in Change objects
    export const enum AurcChangeType {
        Add = 'A',
        Update = 'U',
        Remove = 'R',
        Clear = 'C',
    }

    export const enum AuiChangeType {
        Add = 'A', // A: Add new
        Update = 'U', // A: Update
        Initialise = 'I', // Initialise list
    }

    // some other enumerations are aliases of this
    export const enum SecurityClass {
        Unknown = 'Unknown',
        Market = 'Market',
        ManagedFund = 'ManagedFund',
    }

    export namespace ControllersCommon {
        export const enum TopicName {
            Configure = 'Configure',
            QueryConfigure = 'QueryConfigure',
        }

        export namespace QueryConfigure {
            export type PublishRequestMessageContainer = RequestMessageContainer;

            export interface PayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: Payload;
            }

            export interface Payload {
                ActionTimeout?: Time;
                SubscriptionTimeout?: Time;
            }

            export const defaultActionTimeout = 35000; // milliseconds
            export const defaultSubscriptionTimeout = 35000; // milliseconds
        }
    }

    export namespace AuthController {
        export const enum TopicName {
            Identify = 'Identify',
            AuthToken = 'AuthToken',
            AuthOwner = 'AuthOwner',
        }

        export const enum Provider {
            BasicAuth = 'BasicAuth',
            Bearer = 'Bearer',
        }

        export const enum IdentifyResult {
            Success = 'Success',
            Rejected = 'Rejected',
        }

        export interface Identify {
            Result: IdentifyResult;
            AccessToken?: string;
            DisplayName?: string;
            UserID?: string;
            ExpiryDate?: string;
            ExpiresIn?: string;
            Scope?: string[];
        }

        export namespace AuthToken {
            export interface QueryRequest {
                Provider: string;
                AccessToken: string;
            }

            export interface PublishMessageContainer extends RequestMessageContainer {
                Data: QueryRequest;
            }

            export type PublishPayload = Identify;
            export interface PublishPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: PublishPayload;
            }
        }

        export namespace AuthOwner {
            export interface QueryRequest {
                Provider: string;
                ClientID: string;
                ClientSecret?: string;
                Username?: string;
                Password?: string;
                Scope?: string[];
            }

            export interface PublishMessageContainer extends RequestMessageContainer {
                Data: QueryRequest;
            }

            export type PublishPayload = Identify;
            export interface PublishPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: PublishPayload;
            }
        }
    }

    export namespace ZenithController {
        export const enum TopicName {
            Feeds = 'Feeds',
            ServerInfo = 'ServerInfo',
        }

        export namespace ServerInfo {
            export type SubPayload = Payload;
            export interface SubPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: SubPayload;
            }

            export interface Payload {
                Name: string;
                Class: string;
                Version: string;
                Protocol: string;
            }
        }

        export namespace Feeds {
            export const enum FeedClass {
                Authority = 'Authority',
                Market = 'Market',
                News = 'News',
                Trading = 'Trading',
            }

            export const enum AuthorityFeed {
                TradingAuthority = 'TradingAuthority',
                Watchlist = 'Watchlist',
            }

            export const enum TradingFeed {
                Motif = 'Motif',
                Malacca = 'Malacca',
            }

            export const enum NewsFeed {
                Asx = 'ASX',
                Nsx = 'NSX',
                Nzx = 'NZX',
                Myx = 'MYX',
                Ptx = 'PTX',
                Fnsx = 'FNSX',
            }

            export type Payload = Feed[];

            export interface PayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: Payload;
            }

            export interface Feed {
                Name: string;
                Class: FeedClass;
                Status: FeedStatus;
            }
        }
    }

    export namespace FragmentsController {
        export const enum TopicName {
            QueryCustomFragments = 'QueryCustomFragments',
            QueryFragments = 'QueryFragments',
        }

        export interface Fragment {
            Name: string;
            Source?: string;
        }

        export interface FragmentData {
            // eslint-disable-next-line @typescript-eslint/ban-types
            [name: string]: object;
        }

        export namespace QueryCustomFragments {
            export interface QueryRequest {
                Source: string;
                Target: unknown;
                Fragments: Fragment[];
                TradingDate?: DateTimeIso8601;
            }

            export interface PublishMessageContainer extends RequestMessageContainer {
                Data: QueryRequest;
            }

            export type QueryPayload = FragmentData;

            export interface QueryPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: QueryPayload;
            }
        }

        export namespace QueryFragments {
            export interface QueryRequest {
                Market: string;
                Code: string;
                Fragments: Fragment[];
                TradingDate?: DateTimeIso8601;
            }

            export interface PublishMessageContainer extends RequestMessageContainer {
                Data: QueryRequest;
            }

            export type QueryPayload = FragmentData;

            export interface QueryPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: QueryPayload;
            }

            export namespace Fundamentals_TopShareholders {
                export const fragmentName = 'Fundamentals.TopShareholders';

                export interface Fragment extends FragmentsController.Fragment {
                    Name: 'Fundamentals.TopShareholders';
                }

                export interface QueryRequest extends QueryFragments.QueryRequest {
                    Market: string;
                    Code: string;
                    Fragments: Fragment[];
                    TradingDate?: DateTimeIso8601;
                }

                export interface PublishMessageContainer extends QueryFragments.PublishMessageContainer {
                    Data: QueryRequest;
                }

                export interface TopShareholder {
                    Name?: string;
                    Designation?: string;
                    HolderKey?: string;
                    SharesHeld?: number;
                    TotalShreIssue?: number;
                }

                export interface FragmentData extends FragmentsController.FragmentData {
                    'Fundamentals.TopShareholders': TopShareholder[];
                }

                export type QueryPayload = FragmentData;

                export interface QueryPayloadMessageContainer extends QueryFragments.QueryPayloadMessageContainer {
                    Data: QueryPayload;
                }
            }
        }
    }

    export namespace MarketController {
        export const enum TopicName {
            QueryTradingStates = 'QueryTradingStates',
            Markets = 'Markets',
            QueryMarkets = 'QueryMarkets',
            // QuerySymbols = 'QuerySymbols',
            SearchSymbols = 'SearchSymbols',
            Symbols = 'Symbols',
            Security = 'Security',
            QuerySecurity = 'QuerySecurity',
            Trades = 'Trades',
            QueryTrades = 'QueryTrades',
            Depth = 'Depth',
            QueryDepthFull = 'QueryDepthFull',
            Levels = 'Levels',
            QueryDepthLevels = 'QueryDepthLevels',
            QueryChartHistory = 'QueryChartHistory',
        }

        // SecurityClass is alias of Zenith.SecurityClass
        export type SecurityClass = Zenith.SecurityClass;
        export namespace SecurityClass {
            export const Unknown = Zenith.SecurityClass.Unknown;
            export const Market = Zenith.SecurityClass.Market;
            export const ManagedFund = Zenith.SecurityClass.ManagedFund;
        }

        export const enum Trend {
            None = 'None',
            Up = 'Up',
            Down = 'Down',
        }

        export namespace TradingStates {
            export interface QueryRequest {
                Market: string;
            }

            export interface PublishMessageContainer extends RequestMessageContainer {
                Data: QueryRequest;
            }

            export type PublishPayload = TradeState[];
            export interface PublishPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: PublishPayload;
            }

            export const enum Allow {
                None = 'None',
                OrderPlace = 'OrderPlace',
                OrderAmend = 'OrderAmend',
                OrderCancel = 'OrderCancel',
                OrderMove = 'OrderMove',
                Match = 'Match',
                ReportCancel = 'ReportCancel',
                OrdersOnly = 'OrdersOnly',
                All = 'All',
            }

            export const enum Reason {
                Unknown = 'Unknown',
                Normal = 'Normal',
                Suspend = 'Suspend',
                TradingHalt = 'TradingHalt',
                NewsRelease = 'NewsRelease',
            }

            export interface TradeState {
                Name: string;
                Reason: Reason;
                Allows: CommaString;
            }
        }

        export namespace Markets {
            export type PublishSubUnsubMessageContainer = RequestMessageContainer;

            export type Payload = MarketState[];

            export interface PublishSubPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: Payload;
            }

            export interface MarketState {
                Code: string;
                Feed: FeedStatus;
                TradingDate?: DateYYYYMMDD;
                MarketTime?: DateTimeIso8601;
                Status?: string;
                States?: TradingMarketState[];
            }

            export interface TradingMarketState {
                Name: string;
                Status: string;
            }
        }

/*      // Use SearchSymbols instead.  This has been kept in case subscriptions are wanted in future
        export namespace Symbols {
            export const enum SearchField {
                Code = 'Code',
                Name = 'Name',
            }

            export const enum ExerciseType {
                American = 'American',
                European = 'European',
                Unknown = 'Unknown',
            }

            export const enum AlternateKey {
                Ticker = 'Ticker',
                Gics = 'GICS',
                Isin = 'ISIN',
                Ric = 'RIC',
                Base = 'Base',
            }

            export const fieldSeparator = '+';

            export interface QueryRequest {
                Exchange?: string;
                Market?: string;
                Markets?: string[];
                SearchText: string;
                Field?: string;
                IsPartial?: boolean;
                IsCaseSensitive?: boolean;
                PreferExact?: boolean;
                StartIndex?: Integer;
                Count?: Integer;
                TargetDate?: DateTimeIso8601;
                ShowFull?: boolean;
                Account?: string;
                CFI?: string;
            }

            export interface PublishMessageContainer extends RequestMessageContainer {
                Data: QueryRequest;
            }

            export type PublishPayload = Detail[];
            export interface PublishPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: PublishPayload;
            }

            export type SubPayload = Change[];
            export interface SubPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: SubPayload;
            }

            export interface Change {
                O: AurcChangeType;
                Symbol?: Detail;
            }

            export const enum DepthDirection {
                BidBelowAsk = 'BidBelowAsk',
                AskBelowBid = 'AskBelowBid',
            }

            export interface Detail {
                Market: string;
                Code: string;
                Name?: string;
                Class: SecurityClass;
                Exchange?: string;
                SubscriptionData: CommaString;
                TradingMarkets: string[];
            }

            export interface FullDetail extends Detail {
                CFI: string;
                DepthDirection?: DepthDirection;
                IsIndex?: boolean;
                ExpiryDate?: DateYYYYMMDD;
                StrikePrice?: Decimal;
                ExerciseType?: ExerciseType;
                CallOrPut?: CallOrPut;
                ContractSize?: Integer;
                Alternates?: Detail.Alternates;
                Attributes?: Detail.Attributes;
                Legs?: Detail.Leg[] | null;
                Categories?: string[];
            }

            export namespace Detail {
                export interface Alternates {
                    Ticker?: string;
                    GICS?: string;
                    ISIN?: string;
                    RIC?: string;
                    Base?: string;
                }

                export interface Attributes {
                    [index: string]: string | undefined;
                }

                export interface Leg {
                    Code: string;
                    Side: Side;
                    Ratio: Decimal;
                }
            }
        }*/

        export namespace SearchSymbols {
            export interface Condition {
                Field?: Condition.Field; // Should be string but we only use undefined or one Field
                Group?: string;
                IsCaseSensitive?: boolean;
                Key?: AlternateKey;
                Match?: string;
                Text: string;
            }

            export namespace Condition {
                export const enum Field {
                    Code = 'Code',
                    Name = 'Name',
                    Alternate = 'Alternate',
                    Attribute = 'Attribute',
                }

                export const fieldSeparator = ',';

                export const enum Match {
                    FromStart = 'FromStart',
                    FromEnd = 'FromEnd',
                    Exact = 'Exact',
                }
            }

            export interface Request {
                CFI?: string;
                Class?: Request.Class;
                CombinationLeg?: string;
                Conditions?: Condition[];
                Count?: Integer;
                Exchange?: string;
                ExpiryDateMin?: DateTimeIso8601,
                ExpiryDateMax?: DateTimeIso8601,
                FullSymbol?: boolean;
                Index?: boolean;
                Market?: string;
                Markets?: string[];
                PreferExact?: boolean;
                StartIndex?: Integer;
                StrikePriceMin?: Decimal,
                StrikePriceMax?: Decimal,
            }

            export namespace Request {
                // Like Zenith.SecurityClass but without Unknown
                export const enum Class {
                    Market = 'Market',
                    ManagedFund = 'ManagedFund',
                }
            }

            export interface PublishMessageContainer extends RequestMessageContainer {
                Data: Request;
            }

            export type ResponsePayload = Detail[];
            export interface PublishPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: ResponsePayload;
            }

            export const enum DepthDirection {
                BidBelowAsk = 'BidBelowAsk',
                AskBelowBid = 'AskBelowBid',
            }

            export interface Detail {
                Market: string;
                Code: string;
                Name?: string;
                Class: SecurityClass;
                Exchange?: string;
                SubscriptionData: CommaString;
                TradingMarkets: string[];
            }

            export namespace Detail {
            }

            export interface FullDetail extends Detail {
                CFI: string;
                DepthDirection?: DepthDirection;
                IsIndex?: boolean;
                ExpiryDate?: DateYYYYMMDD;
                StrikePrice?: Decimal;
                ExerciseType?: FullDetail.ExerciseType;
                CallOrPut?: CallOrPut;
                ContractSize?: Integer;
                LotSize?: Integer;
                Alternate?: Alternates; // Will be moved into Detail in the future
                Attributes?: Attributes;
                Legs?: FullDetail.Leg[] | null;
                Categories?: string[];
            }

            export namespace FullDetail {
                export const enum ExerciseType {
                    American = 'American',
                    Asian = 'Asian',
                    European = 'European',
                    Unknown = 'Unknown',
                }

                export interface Leg {
                    Code: string;
                    Side: Side;
                    Ratio: Decimal;
                }
            }

            export interface Alternates {
                Ticker?: string;
                ISIN?: string;
                Base?: string;
                GICS?: string;
                RIC?: string;
                Short?: string;
                Long?: string;
            }

            export const enum AlternateKey {
                Ticker = 'Ticker',
                Isin = 'ISIN',
                Base = 'Base',
                Gics = 'GICS',
                Ric = 'RIC',
                Short = 'Short',
                Long = 'Long',
            }

            export interface Attributes {
                [index: string]: string | undefined;
            }
        }

        export namespace Security {

            export interface QueryRequest {
                Market: string;
                Code: string;
            }

            export interface PublishMessageContainer extends RequestMessageContainer {
                Data: QueryRequest;
            }

            export interface PayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: Payload;
            }

            export interface Payload {
                Code?: string;
                Market?: string;
                Exchange?: string;
                Name?: string;
                Class?: SecurityClass;
                CFI?: string;
                TradingState?: string;
                TradingMarkets?: string[];
                IsIndex?: boolean;
                ExpiryDate?: DateYYYYMMDD;
                StrikePrice?: Decimal;
                CallOrPut?: CallOrPut;
                ContractSize?: Integer;
                SubscriptionData?: CommaString;
                QuotationBasis?: string | null;
                Open?: Decimal | null;
                High?: Decimal | null;
                Low?: Decimal | null;
                Close?: Decimal | null;
                Settlement?: Decimal | null;
                Last?: Decimal | null;
                Trend?: Trend;
                BestAsk?: Decimal | null;
                AskCount?: Integer;
                AskQuantity?: Integer;
                AskUndisclosed?: boolean;
                BestBid?: Decimal | null;
                BidCount?: Integer;
                BidQuantity?: Integer;
                BidUndisclosed?: boolean;
                NumberOfTrades?: Integer;
                Volume?: Integer;
                AuctionPrice?: Decimal | null;
                AuctionQuantity?: Integer | null;
                AuctionRemainder?: Integer | null;
                VWAP?: Decimal | null;
                ValueTraded?: number;
                OpenInterest?: Integer | null;
                ShareIssue?: Integer | null;
                StatusNote?: string | null;
            }
        }

        export namespace Depth {
            export interface QueryRequest {
                Market: string;
                Code: string;
            }

            export interface PublishMessageContainer extends RequestMessageContainer {
                Data: QueryRequest;
            }

            export type Payload = Change[];
            export interface PayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: Payload;
            }

            export interface Change {
                O: AurcChangeType;
                Order?: Change.Order;
            }

            export namespace Change {
                export interface Order {
                    ID: string;
                    Side?: Side;
                    Price?: Decimal;
                    Position?: Integer;
                    Broker?: string;
                    CrossRef?: string;
                    Quantity?: Integer | null;
                    HasUndisclosed?: boolean;
                    Market?: string;
                    Attributes?: string[];
                }
            }
        }

        export namespace DepthLevels {
            export interface QueryRequest {
                Market: string;
                Code: string;
            }

            export interface PublishMessageContainer extends RequestMessageContainer {
                Data: QueryRequest;
            }

            export type Payload = Change[];
            export interface PayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: Payload;
            }

            export interface Change {
                O: AurcChangeType;
                Level?: Change.Level;
            }

            export namespace Change {
                export interface Level {
                    ID: string;
                    Side?: Side;
                    Price?: number | null; // number is Decimal, null means remainder
                    Volume?: Integer;
                    Count?: Integer;
                    HasUndisclosed?: boolean;
                    Market?: string;
                }
            }
        }

        export namespace Trades {
            export const enum Flag {
                Cancel = 'Cancel',
                OffMarket = 'OffMarket',
                PlaceHolder = 'PlaceHolder',
            }

            export const enum Affects {
                None = 'None',
                Price = 'Price',
                Volume = 'Volume',
                Vwap = 'VWAP',
            }

            export interface QueryRequest {
                Market: string;
                Code: string;
                Count?: Integer;
                FirstTradeID?: Integer;
                LastTradeID?: Integer;
                TradingDate?: DateTimeIso8601;
            }

            export interface PublishMessageContainer extends RequestMessageContainer {
                Data: QueryRequest;
            }

            export type Payload = Change[];
            export interface PayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: Payload;
            }

            // `I` (initialise) change records will be sent when you initially subscribe or the the server feed restarts.
            export interface Change {
                O: AuiChangeType;
                ID?: Integer; // When Initialising, identifies the most recently received Trade, for use in trade queries.
                Trade?: Data;
            }

            /** ID's are ascending for intraday trades. ID's across days are not guaranteed to be ascending. */
            export interface Data {
                ID: Integer;
                Price?: Decimal;
                Quantity?: Integer;
                Time?: DateTimeIso8601;
                Flags?: CommaString;
                Trend?: Trend;
                Side?: Side;
                Affects?: CommaString;
                Codes?: string;
                Buy?: string;   // Depth Order ID. Use for identifying the order associated with this trade.
                BuyBroker?: string;
                BuyCrossRef?: string;
                Sell?: string;  // Depth Order ID. Use for identifying the order associated with this trade.
                SellBroker?: string;
                SellCrossRef?: string;
                Market?: string;
                RelatedID?: Integer;
                Attributes?: string[];
            }
        }

        export namespace ChartHistory {
            export const enum PeriodTimeSpan {
                OneMinute = '00:01:00',
                FiveMinutes = '00:05:00',
                FifteenMinutes = '00:15:00',
                ThirtyMinutes = '00:30:00',
                OneDay = '1.00:00:00',
            }

            export interface QueryRequest {
                Market: string;
                Code: string;
                Count?: Integer;
                Period?: PeriodTimeSpan;
                FromDate?: DateTimeIso8601;
                ToDate?: DateTimeIso8601;
            }

            export interface PublishMessageContainer extends RequestMessageContainer {
                Data: QueryRequest;
            }

            export type Payload = Record[];

            export interface PayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: Payload;
            }

            export interface Record {
                Date: DateOptionalTimeIso8601;
                Open?: Decimal;
                High?: Decimal;
                Low?: Decimal;
                Close?: Decimal;
                Volume?: Integer;
                Trades?: Integer;
            }
        }
    }

    export const enum CallOrPut {
        Call = 'Call',
        Put = 'Put',
    }

    export const enum EquityOrderType {
        Limit = 'Limit',
        Best = 'Best',
        Market = 'Market',
        MarketToLimit = 'MarketToLimit',
        Unknown = 'Unknown',
    }

    export const enum EquityOrderValidity {
        UntilCancel = 'UntilCancel',
        FillAndKill = 'FillAndKill',
        FillOrKill = 'FillOrKill',
        AllOrNone = 'AllOrNone',
    }

    export const enum OrderPriceUnitType {
        Currency = 'Currency',
        Units = 'Units',
    }

    export const enum Currency {
        Aud = 'AUD',
        Usd = 'USD',
        Myr = 'MYR',
    }

    export const enum OrderRouteAlgorithm {
        Market = 'Market',
        BestMarket = 'BestMarket',
        Fix = 'FIX',
    }

    export const enum Market1Node {
        AsxDefault = '',
        AsxBookBuild = 'BB',
        AsxTradeMatch = 'TM',
        AsxPureMatch = 'PM',
        AsxVolumeMatch = 'V',
        ChiXChiX = '',
        NsxNsx = '',
        SimVenture = 'SV',
        SouthPacific = 'SP',
        NzxMain = '',
        NzxFxDerivative = 'FX',
        MyxNormal = '',
        MyxBuyIn = 'BI',
        MyxOddLot = 'OD',
        PtxPtx = '',
        FnsxFnsx = '',
    }

    export const enum Market2Node {
        AsxCentrePoint = 'CP',
        AsxTradeMatchAgric = 'AGRIC',
        AsxTradeMatchAus = 'AUS',
        AsxTradeMatchDerivatives = 'D',
        AsxTradeMatchEquity1 = 'EQTY1',
        AsxTradeMatchEquity2 = 'EQTY2',
        AsxTradeMatchEquity3 = 'EQTY3',
        AsxTradeMatchEquity4 = 'EQTY4',
        AsxTradeMatchEquity5 = 'EQTY5',
        AsxTradeMatchIndex = 'INDEX',
        AsxTradeMatchIndexDerivatives = 'INDX',
        AsxTradeMatchInterestRate = 'IRM',
        AsxTradeMatchPrivate = 'PRV',
        AsxTradeMatchQuoteDisplayBoard = 'QDB',
        AsxTradeMatchPractice = 'PRAC',
        AsxTradeMatchWarrants = 'WAR',
        AsxTradeMatchAD = 'AD',
        AsxTradeMatchED = 'ED',
        AsxPureMatchEquity1 = 'E1',
        AsxPureMatchEquity2 = 'E2',
        AsxPureMatchEquity3 = 'E3',
        AsxPureMatchEquity4 = 'E4',
        AsxPureMatchEquity5 = 'E5',
        ChixAustFarPoint = 'FP',
        ChixAustLimit = 'LI',
        ChixAustMarketOnClose = 'MC',
        ChixAustMidPoint = 'MP',
        ChixAustNearPoint = 'NP',
        NsxCommunityBanks = 'COM',
        NsxIndustrial = 'CRP',
        NsxDebt = 'DBT',
        NsxMiningAndEnergy = 'MIN',
        NsxCertifiedProperty = 'PROP',
        NsxProperty = 'PRP',
        NsxRestricted = 'RST',
        SouthPacificStockExchangeEquities = 'EQY',
        SouthPacificStockExchangeRestricted = 'RST',
        NzxMainBoard_Alt = 'SX',
        NzxNXT = 'NXT',
        NzxSpec = 'SPEC',
        NzxFonterraShareholders = 'FSM',
        NzxIndex = 'I',
        NzxDebt = 'DX',
        NzxAlternate = 'AX',
        NzxDerivativeFutures = 'DF',
        NzxDerivativeOptions = 'DO',
        NzxIndexFutures = 'IF',
        NzxFxDerivativeOptions = 'DO',
        NzxFxDerivativeFutures = 'DF',
        NzxFxEquityOptions = 'EO',
        NzxFxIndexFutures = 'IF',
        NzxFxMilkOptions = 'MO',
        NzxFxDS = 'DS',
        NzxFxES = 'ES',
        NzxFxMS = 'MS',
        MyxNormalMarket = 'NM',
        MyxDirectBusinessTransactionMarket = 'DB',
        MyxIndexMarket = 'IN',
        Ptx = 'PTX',
        Fnsx = 'FNSX',
    }

    export const enum Side {
        Bid = 'Bid',
        Ask = 'Ask',
    }

    // Zenith Market Codes:
    // - https://paritech.gitbooks.io/zenith-websockets-api/fundamentals/feed-structure.html#market-code
    // - https://paritech.gitbooks.io/zenith-websockets-api/appendices/appendix-b1-markets.html
    /* export namespace Market {
        export const Asx = 'ASX';
        export const AsxDelayed = 'ASX[Delayed]';
        export const AsxDemo = 'ASX[Demo]';
        export const AsxTradeMatch = 'ASX:TM';
        export const AsxTradeMatchDemo = 'ASX:TM[Demo]';
        export const AsxPureMatch = 'ASX:PM';
        export const AsxPureMatchDemo = 'ASX:PM[Demo]';
        export const Cxa = 'CXA';
        export const CxaDemo = 'CXA[Demo]';
        export const Nsx = 'NSX';
        export const NsxDemo = 'NSX[Demo]';
        export const Nzx = 'NZX';
        export const NzxDemo = 'NZX[Demo]';
        export const Calastone = 'Calastone';
        export const AsxCxa = 'ASX+CXA';
        export const AsxCxaDemo = 'ASX+CXA[Demo]';
        export const PtxDemo = 'PTX[Demo]';
        export const PtxPtxDemo = 'PTX::PTX[Demo]';
    }

    export enum TradingMarket {
        AsxBookBuild = 'ASX:BB',
        AsxCentrePoint = 'ASX:CP',
        AsxTradeMatch = 'ASX:TM',
        AsxTradeMatchDerivatives = 'ASX:TM:D',
        AsxTradeMatchEquity1 = 'ASX:TM:E1',
        AsxTradeMatchEquity2 = 'ASX:TM:E2',
        AsxTradeMatchEquity3 = 'ASX:TM:E3',
        AsxTradeMatchEquity4 = 'ASX:TM:E4',
        AsxTradeMatchEquity5 = 'ASX:TM:E5',
        AsxTradeMatchIndex = 'ASX:TM:I',
        AsxTradeMatchIndexDerivatives = 'ASX:TM:ID',
        AsxTradeMatchInterestRate = 'ASX:TM:IR',
        AsxTradeMatchPrivate = 'ASX:TM:PRV',
        AsxTradeMatchQuoteDisplayBoard = 'ASX:TM:QD',
        AsxTradeMatchPractice = 'ASX:TM:TST',
        AsxTradeMatchWarrants = 'ASX:TM:W',
        AsxPureMatch = 'ASX:PM',
        AsxPureMatchEquity1 = 'ASX:PM:E1',
        AsxPureMatchEquity2 = 'ASX:PM:E2',
        AsxPureMatchEquity3 = 'ASX:PM:E3',
        AsxPureMatchEquity4 = 'ASX:PM:E4',
        AsxPureMatchEquity5 = 'ASX:PM:E5',
        AsxVolumeMatch = 'ASX:V',
        ChixAustFarPoint = 'CXA::FP',
        ChixAustLimit = 'CXA::LI',
        ChixAustMarketOnClose = 'CXA::MC',
        ChixAustMidPoint = 'CXA::MP',
        ChixAustNearPoint = 'CXA::NP',
        NsxMain = 'NSX',
        NsxCommunityBanks = 'NSX::COM',
        NsxIndustrial = 'NSX::CRP',
        NsxDebt = 'NSX::DBT',
        NsxMiningAndEnergy = 'NSX::MIN',
        NsxCertifiedProperty = 'NSX::PROP',
        NsxProperty = 'NSX::PRP',
        NsxRestricted = 'NSX::RST',
        SimVenture = 'NSX:SV',
        SouthPacificStockExchange = 'NSX:SP',
        SouthPacificStockExchangeEquities = 'NSX:SP:EQY',
        SouthPacificStockExchangeRestricted = 'NSX:SP:RST',
        NzxMainBoard = 'NZX',
        NzxMainBoard_Alt = 'NZX::SX',
        NzxNXT = 'NZX::NXT',
        NzxSpec = 'NZX::SPEC',
        NzxFonterraShareholders = 'NZX::FSM',
        NzxIndex = 'NZX::I',
        NzxDebt = 'NZX::DX',
        NzxAlternate = 'NZX::AX',
        NzxDerivativeFutures = 'NZX::DF',
        NzxDerivativeOptions = 'NZX::DO',
        NzxIndexFutures = 'NZX::IF',
        NzxFxDerivativeOptions = 'NZX:FX:DO',
        NzxFxDerivativeFutures = 'NZX:FX:DF',
        NzxFxEquityOptions = 'NZX:FX:EO',
        NzxFxIndexFutures = 'NZX:FX:IF',
        NzxFxMilkOptions = 'NZX:FX:MO',
        AsxBookBuildDemo = 'ASX:BB[Demo]',
        AsxCentrePointDemo = 'ASX:CP[Demo]',
        AsxTradeMatchDemo = 'ASX:TM[Demo]',
        AsxTradeMatchDerivativesDemo = 'ASX:TM:D[Demo]',
        AsxTradeMatchEquity1Demo = 'ASX:TM:E1[Demo]',
        AsxTradeMatchEquity2Demo = 'ASX:TM:E2[Demo]',
        AsxTradeMatchEquity3Demo = 'ASX:TM:E3[Demo]',
        AsxTradeMatchEquity4Demo = 'ASX:TM:E4[Demo]',
        AsxTradeMatchEquity5Demo = 'ASX:TM:E5[Demo]',
        AsxTradeMatchIndexDemo = 'ASX:TM:I[Demo]',
        AsxTradeMatchIndexDerivativesDemo = 'ASX:TM:ID[Demo]',
        AsxTradeMatchInterestRateDemo = 'ASX:TM:IR[Demo]',
        AsxTradeMatchPrivateDemo = 'ASX:TM:PRV[Demo]',
        AsxTradeMatchQuoteDisplayBoardDemo = 'ASX:TM:QD[Demo]',
        AsxTradeMatchPracticeDemo = 'ASX:TM:TST[Demo]',
        AsxTradeMatchWarrantsDemo = 'ASX:TM:W[Demo]',
        AsxPureMatchDemo = 'ASX:PM[Demo]',
        AsxPureMatchEquity1Demo = 'ASX:PM:E1[Demo]',
        AsxPureMatchEquity2Demo = 'ASX:PM:E2[Demo]',
        AsxPureMatchEquity3Demo = 'ASX:PM:E3[Demo]',
        AsxPureMatchEquity4Demo = 'ASX:PM:E4[Demo]',
        AsxPureMatchEquity5Demo = 'ASX:PM:E5[Demo]',
        AsxVolumeMatchDemo = 'ASX:V[Demo]',
        ChixAustFarPointDemo = 'CXA::FP[Demo]',
        ChixAustLimitDemo = 'CXA::LI[Demo]',
        ChixAustMarketOnCloseDemo = 'CXA::MC[Demo]',
        ChixAustMidPointDemo = 'CXA::MP[Demo]',
        ChixAustNearPointDemo = 'CXA::NP[Demo]',
        NsxMainDemo = 'NSX[Demo]',
        NsxCommunityBanksDemo = 'NSX::COM[Demo]',
        NsxIndustrialDemo = 'NSX::CRP[Demo]',
        NsxDebtDemo = 'NSX::DBT[Demo]',
        NsxMiningAndEnergyDemo = 'NSX::MIN[Demo]',
        NsxCertifiedPropertyDemo = 'NSX::PROP[Demo]',
        NsxPropertyDemo = 'NSX::PRP[Demo]',
        NsxRestrictedDemo = 'NSX::RST[Demo]',
        SimVentureDemo = 'NSX:SV[Demo]',
        SouthPacificStockExchangeDemo = 'NSX:SP[Demo]',
        SouthPacificStockExchangeEquitiesDemo = 'NSX:SP:EQY[Demo]',
        SouthPacificStockExchangeRestrictedDemo = 'NSX:SP:RST[Demo]',
        NzxMainBoardDemo = 'NZX[Demo]',
        NzxMainBoardDemo_Alt = 'NZX::SX[Demo]', // Alternate code for the NZX default board.
        NzxNXTDemo = 'NZX::NXT[Demo]',
        NzxSpecDemo = 'NZX::SPEC[Demo]',
        NzxFonterraShareholdersDemo = 'NZX::FSM[Demo]',
        NzxIndexDemo = 'NZX::I[Demo]',
        NzxDebtDemo = 'NZX::DX[Demo]',
        NzxAlternateDemo = 'NZX::AX[Demo]',
        NzxDerivativeFuturesDemo = 'NZX::DF[Demo]',
        NzxDerivativeOptionsDemo = 'NZX::DO[Demo]',
        NzxIndexFuturesDemo = 'NZX::IF[Demo]',
        NzxFxDerivativeOptionsDemo = 'NZX:FX:DO[Demo]',
        NzxFxDerivativeFuturesDemo = 'NZX:FX:DF[Demo]',
        NzxFxEquityOptionsDemo = 'NZX:FX:EO[Demo]',
        NzxFxIndexFuturesDemo = 'NZX:FX:IF[Demo]',
        NzxFxMilkOptionsDemo = 'NZX:FX:MO[Demo]',
        PtxDemo = 'PTX::PTX[Demo]',
    } */

    export namespace TradingController {
        export const enum TopicName {
            Accounts = 'Accounts',
            QueryAccounts = 'QueryAccounts',
            QueryOrderStatuses = 'QueryOrderStatuses',
            Orders = 'Orders',
            QueryOrders = 'QueryOrders',
            Holdings = 'Holdings',
            QueryHoldings = 'QueryHoldings',
            Balances = 'Balances',
            QueryBalances = 'QueryBalances',
            Transactions = 'Transactions',
            QueryTransactions = 'QueryTransactions',
            Requests = 'Requests',
            QueryRequests = 'QueryRequests',
            QueryAudit = 'QueryAudity',
            PlaceOrder = 'PlaceOrder',
            AmendOrder = 'AmendOrder',
            CancelOrder = 'CancelOrder',
            MoveOrder = 'MoveOrder',
        }

        // OrderStyle is alias of Zenith.SecurityClass
        export type OrderStyle = SecurityClass;
        export namespace OrderStyle {
            export const Unknown = SecurityClass.Unknown;
            export const Market = SecurityClass.Market;
            export const ManagedFund = SecurityClass.ManagedFund;
        }

        export namespace Accounts {
            export type PublishSubUnsubMessageContainer = RequestMessageContainer;

            export type Payload = AccountState[];

            export interface PublishSubPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: Payload;
            }

            export interface AccountState {
                ID: string;
                Name?: string; // will be undefined if Feed === impaired
                Feed: FeedStatus;
                Provider?: string; // Trading Feed name // bug: will be undefined if Feed === impaired
                Currency?: Currency; // will be undefined if Feed === impaired
            }
        }

        export namespace OrderStatuses {
            export interface QueryRequest {
                Provider: string; // Trading Feed name
            }

            export interface PublishMessageContainer extends RequestMessageContainer {
                Data: QueryRequest;
            }

            export type PublishPayload = Status[];
            export interface PublishPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: PublishPayload;
            }

            export const enum Allow {
                None = 'None',
                Trade = 'Trade',
                Amend = 'Amend',
                Cancel = 'Cancel',
                Move = 'Move',
                All = 'All',
            }

            export const enum Reason {
                Unknown = 'Unknown',
                Normal = 'Normal',
                Manual = 'Manual',
                Abnormal = 'Abnormal',
                Completed = 'Completed',
                Waiting = 'Waiting',
            }

            export interface Status {
                Code: string;
                Exchange?: string;
                Reason: CommaString;
                Allows: CommaString;
            }
        }

        export namespace Orders {

            export interface QueryRequest {
                Account: string;
                OrderID?: string;
            }

            export interface PublishMessageContainer extends RequestMessageContainer {
                Data: QueryRequest;
            }

            export type PublishPayload = AddUpdateOrder[];
            export interface PublishPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: PublishPayload;
            }

            export type SubPayload = OrderChangeRecord[];
            export interface SubPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: SubPayload;
            }

            export interface Order {
                Account: string;
            }

            export interface RemoveOrder extends Order {
                ID: string;
            }

            export interface AddUpdateOrder extends Order {
                ID: string;
                ExternalID: string | undefined;
                DepthOrderID: string | undefined;
                Status: string;
                Market: string;
                TradingMarket: string;
                Currency: Currency;
                EstimatedBrokerage: number;
                CurrentBrokerage: number;
                EstimatedTax: number;
                CurrentTax: number;
                CurrentValue: number;
                CreatedDate: DateTimeIso8601;
                UpdatedDate: DateTimeIso8601;
                Style: OrderStyle;
                Details: PlaceOrder.Details;
                Route: PlaceOrder.Route;
                Children: string[] | undefined;
                Condition: PlaceOrder.Condition | undefined;
            }

            export interface MarketOrder extends AddUpdateOrder {
                Style: SecurityClass.Market; // cannot use alias here
                ExecutedQuantity: Integer;
                AveragePrice: number | null | undefined;
            }

            export interface ManagedFundOrder extends AddUpdateOrder {
                Style: SecurityClass.ManagedFund; // cannot use alias here
            }

            export interface OrderChangeRecord {
                O: AurcChangeType;
                Account: string | undefined;   // provided when clearing.
                Order: AddUpdateOrder | undefined; // omitted when clearing.
            }
        }

        export namespace Holdings {
            export interface QueryRequest {
                Account: string;
                Exchange?: string;
                Code?: string;
            }

            export interface PublishMessageContainer extends RequestMessageContainer {
                Data: QueryRequest;
            }

            export type PublishPayload = AddUpdateDetail[];
            export interface PublishPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: PublishPayload;
            }

            export type SubPayload = ChangeRecord[];
            export interface SubPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: SubPayload;
            }

            export interface ChangeRecord {
                O: AurcChangeType;
                Account?: string;   // provided when clearing.
                Holding?: Detail; // omitted when clearing.
            }

            // HoldingStyle is alias of Zenith.SecurityClass
            export type HoldingStyle = SecurityClass;
            export namespace HoldingStyle {
                export const Unknown = SecurityClass.Unknown;
                export const Market = SecurityClass.Market;
                export const ManagedFund = SecurityClass.ManagedFund;
            }

            export interface Detail {
                Account: string;
            }

            export interface RemoveDetail extends Detail {
                Exchange: string;
                Code: string;
            }

            export interface AddUpdateDetail extends Detail {
                Exchange: string;
                Code: string;
                Style: HoldingStyle;
                Cost: Decimal;
                Currency: Currency;
            }

            export interface MarketDetail extends AddUpdateDetail {
                TotalQuantity: Integer;
                TotalAvailable: Integer;
                AveragePrice: Decimal;
            }

            export interface ManagedFundDetail extends AddUpdateDetail {
                TotalUnits: Decimal;
                BaseCost: Decimal;
            }
        }

        export namespace Balances {
            export interface QueryRequest {
                Account: string;
            }

            export interface PublishMessageContainer extends RequestMessageContainer {
                Data: QueryRequest;
            }

            export type Payload = Balance[];

            export interface PublishSubPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: Payload;
            }

            export interface Balance {
                Account: string;
                Type: string;
                Currency: Currency;
                Amount: Decimal;
            }
        }

        export namespace Transactions {

            export interface QueryRequest {
                Account: string;
                FromDate?: DateTimeIso8601;
                ToDate?: DateTimeIso8601;
                Count?: Integer;
                TradingMarket?: string;
                Exchange?: string;
                Code?: string;
                OrderID?: string;
            }

            export interface PublishMessageContainer extends RequestMessageContainer {
                Data: QueryRequest;
            }

            export type PublishPayload = Detail[];
            export interface PublishPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: PublishPayload;
            }

            export type SubPayload = Change[];
            export interface SubPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: SubPayload;
            }

            export interface Detail {
                ID: string;
                Exchange: string;
                Code: string;
                TradingMarket: string;
                Account: string;
                Style: OrderStyle;
                TradeDate: DateTimeIso8601;
                SettlementDate: DateTimeIso8601;
                GrossAmount: Decimal;
                NetAmount: Decimal;
                SettlementAmount: Decimal;
                Currency?: Currency;
                OrderID: string;
            }

            export interface MarketDetail extends Detail {
                Style: SecurityClass.Market; // cannot use alias here
                TotalQuantity: Integer;
                AveragePrice: number;
            }

            export interface ManagedFundDetail extends Detail {
                Style: SecurityClass.ManagedFund; // cannot use alias here
                TotalUnits: Decimal;
                UnitValue: Decimal;
            }

            export interface Change {
                O: AuiChangeType;
                Account: string | undefined;
                Transaction: Detail | undefined;
            }
        }

        export namespace Requests {

            export interface QueryRequest {
                Account: string;
                OrderID?: string;
            }

            export interface PublishMessageContainer extends RequestMessageContainer {
                Data: Request;
            }

            export type PublishPayload = Request[];
            export interface PublishPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: PublishPayload;
            }

            export type SubPayload = Change[];
            export interface SubPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: SubPayload;
            }

            export interface Request {
                ID: string;
                Account: string;
                OrderID: string;
                Type: Type;
                CreatedDate: DateTimeIso8601;
                UpdatedDate: DateTimeIso8601;
                Status: Status;
                Style: OrderStyle;
                Details: PlaceOrder.Details;
                Route: PlaceOrder.Route;
                Condition?: PlaceOrder.Condition | undefined;
            }

            export const enum Type {
                Place = 'Place',
                Amend = 'Amend',
                Cancel = 'Cancel',
            }

            export const enum Status {
                Pending,
                PendingAuthorisation,
                Rejected,
                Authorised,
                Complete,
            }

            export interface Change {
                O: AurcChangeType;
                Account: string | undefined;   // provided when clearing.
                Request: Request | undefined; // omitted when clearing.
            }
        }

        export namespace OrderAudit {

            export interface QueryRequest {
                Account: string;
                OrderID?: string;
            }

            export interface PublishMessageContainer extends RequestMessageContainer {
                Data: QueryRequest;
            }

            export type PublishPayload = Detail[];
            export interface PublishPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: PublishPayload;
            }

            export type SubPayload = Change[];
            export interface SubPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: SubPayload;
            }

            export interface Detail {
                Version: string;
                OrderID: string;
                Account: string;
                Type: Type;
                Order: Orders.AddUpdateOrder;
                Request: Requests.Request;
                Transaction: Transactions.Detail;
            }

            export const enum Type {
                Order = 'Order',
                Request = 'Request',
                Transaction = 'Transaction',
            }

            export interface Change {
                O: AurcChangeType;
                Account: string | undefined;   // provided when clearing.
                Audit: Detail | undefined; // omitted when clearing.
            }
        }

        export const enum OrderRequestResult {
            Success = 'Success',
            Error = 'Error',
            Incomplete = 'Incomplete',
            Invalid = 'Invalid',
            Rejected = 'Rejected',
        }

        export namespace PlaceOrder {

            export interface QueryRequest {
                Account: string;
                Flags?: OrderRequestFlag[];
                Details: Details;
                Route: Route;
                Condition?: Condition;
            }

            export interface PublishMessageContainer extends RequestMessageContainer {
                Data: QueryRequest;
            }

            export type PublishPayload = Response;
            export interface PublishPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: PublishPayload;
            }

            export interface Details {
                Exchange: string;
                Code: string;
                Side: Side;
                Style: OrderStyle;
                BrokerageSchedule?: string;
            }

            export interface MarketDetails extends Details {
                Style: SecurityClass.Market; // cannot use alias here
                Type: EquityOrderType;
                LimitPrice?: number;
                Quantity: Integer;
                HiddenQuantity?: Integer;
                MinimumQuantity?: Integer;
                Validity: EquityOrderValidity;
                ExpiryDate?: DateTimeIso8601;
                ShortType?: ShortSellType;
            }

            export interface ManagedFundDetails extends Details {
                Style: SecurityClass.ManagedFund; // cannot use alias here
                UnitType: OrderPriceUnitType;
                UnitAmount: number;
                Currency?: string;
                PhysicalDelivery?: boolean;
            }

            export interface Route {
                Algorithm: OrderRouteAlgorithm;
            }

            export interface MarketRoute extends Route {
                Algorithm: OrderRouteAlgorithm.Market;
                Market: string;
            }

            export interface BestMarketRoute extends Route {
                Algorithm: OrderRouteAlgorithm.BestMarket;
            }

            export interface FixRoute extends Route {
                Algorithm: OrderRouteAlgorithm.Fix;
            }

            export interface Condition {
                Name: Condition.Name;
            }

            export namespace Condition {
                export const enum Name {
                    StopLoss = 'StopLoss',
                    TrailingStopLoss = 'TrailingStopLoss',
                }

                export const enum Reference {
                    Last = 'Last',
                    BestBid = 'BestBid',
                    BestAsk = 'BestAsk',
                }

                export const enum Direction {
                    None = 'None',
                    Up = 'Up',
                    Down = 'Down',
                }
            }

            export interface StopLossCondition extends Condition {
                Name: Condition.Name.StopLoss;
                Stop?: number;
                Reference?: Condition.Reference;
                Direction?: Condition.Direction;
            }

            export interface TrailingStopLossCondition extends Condition {
                Name: Condition.Name.TrailingStopLoss;
                Type: TrailingStopLossCondition.Type;
                Value: number;
                Limit: number;
                Stop?: number;
            }

            export namespace TrailingStopLossCondition {
                export const enum Type {
                    Price = 'Price',
                    Percent = 'Percent',
                }
            }

            export const enum ShortSellType {
                ShortSell = 'ShortSell',
                ShortSellExempt = 'ShortSellExempt',
            }

            export interface Response {
                Result: OrderRequestResult;
                Order?: Orders.AddUpdateOrder;
                Errors?: OrderRequestError[];
                EstimatedBrokerage?: Decimal;
                EstimatedTax?: Decimal;
                EstimatedValue?: Decimal;
            }
        }

        export namespace AmendOrder {
            export interface QueryRequest {
                Account: string;
                Flags?: OrderRequestFlag[];
                Details: PlaceOrder.Details;
                OrderID: string;
                Route?: PlaceOrder.Route;
                Condition?: PlaceOrder.Condition;
            }

            export interface PublishMessageContainer extends RequestMessageContainer {
                Data: QueryRequest;
            }

            export type PublishPayload = Response;
            export interface PublishPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: PublishPayload;
            }

            export interface Response {
                Result: OrderRequestResult;
                Order?: Orders.AddUpdateOrder;
                Errors?: OrderRequestError[];
                EstimatedBrokerage?: Decimal;
                EstimatedTax?: Decimal;
                EstimatedValue?: Decimal;
            }
        }

        export namespace CancelOrder {
            export interface QueryRequest {
                Account: string;
                Flags?: OrderRequestFlag[];
                OrderID: string;
            }

            export interface PublishMessageContainer extends RequestMessageContainer {
                Data: QueryRequest;
            }

            export type PublishPayload = Response;
            export interface PublishPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: PublishPayload;
            }

            export interface Response {
                Result: OrderRequestResult;
                Order?: Orders.AddUpdateOrder;
                Errors?: OrderRequestError[];
            }
        }

        export namespace MoveOrder {
            export interface QueryRequest {
                Account: string;
                Flags?: OrderRequestFlag[];
                OrderID: string;
                Destination: string;
            }

            export interface PublishMessageContainer extends RequestMessageContainer {
                Data: QueryRequest;
            }

            export type PublishPayload = Response;
            export interface PublishPayloadMessageContainer extends ResponseUpdateMessageContainer {
                Data: PublishPayload;
            }

            export interface Response {
                Result: OrderRequestResult;
                Order?: Orders.AddUpdateOrder;
                Errors?: OrderRequestError[];
            }
        }

        export const enum OrderRequestFlag {
            Pds = 'PDS',
        }

        export type OrderRequestError = string;

        export namespace OrderRequestError {
            export const enum Code {
                Account = 'Account',
                Account_DailyNet = 'Account.DailyNet',
                Account_DailyGross = 'Account.DailyGross',
                Authority = 'Authority',
                Connection = 'Connection',
                Details = 'Details',
                Error = 'Error',
                Exchange = 'Exchange',
                Internal = 'Internal',
                Internal_NotFound = 'Internal.NotFound',
                Order = 'Order',
                Operation = 'Operation',
                Retry = 'Retry',
                Route = 'Route',
                Route_Algorithm = 'Route.Algorithm',
                Route_Market = 'Route.Market',
                Route_Symbol = 'Route.Symbol',
                Status = 'Status',
                Style = 'Style',
                Submitted = 'Submitted',
                Symbol = 'Symbol',
                Symbol_Authority = 'Symbol.Authority',
                Symbol_Status = 'Symbol.Status',
                TotalValue_Balance = 'TotalValue.Balance',
                TotalValue_Maximum = 'TotalValue.Maximum',
                ExpiryDate = 'ExpiryDate',
                HiddenQuantity = 'HiddenQuantity',
                HiddenQuantity_Symbol = 'HiddenQuantity.Symbol',
                LimitPrice = 'LimitPrice',
                LimitPrice_Distance = 'LimitPrice.Distance',
                LimitPrice_Given = 'LimitPrice.Given',
                LimitPrice_Maximum = 'LimitPrice.Maximum',
                LimitPrice_Missing = 'LimitPrice.Missing',
                MinimumQuantity = 'MinimumQuantity',
                MinimumQuantity_Symbol = 'MinimumQuantity.Symbol',
                OrderType = 'OrderType',
                OrderType_Market = 'OrderType.Market',
                OrderType_Status = 'OrderType.Status',
                OrderType_Symbol = 'OrderType.Symbol',
                Side = 'Side',
                Side_Maximum = 'Side.Maximum',
                TotalQuantity = 'TotalQuantity',
                TotalQuantity_Minimum = 'TotalQuantity.Minimum',
                TotalQuantity_Holdings = 'TotalQuantity.Holdings',
                Validity = 'Validity',
                Validity_Symbol = 'Validity.Symbol',
                VisibleQuantity = 'VisibleQuantity',
                TotalQuantity_Maximum = 'TotalQuantity.Maximum',
                UnitType = 'UnitType',
                UnitAmount = 'UnitAmount',
                Currency = 'Currency',
                Flags_PDS = 'Flags.PDS',
            }

            export const valueSeparator = ' ';
        }
    }

    export namespace WebSocket {
        // Server sent close codes
        export const enum CloseCode {
            // Standard websocket close codes
            Normal = 1000, // Sent in response to a client-initiated closure.
            GoingAway = 1001, // Sent if the server deliberately dropped your connection.
            Protocol = 1002, // Sent if the client supplies an invalid or malformed frame.
            ViolatesPolicy = 1007, // Sent if the client has not responded to ping.
            DataTooLarge = 1009, // Sent if the client sends a message that is too large.
            ServerError = 1011, // Sent if the server encountered a situation requiring it to end the connection.
            ServerRestart = 1012, // Sent if the server is shutting down. The client should attempt to reconnect.

            // Application websocket close codes
            Session = 4000, // Sent if this Connection is being dropped due to a concurrent login
            // exceeding the limits of your account.
            // Do NOT automatically reconnect if this code is received. Otherwise logins could
            // continuously kick each other off if session limit is exceeded
        }
    }
}
