/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import Decimal from 'decimal.js-light';
import {
    AssertInternalError,
    CommaText,
    concatenateArrayUniquely,
    defined,
    EnumInfoOutOfOrderError,
    ExternalError,
    Integer,
    Logger,
    mSecsPerDay,
    mSecsPerHour,
    mSecsPerMin,
    mSecsPerSec,
    newUndefinableDecimal,
    NotImplementedError,
    parseIntStrict,
    parseNumberStrict,
    SourceTzOffsetDate,
    SourceTzOffsetDateTime,
    UnexpectedCaseError,
    UnreachableCaseError,
    ZenithDataError,
    ZenithDataStateError
} from 'src/sys/internal-api';
import {
    AuiChangeTypeId,
    AurcChangeTypeId,
    BalancesDataMessage,
    BestMarketOrderRoute,
    BidAskSideId,
    BrokerageAccountId,
    BrokerageAccountsDataMessage,
    CallOrPutId,
    ChartIntervalId,
    CurrencyId,
    DepthDirectionId,
    EnvironmentedAccountId,
    EnvironmentedExchangeId,
    EnvironmentedFeedId,
    EnvironmentedMarketBoardId,
    EnvironmentedMarketId,
    ExchangeEnvironmentId,
    ExchangeId,
    ExchangeInfo,
    ExerciseTypeId,
    FeedClassId,
    FeedId,
    FeedInfo,
    FeedsDataMessage,
    FeedStatusId,
    FixOrderRoute,
    HoldingsDataMessage,
    ImmediateOrderTrigger,
    IvemClassId,
    LitIvemId,
    ManagedFundOrderDetails,
    ManagedFundTransaction,
    MarketBoardId,
    MarketId,
    MarketInfo,
    MarketOrderDetails,
    MarketOrderRoute,
    MarketsDataMessage,
    MarketTransaction,
    MovementId, OrderDetails,
    OrderPriceUnitTypeId,
    OrderRequestError as AdiOrderRequestError,
    OrderRequestErrorCodeId,
    OrderRequestFlagId,
    OrderRequestResultId,
    OrderRoute,
    OrderRouteAlgorithmId,
    OrderShortSellTypeId,
    OrderStatus as AdiOrderStatus,
    OrderTrigger,
    OrderTriggerTypeId,
    OrderType,
    OrderTypeId,
    PercentageTrailingPriceOrderTrigger,
    PriceOrderTrigger,
    PublisherRequest,
    SearchSymbolsDataDefinition,
    TimeInForceId,
    TradeAffects as AdiTradeAffects,
    TradeAffectsId,
    TradeFlagId,
    TradesDataMessage,
    TradingState as AdiTradingState,
    TrailingPriceOrderTrigger,
    TrailingStopLossOrderConditionTypeId,
    TransactionsDataMessage,
    ZenithSubscriptionDataId
} from '../../../common/internal-api';
import { Zenith } from './zenith';

export namespace ZenithConvert {

    export namespace Date {
        export namespace DateYYYYMMDD {
            export function toSourceTzOffsetDate(value: Zenith.DateYYYYMMDD): SourceTzOffsetDate | undefined {
                return SourceTzOffsetDate.createFromIso8601(value);
                // return new globalThis.Date(globalThis.Date.parse(value)); // switch to SourceTzOffsetDateTime
            }
            export function fromDate(value: globalThis.Date) {
                throw new NotImplementedError('ZCDDYMDFD699233382323');
            }
        }

        export namespace DateTimeIso8601 {
            export function toSourceTzOffsetDateTime(value: Zenith.DateTimeIso8601): SourceTzOffsetDateTime | undefined {
                return SourceTzOffsetDateTime.createFromIso8601(value);
            }

            export function fromDate(value: globalThis.Date) {
                return value.toISOString();
            }
        }

        export namespace DateOptionalTimeIso8601 {
            export function toDate(value: Zenith.DateOptionalTimeIso8601) {
                return new globalThis.Date(globalThis.Date.parse(value));
            }
            export function fromDate(value: globalThis.Date) {
                throw new NotImplementedError('ZCDDOTI8FD121200932');
            }
        }
    }

    export namespace Time {
        // [days.]hours:minutes[:seconds[.fractional seconds]]

        export function toTimeSpan(value: Zenith.Time) {
            let stateId = StateId.DaysOrHours;

            let days = 0;
            let hours = 0;
            let minutes = 0;
            let seconds = 0;

            let fieldStartIdx = 0;

            const valueLength = value.length;
            for (let i = 0; i < valueLength; i++) {
                const valueChar = value[i];
                switch (valueChar) {
                    case Zenith.timeDayTerminatorChar:
                    case Zenith.timeFractionalSecondsIntroducerChar:
                        switch (stateId) {
                            case StateId.DaysOrHours:
                                const parsedDays = parseCurrentIntegerField(value, fieldStartIdx, i);
                                if (parsedDays === undefined) {
                                    return undefined;
                                } else {
                                    days = parsedDays;
                                    stateId = StateId.Hours;
                                    fieldStartIdx = i + 1;
                                }
                                break;
                            case StateId.Seconds:
                                const parsedSeconds = parseCurrentIntegerField(value, fieldStartIdx, i);
                                if (parsedSeconds === undefined) {
                                    return undefined;
                                } else {
                                    seconds = parsedSeconds;
                                    stateId = StateId.FractionalSeconds;
                                    fieldStartIdx = i; // want to include the period in field (treat as decimal point)
                                }
                                break;
                            default:
                                return undefined;
                        }
                        break;

                    case Zenith.TimeHoursMinutesSecondsSeparatorChar:
                        switch (stateId) {
                            case StateId.DaysOrHours:
                                const parsedHours = parseCurrentIntegerField(value, fieldStartIdx, i);
                                if (parsedHours === undefined) {
                                    return undefined;
                                } else {
                                    hours = parsedHours;
                                    stateId = StateId.Minutes;
                                    fieldStartIdx = i + 1;
                                }
                                break;
                            case StateId.Minutes:
                                const parsedMinutes = parseCurrentIntegerField(value, fieldStartIdx, i);
                                if (parsedMinutes === undefined) {
                                    return undefined;
                                } else {
                                    minutes = parsedMinutes;
                                    stateId = StateId.Seconds;
                                    fieldStartIdx = i + 1;
                                }
                                break;
                            default:
                                return undefined;
                        }
                        break;
                }
            }

            switch (stateId) {
                case StateId.Minutes:
                    const parsedMinutes = parseCurrentIntegerField(value, fieldStartIdx, valueLength);
                    if (parsedMinutes === undefined) {
                        return undefined;
                    } else {
                        minutes = parsedMinutes;
                    }
                    break;
                case StateId.Seconds:
                    const parsedSeconds = parseCurrentIntegerField(value, fieldStartIdx, valueLength);
                    if (parsedSeconds === undefined) {
                        return undefined;
                    } else {
                        seconds = parsedSeconds;
                    }
                    break;
                case StateId.FractionalSeconds:
                    const parsedFractionalSeconds = parseCurrentNumberField(value, fieldStartIdx, valueLength);
                    if (parsedFractionalSeconds === undefined) {
                        return undefined;
                    } else {
                        seconds += parsedFractionalSeconds;
                    }
                    break;
            }

            const result = days * mSecsPerDay + hours * mSecsPerHour + minutes * mSecsPerMin + seconds * mSecsPerSec;
            return result;
        }

        const enum StateId {
            DaysOrHours,
            Hours,
            Minutes,
            Seconds,
            FractionalSeconds
        }

        function parseCurrentIntegerField(zenithValue: string, startIdx: Integer, endPlus1Idx: Integer) {
            const zenithFieldValue = zenithValue.substring(startIdx, endPlus1Idx);
            return parseIntStrict(zenithFieldValue);
        }

        function parseCurrentNumberField(zenithValue: string, startIdx: Integer, endPlus1Idx: Integer) {
            const zenithFieldValue = zenithValue.substring(startIdx, endPlus1Idx);
            return parseNumberStrict(zenithFieldValue);
        }

        export function fromChartIntervalId(value: ChartIntervalId) {
            throw new NotImplementedError('ZCTSFCII666694543434');
        }

    }

    export namespace Trend {
        export function toId(value: Zenith.MarketController.Trend): MovementId {
            switch (value) {
                case Zenith.MarketController.Trend.None: return MovementId.None;
                case Zenith.MarketController.Trend.Up: return MovementId.Up;
                case Zenith.MarketController.Trend.Down: return MovementId.Down;
                default: throw new UnreachableCaseError('ZCTTI343441', value);
            }
        }
    }

    export namespace TradeFlag {
        export function toIdArray(value: string | undefined): TradeFlagId[] {
            if (value === undefined) {
                return [];
            } else {
                const elements = value.split(Zenith.commaTextSeparator);
                const count = elements.length;
                const result = new Array<TradeFlagId>(count);
                for (let i = 0; i < count; i++) {
                    const flag = elements[i] as Zenith.MarketController.Trades.Flag;
                    result[i] = toId(flag);
                }
                return result;
            }
        }

        function toId(value: Zenith.MarketController.Trades.Flag): TradeFlagId {
            value = value.trim() as Zenith.MarketController.Trades.Flag;
            switch (value) {
                case Zenith.MarketController.Trades.Flag.Cancel: return TradeFlagId.Cancel;
                case Zenith.MarketController.Trades.Flag.OffMarket: return TradeFlagId.OffMarket;
                case Zenith.MarketController.Trades.Flag.PlaceHolder: return TradeFlagId.Placeholder;
                default:
                    throw new UnreachableCaseError('ZCTFTI299022987', value);
            }
        }
    }

    export namespace TradeAffects {
        export function toIdArray(value: string | undefined): TradeAffectsId[] {
            if (value === undefined) {
                return AdiTradeAffects.allIds;
            } else {
                const elements = value.split(Zenith.commaTextSeparator);
                const maxCount = elements.length;
                const result = new Array<TradeAffectsId>(maxCount);
                let count = 0;
                for (let i = 0; i < maxCount; i++) {
                    const element = elements[i] as Zenith.MarketController.Trades.Affects;
                    const id = toId(element);
                    if (id !== undefined) {
                        result[count++] = id;
                    }
                }
                result.length = count;
                return result;
            }
        }

        function toId(value: Zenith.MarketController.Trades.Affects): TradeAffectsId | undefined {
            switch (value) {
                case Zenith.MarketController.Trades.Affects.None: return undefined;
                case Zenith.MarketController.Trades.Affects.Price: return TradeAffectsId.Price;
                case Zenith.MarketController.Trades.Affects.Volume: return TradeAffectsId.Volume;
                case Zenith.MarketController.Trades.Affects.Vwap: return TradeAffectsId.Vwap;
                default:
                    throw new UnreachableCaseError('ZCTATIU81398', value);
            }
        }
    }

    export namespace FeedStatus {
        export function toId(value: Zenith.FeedStatus) {
            switch (value) {
                case Zenith.FeedStatus.Initialising: return FeedStatusId.Initialising;
                case Zenith.FeedStatus.Active: return FeedStatusId.Active;
                case Zenith.FeedStatus.Closed: return FeedStatusId.Closed;
                case Zenith.FeedStatus.Inactive: return FeedStatusId.Inactive;
                case Zenith.FeedStatus.Impaired: return FeedStatusId.Impaired;
                case Zenith.FeedStatus.Expired: return FeedStatusId.Expired;
                default:
                    throw new UnreachableCaseError('ZCFSTI2288573', value);
            }
        }
    }

    export namespace Currency {
        export function tryToId(value: Zenith.Currency): CurrencyId | undefined {
            switch (value) {
                case Zenith.Currency.Aud: return CurrencyId.Aud;
                case Zenith.Currency.Usd: return CurrencyId.Usd;
                case Zenith.Currency.Myr: return CurrencyId.Myr;
                default: return undefined;
            }
        }
    }

    export namespace AuiChangeType {
        export function toId(value: Zenith.AuiChangeType): AuiChangeTypeId {
            switch (value) {
                case Zenith.AuiChangeType.Add: return AuiChangeTypeId.Add;
                case Zenith.AuiChangeType.Update: return AuiChangeTypeId.Update;
                case Zenith.AuiChangeType.Initialise: return AuiChangeTypeId.Initialise;
                default: throw new UnreachableCaseError('ZCAICTTI6833291558', value);
            }
        }
    }

    export namespace AurcChangeType {
        export function toId(value: Zenith.AurcChangeType): AurcChangeTypeId {
            switch (value) {
                case Zenith.AurcChangeType.Add: return AurcChangeTypeId.Add;
                case Zenith.AurcChangeType.Update: return AurcChangeTypeId.Update;
                case Zenith.AurcChangeType.Remove: return AurcChangeTypeId.Remove;
                case Zenith.AurcChangeType.Clear: return AurcChangeTypeId.Clear;
                default: throw new UnreachableCaseError('ZCACTTI1211299', value);
            }
        }
    }

    export namespace MessageContainer {
        export namespace Action {
            export const enum Id {
                Sub,
                Unsub,
                Error,
                Publish,
                Cancel,
            }

            interface Info {
                readonly id: Id;
                readonly action: Zenith.MessageContainer.Action;
            }

            type InfosObject = { [id in keyof typeof Id]: Info };

            const infosObject: InfosObject = {
                Sub: {
                    id: Id.Sub,
                    action: Zenith.MessageContainer.Action.Sub,
                },
                Unsub: {
                    id: Id.Unsub,
                    action: Zenith.MessageContainer.Action.Unsub,
                },
                Error: {
                    id: Id.Error,
                    action: Zenith.MessageContainer.Action.Error,
                },
                Publish: {
                    id: Id.Publish,
                    action: Zenith.MessageContainer.Action.Publish,
                },
                Cancel: {
                    id: Id.Cancel,
                    action: Zenith.MessageContainer.Action.Cancel,
                },
            } as const;

            export const idCount = Object.keys(infosObject).length;
            const infos = Object.values(infosObject);

            export function initialise() {
                const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
                if (outOfOrderIdx >= 0) {
                    throw new EnumInfoOutOfOrderError('Zenith.Action', outOfOrderIdx, infos[outOfOrderIdx].action);
                }
            }

            export function idToAction(id: Id) {
                return infos[id].action;
            }

            export function tryActionToId(action: Zenith.MessageContainer.Action) {
                for (const info of infos) {
                    if (info.action === action) {
                        return info.id;
                    }
                }
                return undefined;
            }

            export function fromRequestTypeId(requestTypeId: PublisherRequest.TypeId) {
                switch (requestTypeId) {
                    case PublisherRequest.TypeId.SubscribeQuery: return Zenith.MessageContainer.Action.Sub;
                    case PublisherRequest.TypeId.Unsubscribe: return Zenith.MessageContainer.Action.Unsub;
                    default:
                        throw new UnreachableCaseError('ZCAFRTI10688883924', requestTypeId);
                }
            }
        }

        export namespace Confirm {
            export function fromRequestTypeId(requestTypeId: PublisherRequest.TypeId) {
                switch (requestTypeId) {
                    case PublisherRequest.TypeId.SubscribeQuery: return true;
                    case PublisherRequest.TypeId.Unsubscribe: return undefined;
                    default:
                        throw new UnreachableCaseError('ZCAFRTI10688883924', requestTypeId);
                }
            }
        }
    }

    export namespace Exchange {
        export function toId(value: Zenith.Exchange): ExchangeId {
            switch (value) {
                case Zenith.Exchange.Asx: return ExchangeId.Asx;
                case Zenith.Exchange.Cxa: return ExchangeId.Cxa;
                case Zenith.Exchange.Nsx: return ExchangeId.Nsx;
                case Zenith.Exchange.Nzx: return ExchangeId.Nzx;
                case Zenith.Exchange.Myx: return ExchangeId.Myx;
                case Zenith.Exchange.Calastone: return ExchangeId.Calastone;
                case Zenith.Exchange.Ptx: return ExchangeId.Ptx;
                case Zenith.Exchange.Fnsx: return ExchangeId.Fnsx;
                case Zenith.Exchange.AsxCxa: return ExchangeId.AsxCxa;

                default:
                    throw new UnreachableCaseError('ZCETI84772', value);
            }
        }

        export function fromId(value: ExchangeId): Zenith.Exchange {
            switch (value) {
                case ExchangeId.Asx: return Zenith.Exchange.Asx;
                case ExchangeId.Cxa: return Zenith.Exchange.Cxa;
                case ExchangeId.Nsx: return Zenith.Exchange.Nsx;
                case ExchangeId.Nzx: return Zenith.Exchange.Nzx;
                case ExchangeId.Myx: return Zenith.Exchange.Myx;
                case ExchangeId.Calastone: return Zenith.Exchange.Calastone;
                case ExchangeId.Ptx: return Zenith.Exchange.Ptx;
                case ExchangeId.Fnsx: return Zenith.Exchange.Fnsx;
                case ExchangeId.AsxCxa: return Zenith.Exchange.AsxCxa;
                default:
                    throw new UnreachableCaseError('ZCEFIR4481', value);
            }
        }
    }

    export namespace ExchangeEnvironment {
        export function toId(value: Zenith.ExchangeEnvironment) {
            switch (value) {
                case Zenith.ExchangeEnvironment.Production: return ExchangeEnvironmentId.Production;
                case Zenith.ExchangeEnvironment.Delayed: return ExchangeEnvironmentId.DelayedProduction;
                case Zenith.ExchangeEnvironment.Demo: return ExchangeEnvironmentId.Demo;
                default:
                    throw new UnreachableCaseError('ZCEETI22985', value);
            }
        }

        export function fromId(value: ExchangeEnvironmentId): Zenith.ExchangeEnvironment {
            switch (value) {
                case ExchangeEnvironmentId.Production: return Zenith.ExchangeEnvironment.Production;
                case ExchangeEnvironmentId.DelayedProduction: return Zenith.ExchangeEnvironment.Delayed;
                case ExchangeEnvironmentId.Demo: return Zenith.ExchangeEnvironment.Demo;
                default:
                    throw new UnreachableCaseError('ZCEEFI88456', value);
            }
        }

        export function enclosedFromResolvedId(value: ExchangeEnvironmentId | undefined) {
            const resolvedEnvironmentId = value !== undefined ? value : ExchangeInfo.getDefaultEnvironmentId();
            const exchangeEnvironment = ExchangeEnvironment.fromId(resolvedEnvironmentId);

            if (exchangeEnvironment === '') {
                return '';
            } else {
                return Zenith.exchangeEnvironmentOpenChar +
                    exchangeEnvironment +
                    Zenith.exchangeEnvironmentCloseChar;
            }
        }
    }

    export namespace EnvironmentedExchange {
        export function toId(value: string): EnvironmentedExchangeId {
            const components = ExchangeMarketBoardParser.parse(value);
            if (components.exchange === undefined) {
                throw new ZenithDataError(ExternalError.Code.ZCEETIP122995, `${value}`);
            } else {
                if (components.environment === undefined) {
                    throw new ZenithDataError(ExternalError.Code.ZCEETIU1221197, `${value}`);
                } else {
                    return {
                        exchangeId: Exchange.toId(components.exchange),
                        environmentId: ExchangeEnvironment.toId(components.environment)
                    };
                }
            }
        }

        export function fromId(exchangeId: ExchangeId, environmentId?: ExchangeEnvironmentId): string {
            return Exchange.fromId(exchangeId) + ExchangeEnvironment.enclosedFromResolvedId(environmentId);
        }
    }

    export namespace EnvironmentedMarket {
        class M1M2 {
            constructor(public m1?: string, public m2?: string) { }
        }

        export function toId(value: string): EnvironmentedMarketId {
            const components = ExchangeMarketBoardParser.parse(value);
            if (components.exchange === undefined) {
                throw new ZenithDataError(ExternalError.Code.ZCEMTIP2244995, `${value}`);
            } else {
                if (components.environment === undefined) {
                    throw new ZenithDataError(ExternalError.Code.ZCEMTIU5511197, `${value}`);
                } else {
                    const exchangeId = Exchange.toId(components.exchange);
                    const environmentId = ExchangeEnvironment.toId(components.environment);
                    const marketId = calculateMarketId(exchangeId, components.m1, components.m2);

                    return {
                        marketId,
                        environmentId
                    };
                }
            }
        }

        export function fromId(marketId: MarketId, environmentId?: ExchangeEnvironmentId): string {
            const exchangeId = MarketInfo.idToExchangeId(marketId);
            const m1M2 = calculateM1M2(marketId);

            return Exchange.fromId(exchangeId) +
                ((m1M2.m1 === undefined) ? '' : Zenith.marketDelimiter + m1M2.m1) +
                ((m1M2.m2 === undefined) ? '' : Zenith.marketDelimiter + m1M2.m2) +
                ExchangeEnvironment.enclosedFromResolvedId(environmentId);
        }

        export function tradingFromId(marketId: MarketId, environmentId?: ExchangeEnvironmentId): string {
            const exchangeId = MarketInfo.idToExchangeId(marketId);
            const m1M2 = calculateTradingM1M2(marketId);

            return Exchange.fromId(exchangeId) +
                ((m1M2.m1 === undefined) ? '' : Zenith.marketDelimiter + m1M2.m1) +
                ((m1M2.m2 === undefined) ? '' : Zenith.marketDelimiter + m1M2.m2) +
                ExchangeEnvironment.enclosedFromResolvedId(environmentId);
        }

        function calculateMarketId(exchangeId: ExchangeId, m1: string | undefined, m2: string | undefined): MarketId {

            const defaultMarket = ExchangeInfo.idToDefaultMarketId(exchangeId);

            switch (exchangeId) {
                case ExchangeId.Asx: {
                    if (!defined(defaultMarket)) {
                        throw new ZenithDataError(ExternalError.Code.ZCE32810141442, 'Condition not handled [ID:32810141442]');
                    }
                    switch (m1) {
                        case undefined: return defaultMarket;
                        case '':
                        case Zenith.Market1Node.AsxTradeMatch: {
                            switch (m2) {
                                case undefined:
                                case '': return defaultMarket;
                                case Zenith.Market2Node.AsxCentrePoint: return MarketId.AsxTradeMatchCentrePoint;
                                default: throw new ZenithDataError(ExternalError.Code.ZCEMCMIASXTM21199, `"${m1}"`);
                            }
                        }
                        case Zenith.Market1Node.AsxVolumeMatch: {
                            switch (m2) {
                                case undefined:
                                case '': return defaultMarket;
                                default: throw new ZenithDataError(ExternalError.Code.ZCEMCMIASXVM21199, `"${m1}"`);
                            }
                        }
                        default: throw new ZenithDataError(ExternalError.Code.ZCEMCMA77553, `"${m1}"`);
                    }
                }

                case ExchangeId.Cxa: {
                    if (!defined(defaultMarket)) {
                        throw new ZenithDataError(ExternalError.Code.ZCE34510141655, '');
                    }
                    switch (m2) {
                        case undefined: return defaultMarket;
                        case Zenith.Market2Node.ChixAustFarPoint: return MarketId.ChixAustFarPoint;
                        case Zenith.Market2Node.ChixAustLimit: return MarketId.ChixAustLimit;
                        case Zenith.Market2Node.ChixAustMarketOnClose: return MarketId.ChixAustMarketOnClose;
                        case Zenith.Market2Node.ChixAustMidPoint: return MarketId.ChixAustMidPoint;
                        case Zenith.Market2Node.ChixAustNearPoint: return MarketId.ChixAustNearPoint;
                        default: throw new ZenithDataError(ExternalError.Code.ZCEMCMCD22779, `${m2}`);
                    }
                }

                case ExchangeId.Nsx: {
                    if (!defined(defaultMarket)) {
                        throw new ZenithDataError(ExternalError.Code.ZCE36110141722, '');
                    }
                    switch (m1) {
                        case undefined: return defaultMarket;
                        case Zenith.Market1Node.NsxNsx: return MarketId.Nsx;
                        case Zenith.Market1Node.SimVenture: return MarketId.SimVenture;
                        case Zenith.Market1Node.SouthPacific: return MarketId.SouthPacific;
                        default: throw new ZenithDataError(ExternalError.Code.ZCEMCMN88543, `${m1}`);
                    }
                }

                case ExchangeId.Nzx: {
                    if (!defined(defaultMarket)) {
                        throw new ZenithDataError(ExternalError.Code.ZCE36710142024, '');
                    }
                    switch (m1) {
                        case undefined: return defaultMarket;
                        case Zenith.Market1Node.NzxMain: return MarketId.Nzx;
                        case Zenith.Market1Node.NzxFxDerivative: return MarketId.Nzfox;
                        default: throw new ZenithDataError(ExternalError.Code.ZCEMCMZ55883, `${m1}`);
                    }
                }

                case ExchangeId.Myx: {
                    if (!defined(defaultMarket)) {
                        throw new ZenithDataError(ExternalError.Code.ZCEMCMIMYXD392855, '');
                    }
                    switch (m1) {
                        case undefined: return defaultMarket;
                        case Zenith.Market1Node.MyxNormal:
                            switch (m2) {
                                case Zenith.Market2Node.MyxNormalMarket: return MarketId.MyxNormal;
                                case Zenith.Market2Node.MyxDirectBusinessTransactionMarket: return MarketId.MyxDirectBusiness;
                                case Zenith.Market2Node.MyxIndexMarket: return MarketId.MyxIndex;
                                default: throw new ZenithDataError(ExternalError.Code.ZCEMCMIMYXN717155, `"${m1}", "${m2}"`);
                            }
                        case Zenith.Market1Node.MyxBuyIn: return MarketId.MyxBuyIn;
                        case Zenith.Market1Node.MyxOddLot: return MarketId.MyxOddLot;
                        default: throw new ZenithDataError(ExternalError.Code.ZCEMCMIMYXU12120098, `${m1}`);
                    }
                }

                case ExchangeId.Ptx: {
                    if (!defined(defaultMarket)) {
                        throw new ZenithDataError(ExternalError.Code.ZCE37710142108, '');
                    }
                    switch (m1) {
                        case undefined: return defaultMarket;
                        case '':
                            switch (m2) {
                                case Zenith.Market2Node.Ptx: return MarketId.Ptx;
                                default:
                                    throw new ZenithDataError(ExternalError.Code.ZCE38211102847, `m1: "${m1}" m2: "${m2}"`);
                            }
                        default: throw new ZenithDataError(ExternalError.Code.ZCE38010142051, `${m1}`);
                    }
                }

                case ExchangeId.Fnsx: {
                    if (!defined(defaultMarket)) {
                        throw new ZenithDataError(ExternalError.Code.ZCEFND37710142108, '');
                    }
                    switch (m1) {
                        case undefined: return defaultMarket;
                        case '':
                            switch (m2) {
                                case Zenith.Market2Node.Fnsx: return MarketId.Fnsx;
                                default:
                                    throw new ZenithDataError(ExternalError.Code.ZCEFN2M38211102847, `m1: "${m1}" m2: "${m2}"`);
                            }
                        default: throw new ZenithDataError(ExternalError.Code.ZCEFN1M38010142051, `${m1}`);
                    }
                }

                default:
                    throw new ZenithDataError(ExternalError.Code.ZCEMCMD98743, '');
            }
        }

        function calculateM1M2(marketId: MarketId) {
            switch (marketId) {
                case MarketId.AsxTradeMatch: return new M1M2();
                case MarketId.AsxBookBuild: return new M1M2(Zenith.Market1Node.AsxBookBuild);
                case MarketId.AsxTradeMatchCentrePoint: return new M1M2(undefined, Zenith.Market2Node.AsxCentrePoint);
                case MarketId.AsxPureMatch: return new M1M2(Zenith.Market1Node.AsxPureMatch);
                case MarketId.AsxVolumeMatch: return new M1M2(Zenith.Market1Node.AsxVolumeMatch);
                // NOTE: for ChiX, see https://paritech.myjetbrains.com/youtrack/issue/MOTIF-162
                case MarketId.ChixAustFarPoint: return new M1M2();
                case MarketId.ChixAustLimit: return new M1M2();
                case MarketId.ChixAustMarketOnClose: return new M1M2();
                case MarketId.ChixAustMidPoint: return new M1M2();
                case MarketId.ChixAustNearPoint: return new M1M2();
                case MarketId.Nsx: return new M1M2(Zenith.Market1Node.NsxNsx);
                case MarketId.SimVenture: return new M1M2(Zenith.Market1Node.SimVenture);
                case MarketId.SouthPacific: return new M1M2(Zenith.Market1Node.SouthPacific);
                case MarketId.Nzx: return new M1M2(Zenith.Market1Node.NzxMain);
                case MarketId.Nzfox: return new M1M2(Zenith.Market1Node.NzxFxDerivative);
                case MarketId.MyxNormal: return new M1M2();
                case MarketId.MyxDirectBusiness: return new M1M2(Zenith.Market1Node.MyxNormal,
                    Zenith.Market2Node.MyxDirectBusinessTransactionMarket);
                case MarketId.MyxIndex: return new M1M2(Zenith.Market1Node.MyxNormal,
                    Zenith.Market2Node.MyxIndexMarket);
                case MarketId.MyxOddLot: return new M1M2(Zenith.Market1Node.MyxOddLot);
                case MarketId.MyxBuyIn: return new M1M2(Zenith.Market1Node.MyxBuyIn);
                case MarketId.Ptx: return new M1M2();
                case MarketId.Fnsx: return new M1M2();
                case MarketId.AsxCxa: return new M1M2();
                case MarketId.Calastone: throw new NotImplementedError('ZCEMCMMN29998');
                default: throw new UnreachableCaseError('ZCEMCMMU33997', marketId);
            }
        }

        function calculateTradingM1M2(marketId: MarketId) {
            switch (marketId) {
                case MarketId.Ptx: return new M1M2(Zenith.Market1Node.PtxPtx, Zenith.Market2Node.Ptx);
                case MarketId.Fnsx: return new M1M2(Zenith.Market1Node.FnsxFnsx, Zenith.Market2Node.Fnsx);

                case MarketId.MyxNormal: return new M1M2(Zenith.Market1Node.MyxNormal, Zenith.Market2Node.MyxNormalMarket);
                case MarketId.MyxDirectBusiness: return new M1M2(Zenith.Market1Node.MyxNormal,
                    Zenith.Market2Node.MyxDirectBusinessTransactionMarket);
                case MarketId.MyxOddLot: return new M1M2(Zenith.Market1Node.MyxOddLot);
                case MarketId.MyxBuyIn: return new M1M2(Zenith.Market1Node.MyxBuyIn);

                case MarketId.AsxTradeMatch: return new M1M2();
                case MarketId.AsxTradeMatchCentrePoint: return new M1M2(undefined, Zenith.Market2Node.AsxCentrePoint);
                case MarketId.AsxBookBuild:
                case MarketId.AsxPureMatch:
                case MarketId.AsxVolumeMatch:
                case MarketId.ChixAustFarPoint:
                case MarketId.ChixAustLimit:
                case MarketId.ChixAustMarketOnClose:
                case MarketId.ChixAustMidPoint:
                case MarketId.ChixAustNearPoint:
                case MarketId.Nsx:
                case MarketId.SimVenture:
                case MarketId.SouthPacific:
                case MarketId.Nzx:
                case MarketId.Nzfox:
                case MarketId.MyxIndex:
                case MarketId.AsxCxa:
                case MarketId.Calastone: throw new NotImplementedError('ZCEMCTMMN1119985');
                default: throw new UnreachableCaseError('ZCEMCMMU33997', marketId);
            }
        }
    }

    export namespace EnvironmentedMarketBoard {
        export function toId(value: string): EnvironmentedMarketBoardId {
            const components = ExchangeMarketBoardParser.parse(value);
            if (components.exchange === undefined) {
                throw new ZenithDataError(ExternalError.Code.ZCEMBTIE54253399, `${value}`);
            } else {
                if (components.environment === undefined) {
                    throw new ZenithDataError(ExternalError.Code.ZCEMBTIV3779959, `${value}`);
                } else {
                    const exchangeId = Exchange.toId(components.exchange);
                    const environmentId = ExchangeEnvironment.toId(components.environment);
                    const marketBoardId = calculateMarketBoardId(exchangeId, components.m1, components.m2);

                    return {
                        marketBoardId,
                        environmentId
                    };
                }
            }
        }

        function calculateMarketBoardId(exchangeId: ExchangeId, m1: string | undefined, m2: string | undefined): MarketBoardId {
            /* eslint-disable max-len */
            switch (exchangeId) {
                case ExchangeId.Asx:
                    switch (m1) {
                        case Zenith.Market1Node.AsxBookBuild: return MarketBoardId.AsxBookBuild;
                        case Zenith.Market1Node.AsxVolumeMatch: return MarketBoardId.AsxVolumeMatch;
                        case Zenith.Market1Node.AsxDefault:
                        case Zenith.Market1Node.AsxTradeMatch:
                            switch (m2) {
                                case undefined: return MarketBoardId.AsxTradeMatch;
                                case Zenith.Market2Node.AsxCentrePoint: return MarketBoardId.AsxTradeMatchCentrePoint;
                                case Zenith.Market2Node.AsxTradeMatchAgric: return MarketBoardId.AsxTradeMatchAgric;
                                case Zenith.Market2Node.AsxTradeMatchAus: return MarketBoardId.AsxTradeMatchAus;
                                case Zenith.Market2Node.AsxTradeMatchDerivatives: return MarketBoardId.AsxTradeMatchDerivatives;
                                case Zenith.Market2Node.AsxTradeMatchEquity1: return MarketBoardId.AsxTradeMatchEquity1;
                                case Zenith.Market2Node.AsxTradeMatchEquity2: return MarketBoardId.AsxTradeMatchEquity2;
                                case Zenith.Market2Node.AsxTradeMatchEquity3: return MarketBoardId.AsxTradeMatchEquity3;
                                case Zenith.Market2Node.AsxTradeMatchEquity4: return MarketBoardId.AsxTradeMatchEquity4;
                                case Zenith.Market2Node.AsxTradeMatchEquity5: return MarketBoardId.AsxTradeMatchEquity5;
                                case Zenith.Market2Node.AsxTradeMatchIndex: return MarketBoardId.AsxTradeMatchIndex;
                                case Zenith.Market2Node.AsxTradeMatchIndexDerivatives: return MarketBoardId.AsxTradeMatchIndexDerivatives;
                                case Zenith.Market2Node.AsxTradeMatchInterestRate: return MarketBoardId.AsxTradeMatchInterestRate;
                                case Zenith.Market2Node.AsxTradeMatchPrivate: return MarketBoardId.AsxTradeMatchPrivate;
                                case Zenith.Market2Node.AsxTradeMatchQuoteDisplayBoard: return MarketBoardId.AsxTradeMatchQuoteDisplayBoard;
                                case Zenith.Market2Node.AsxTradeMatchPractice: return MarketBoardId.AsxTradeMatchPractice;
                                case Zenith.Market2Node.AsxTradeMatchWarrants: return MarketBoardId.AsxTradeMatchWarrants;
                                case Zenith.Market2Node.AsxTradeMatchAD: return MarketBoardId.AsxTradeMatchAD;
                                case Zenith.Market2Node.AsxTradeMatchED: return MarketBoardId.AsxTradeMatchED;
                                default:
                                    Logger.logDataError('ZCEMCMBIAT223', `${m2}: Using Tradematch`);
                                    return MarketBoardId.AsxTradeMatch;
                            }

                        case Zenith.Market1Node.AsxPureMatch:
                            switch (m2) {
                                case undefined: return MarketBoardId.AsxPureMatch;
                                case Zenith.Market2Node.AsxPureMatchEquity1: return MarketBoardId.AsxPureMatchEquity1;
                                case Zenith.Market2Node.AsxPureMatchEquity2: return MarketBoardId.AsxPureMatchEquity2;
                                case Zenith.Market2Node.AsxPureMatchEquity3: return MarketBoardId.AsxPureMatchEquity3;
                                case Zenith.Market2Node.AsxPureMatchEquity4: return MarketBoardId.AsxPureMatchEquity4;
                                case Zenith.Market2Node.AsxPureMatchEquity5: return MarketBoardId.AsxPureMatchEquity5;
                                default:
                                    Logger.logDataError('ZCEMCMBIAP847', `${m2}: Using Purematch`);
                                    return MarketBoardId.AsxPureMatch;
                            }
                        default: throw new ZenithDataError(ExternalError.Code.ZCEMCMBAD39971, `${m1}`);
                    }
                case ExchangeId.Cxa:
                    switch (m2) {
                        case undefined: throw new ZenithDataError(ExternalError.Code.ZCEMCMBCU11008, '');
                        case Zenith.Market2Node.ChixAustFarPoint: return MarketBoardId.ChixAustFarPoint;
                        case Zenith.Market2Node.ChixAustLimit: return MarketBoardId.ChixAustLimit;
                        case Zenith.Market2Node.ChixAustMarketOnClose: return MarketBoardId.ChixAustMarketOnClose;
                        case Zenith.Market2Node.ChixAustMidPoint: return MarketBoardId.ChixAustMidPoint;
                        case Zenith.Market2Node.ChixAustNearPoint: return MarketBoardId.ChixAustNearPoint;
                        default: throw new ZenithDataError(ExternalError.Code.ZCEMCMBCD11136, `${m2}`);
                    }

                case ExchangeId.Nsx:
                    switch (m1) {
                        case Zenith.Market1Node.SimVenture: return MarketBoardId.SimVenture;
                        case Zenith.Market1Node.NsxNsx:
                            switch (m2) {
                                case undefined:
                                    Logger.logDataError('ZCEMCMBNNU33885', 'Using NSX Main');
                                    return MarketBoardId.NsxMain;
                                case Zenith.Market2Node.NsxCommunityBanks: return MarketBoardId.NsxCommunityBanks;
                                case Zenith.Market2Node.NsxIndustrial: return MarketBoardId.NsxIndustrial;
                                case Zenith.Market2Node.NsxDebt: return MarketBoardId.NsxDebt;
                                case Zenith.Market2Node.NsxMiningAndEnergy: return MarketBoardId.NsxMiningAndEnergy;
                                case Zenith.Market2Node.NsxCertifiedProperty: return MarketBoardId.NsxCertifiedProperty;
                                case Zenith.Market2Node.NsxProperty: return MarketBoardId.NsxProperty;
                                case Zenith.Market2Node.NsxRestricted: return MarketBoardId.NsxRestricted;
                                default:
                                    Logger.logDataError('ZCEMCMBNND77541', `${m2}: Using NSX Main`);
                                    return MarketBoardId.NsxMain;
                            }
                        case Zenith.Market1Node.SouthPacific:
                            switch (m2) {
                                case undefined:
                                    Logger.logDataError('ZCEMCMBNSPU33997', 'Using NSX Main');
                                    return MarketBoardId.NsxMain;
                                case Zenith.Market2Node.SouthPacificStockExchangeEquities: return MarketBoardId.SouthPacificStockExchangeEquities;
                                case Zenith.Market2Node.SouthPacificStockExchangeRestricted: return MarketBoardId.SouthPacificStockExchangeRestricted;
                                default:
                                    Logger.logDataError('ZCEMCMBNSPD23232', `${m2}: Using NSX Main`);
                                    return MarketBoardId.NsxMain;
                            }

                        default:
                            Logger.logDataError('ZCEMCMBND55558', `${m1}: Using NSX Main`);
                            return MarketBoardId.NsxMain;
                    }
                case ExchangeId.Nzx:
                    switch (m1) {
                        case Zenith.Market1Node.NzxMain:
                            switch (m2) {
                                case undefined:
                                    Logger.logDataError('ZCEMCMBZM66685', 'Using NZX Main');
                                    return MarketBoardId.NzxMainBoard;
                                case Zenith.Market2Node.NzxMainBoard_Alt: return MarketBoardId.NzxAlternate;
                                case Zenith.Market2Node.NzxNXT: return MarketBoardId.NzxNXT;
                                case Zenith.Market2Node.NzxSpec: return MarketBoardId.NzxSpec;
                                case Zenith.Market2Node.NzxFonterraShareholders: return MarketBoardId.NzxFonterraShareholders;
                                case Zenith.Market2Node.NzxIndex: return MarketBoardId.NzxIndex;
                                case Zenith.Market2Node.NzxDebt: return MarketBoardId.NzxDebt;
                                case Zenith.Market2Node.NzxAlternate: return MarketBoardId.NzxAlternate;
                                case Zenith.Market2Node.NzxDerivativeFutures: return MarketBoardId.NzxDerivativeFutures;
                                case Zenith.Market2Node.NzxDerivativeOptions: return MarketBoardId.NzxDerivativeOptions;
                                case Zenith.Market2Node.NzxIndexFutures: return MarketBoardId.NzxIndexFutures;
                                case Zenith.Market2Node.NzxFxDerivativeOptions: return MarketBoardId.NzxFxDerivativeOptions;
                                case Zenith.Market2Node.NzxFxDerivativeFutures: return MarketBoardId.NzxFxDerivativeFutures;
                                case Zenith.Market2Node.NzxFxEquityOptions: return MarketBoardId.NzxFxEquityOptions;
                                case Zenith.Market2Node.NzxFxIndexFutures: return MarketBoardId.NzxFxIndexFutures;
                                case Zenith.Market2Node.NzxFxMilkOptions: return MarketBoardId.NzxFxMilkOptions;
                                default:
                                    Logger.logDataError('ZCEMCMBNSPD23232', `${m2}: Using NSX Main`);
                                    return MarketBoardId.NsxMain;
                            }
                        case Zenith.Market1Node.NzxFxDerivative:
                            switch (m2) {
                                case undefined:
                                    Logger.logDataError('ZCEMCMBZF44886', 'Using NZX Derivative Options');
                                    return MarketBoardId.NzxFxDerivativeOptions;
                                case Zenith.Market2Node.NzxFxDerivativeOptions: return MarketBoardId.NzxFxDerivativeOptions;
                                case Zenith.Market2Node.NzxFxDerivativeFutures: return MarketBoardId.NzxFxDerivativeFutures;
                                case Zenith.Market2Node.NzxFxEquityOptions: return MarketBoardId.NzxFxEquityOptions;
                                case Zenith.Market2Node.NzxFxIndexFutures: return MarketBoardId.NzxFxIndexFutures;
                                case Zenith.Market2Node.NzxFxMilkOptions: return MarketBoardId.NzxFxMilkOptions;
                                case Zenith.Market2Node.NzxFxDS: return MarketBoardId.NzxFxDS;
                                case Zenith.Market2Node.NzxFxES: return MarketBoardId.NzxFxES;
                                case Zenith.Market2Node.NzxFxMS: return MarketBoardId.NzxFxMS;
                                default:
                                    Logger.logDataError('ZCEMCMBZF11188', `${m2}: Using NZX Derivative Options`);
                                    return MarketBoardId.NzxFxDerivativeOptions;
                            }
                        default:
                            Logger.logDataError('ZCEMCMBZD77559', `${m1}: Using NZX Main`);
                            return MarketBoardId.NzxMainBoard;
                    }
                case ExchangeId.Myx:
                    switch (m1) {
                        case Zenith.Market1Node.MyxNormal:
                            switch (m2) {
                                case Zenith.Market2Node.MyxNormalMarket: return MarketBoardId.MyxNormalMarket;
                                case Zenith.Market2Node.MyxIndexMarket: return MarketBoardId.MyxIndexMarket;
                                case Zenith.Market2Node.MyxDirectBusinessTransactionMarket: return MarketBoardId.MyxDirectBusinessTransactionMarket;
                                default:
                                    Logger.logDataError('ZCEMCMBIMYXN239987', `Unknown "${m2}": Using MYX Normal`);
                                    return MarketBoardId.MyxNormalMarket;
                            }
                        case Zenith.Market1Node.MyxBuyIn:
                            if (m2 !== undefined) {
                                Logger.logDataError('ZCEMCMBIMYXBI39286', `Unexpected "${m2}": Using MYX BuyIn`);
                            }
                            return MarketBoardId.MyxBuyInMarket;
                        case Zenith.Market1Node.MyxOddLot:
                            if (m2 !== undefined) {
                                Logger.logDataError('ZCEMCMBIMYXOL88453', `Unexpected "${m2}": Using MYX OddLot`);
                            }
                            return MarketBoardId.MyxOddLotMarket;
                        default:
                            Logger.logDataError('ZCEMCMBIMYXD12995', `Unsupported ${m1}: Using MYX Normal`);
                            return MarketBoardId.MyxNormalMarket;
                    }
                case ExchangeId.Ptx:
                    switch (m2) {
                        case undefined: return MarketBoardId.Ptx;
                        case Zenith.Market2Node.Ptx: return MarketBoardId.Ptx;
                        default:
                            throw new ZenithDataError(ExternalError.Code.ZCEMCMBP39394, `m1: "${m1}" m2: "${m2}"`);
                    }
                case ExchangeId.Fnsx:
                    switch (m2) {
                        case undefined: return MarketBoardId.Fnsx;
                        case Zenith.Market2Node.Fnsx: return MarketBoardId.Fnsx;
                        default:
                            throw new ZenithDataError(ExternalError.Code.ZCEMCMBFN39394, `m1: "${m1}" m2: "${m2}"`);
                    }
                default:
                    throw new ZenithDataError(ExternalError.Code.ZCEMCMBD56569, '');
            }
            /* eslint-enable max-len */
        }
    }

    export namespace ExchangeMarketBoardParser {
        enum ParseState {
            OutStart,
            InExchange,
            InM1,
            InM2,
            InEnvironment,
            OutFinished,
        }

        export class Components {
            exchange: Zenith.Exchange;
            m1: string;
            m2: string;
            environment: Zenith.ExchangeEnvironment;
        }

        export function parse(value: string): Components {
            // value = value.replace('[Demo][Demo]', '[Demo]'); // temporary till server fixed
            const result = new Components();
            let bldr = '';
            let state = ParseState.OutStart;

            for (let i = 0; i < value.length; i++) {
                switch (value[i]) {
                    case Zenith.marketDelimiter:
                        switch (state) {
                            case ParseState.OutStart:
                                state = ParseState.InM1;
                                break;
                            case ParseState.InExchange:
                                result.exchange = bldr as Zenith.Exchange;
                                bldr = '';
                                state = ParseState.InM1;
                                break;
                            case ParseState.InM1:
                                result.m1 = bldr;
                                bldr = '';
                                state = ParseState.InM2;
                                break;
                            case ParseState.InM2:
                                throw new ZenithDataStateError(ExternalError.Code.ZCEMPMMDM12953, `${value}`);
                            case ParseState.InEnvironment:
                                throw new ZenithDataStateError(ExternalError.Code.ZCEMPMMDE34499, `${value}`);
                            case ParseState.OutFinished:
                                throw new ZenithDataStateError(ExternalError.Code.ZCEMPMMDF22733, `${value}`);
                            default:
                                throw new UnreachableCaseError('ZCEMPMMDD48832', state);
                        }
                        break;

                    case Zenith.exchangeEnvironmentOpenChar:
                        switch (state) {
                            case ParseState.OutStart:
                                throw new ZenithDataStateError(ExternalError.Code.ZCEMPMEOO88447, `${value}`);
                            case ParseState.InExchange:
                                result.exchange = bldr as Zenith.Exchange;
                                bldr = '';
                                state = ParseState.InEnvironment;
                                break;
                            case ParseState.InM1:
                                result.m1 = bldr;
                                bldr = '';
                                state = ParseState.InEnvironment;
                                break;
                            case ParseState.InM2:
                                result.m2 = bldr;
                                bldr = '';
                                state = ParseState.InEnvironment;
                                break;
                            case ParseState.InEnvironment:
                                throw new ZenithDataStateError(ExternalError.Code.ZCEMPMEOE98166, `${value}`);
                            case ParseState.OutFinished:
                                throw new ZenithDataStateError(ExternalError.Code.ZCEMPMEOF77765, `${value}`);
                            default:
                                throw new UnreachableCaseError('ZCEMPMEOD23887', state);
                        }
                        break;

                    case Zenith.exchangeEnvironmentCloseChar:
                        switch (state) {
                            case ParseState.OutStart:
                                throw new ZenithDataStateError(ExternalError.Code.ZCEMPMECO55586, `${value}`);
                            case ParseState.InExchange:
                                throw new ZenithDataStateError(ExternalError.Code.ZCEMPMECE48883, `${value}`);
                            case ParseState.InM1:
                                throw new ZenithDataStateError(ExternalError.Code.ZCEMPMECM133398, `${value}`);
                            case ParseState.InM2:
                                throw new ZenithDataStateError(ExternalError.Code.ZCEMPMECM247766, `${value}`);
                            case ParseState.InEnvironment:
                                result.environment = bldr as Zenith.ExchangeEnvironment;
                                bldr = '';
                                state = ParseState.OutFinished;
                                break;
                            case ParseState.OutFinished:
                                throw new ZenithDataStateError(ExternalError.Code.ZCEMPMECF11187, `${value}`);
                            default:
                                throw new UnreachableCaseError('ZCEMPMEOD23887', state);
                        }
                        break;

                    default:
                        switch (state) {
                            case ParseState.OutStart:
                                bldr += value[i];
                                state = ParseState.InExchange;
                                break;
                            case ParseState.OutFinished:
                                throw new ZenithDataStateError(ExternalError.Code.ZCEMPMDFF37776, `${value}`);
                            default:
                                bldr += value[i];
                                break;
                        }
                        break;
                }
            }

            switch (state) {
                case ParseState.InExchange:
                    result.exchange = bldr as Zenith.Exchange;
                    break;
                case ParseState.InM1:
                    result.m1 = bldr;
                    break;
                case ParseState.InM2:
                    result.m2 = bldr;
                    break;
            }

            if (result.environment === undefined) {
                result.environment = Zenith.ExchangeEnvironment.Production;
            }

            return result;
        }
    }

    /*export namespace OrderDestination {
        export function toId(zenithTradingMarket: string): TOrderDestinationId | undefined {
            switch (zenithTradingMarket) {
                case Zenith.TradingMarket.AsxBookBuild: return undefined; // TODO:MED Is this a valid order destination?
                case Zenith.TradingMarket.AsxCentrePoint: return TOrderDestinationId.orddAsxCentrepoint;
                case Zenith.TradingMarket.AsxTradeMatch: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchDerivatives: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchEquity1: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchEquity2: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchEquity3: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchEquity4: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchEquity5: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchIndex: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchIndexDerivatives: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchInterestRate: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchPrivate: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchQuoteDisplayBoard: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchPractice: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchWarrants: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxPureMatchEquity1: return TOrderDestinationId.orddAsxPurematch;
                case Zenith.TradingMarket.AsxPureMatchEquity2: return TOrderDestinationId.orddAsxPurematch;
                case Zenith.TradingMarket.AsxPureMatchEquity3: return TOrderDestinationId.orddAsxPurematch;
                case Zenith.TradingMarket.AsxPureMatchEquity4: return TOrderDestinationId.orddAsxPurematch;
                case Zenith.TradingMarket.AsxPureMatchEquity5: return TOrderDestinationId.orddAsxPurematch;
                case Zenith.TradingMarket.AsxVolumeMatch: return undefined; // TODO:MED Is this a valid order destination?
                case Zenith.TradingMarket.ChixAustFarPoint: return TOrderDestinationId.orddChixAustFarPoint;
                case Zenith.TradingMarket.ChixAustLimit: return TOrderDestinationId.orddChixAustLimit;
                case Zenith.TradingMarket.ChixAustMarketOnClose: return TOrderDestinationId.orddChixAustMarketOnClose;
                case Zenith.TradingMarket.ChixAustMidPoint: return TOrderDestinationId.orddChixAustMidPoint;
                case Zenith.TradingMarket.ChixAustNearPoint: return TOrderDestinationId.orddChixAustNearPoint;
                case Zenith.TradingMarket.NsxMain: return TOrderDestinationId.orddNsx;
                case Zenith.TradingMarket.NsxCommunityBanks: return TOrderDestinationId.orddNsx;
                case Zenith.TradingMarket.NsxIndustrial: return TOrderDestinationId.orddNsx;
                case Zenith.TradingMarket.NsxDebt: return TOrderDestinationId.orddNsx;
                case Zenith.TradingMarket.NsxMiningAndEnergy: return TOrderDestinationId.orddNsx;
                case Zenith.TradingMarket.NsxCertifiedProperty: return TOrderDestinationId.orddNsx;
                case Zenith.TradingMarket.NsxProperty: return TOrderDestinationId.orddNsx;
                case Zenith.TradingMarket.NsxRestricted: return TOrderDestinationId.orddNsx;
                case Zenith.TradingMarket.SimVenture: return TOrderDestinationId.orddSimVenture;
                case Zenith.TradingMarket.SouthPacificStockExchangeEquities: return TOrderDestinationId.orddSouthPacific;
                case Zenith.TradingMarket.SouthPacificStockExchangeRestricted: return TOrderDestinationId.orddSouthPacific;
                case Zenith.TradingMarket.NzxMainBoard: return undefined; // TODO:MED Is this a valid order destination?
                case Zenith.TradingMarket.NzxMainBoard_Alt: return undefined;
                case Zenith.TradingMarket.NzxNXT: return undefined;
                case Zenith.TradingMarket.NzxSpec: return undefined;
                case Zenith.TradingMarket.NzxFonterraShareholders: return undefined;
                case Zenith.TradingMarket.NzxIndex: return undefined;
                case Zenith.TradingMarket.NzxDebt: return undefined;
                case Zenith.TradingMarket.NzxAlternate: return undefined;
                case Zenith.TradingMarket.NzxDerivativeFutures: return undefined;
                case Zenith.TradingMarket.NzxDerivativeOptions: return undefined;
                case Zenith.TradingMarket.NzxIndexFutures: return undefined;
                case Zenith.TradingMarket.NzxFxDerivativeOptions: return undefined;
                case Zenith.TradingMarket.NzxFxDerivativeFutures: return undefined;
                case Zenith.TradingMarket.NzxFxEquityOptions: return undefined;
                case Zenith.TradingMarket.NzxFxIndexFutures: return undefined;
                case Zenith.TradingMarket.NzxFxMilkOptions: return undefined;
                case Zenith.TradingMarket.AsxBookBuildDemo: return undefined; // TODO:MED Is this a valid order destination?
                case Zenith.TradingMarket.AsxCentrePointDemo: return TOrderDestinationId.orddAsxCentrepointDemo;
                case Zenith.TradingMarket.AsxTradeMatchDemo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchDerivativesDemo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchEquity1Demo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchEquity2Demo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchEquity3Demo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchEquity4Demo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchEquity5Demo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchIndexDemo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchIndexDerivativesDemo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchInterestRateDemo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchPrivateDemo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchQuoteDisplayBoardDemo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchPracticeDemo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchWarrantsDemo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxPureMatchEquity1Demo: return TOrderDestinationId.orddAsxPurematchDemo;
                case Zenith.TradingMarket.AsxPureMatchEquity2Demo: return TOrderDestinationId.orddAsxPurematchDemo;
                case Zenith.TradingMarket.AsxPureMatchEquity3Demo: return TOrderDestinationId.orddAsxPurematchDemo;
                case Zenith.TradingMarket.AsxPureMatchEquity4Demo: return TOrderDestinationId.orddAsxPurematchDemo;
                case Zenith.TradingMarket.AsxPureMatchEquity5Demo: return TOrderDestinationId.orddAsxPurematchDemo;
                case Zenith.TradingMarket.AsxVolumeMatchDemo: return undefined;  // TODO:MED Is this a valid order destination?
                case Zenith.TradingMarket.ChixAustFarPointDemo: return TOrderDestinationId.orddChixAustFarPointDemo;
                case Zenith.TradingMarket.ChixAustLimitDemo: return TOrderDestinationId.orddChixAustLimitDemo;
                case Zenith.TradingMarket.ChixAustMarketOnCloseDemo: return TOrderDestinationId.orddChixAustMarketOnCloseDemo;
                case Zenith.TradingMarket.ChixAustMidPointDemo: return TOrderDestinationId.orddChixAustMidPointDemo;
                case Zenith.TradingMarket.ChixAustNearPointDemo: return TOrderDestinationId.orddChixAustNearPointDemo;
                case Zenith.TradingMarket.NsxMainDemo: return TOrderDestinationId.orddNsxDemo;
                case Zenith.TradingMarket.NsxCommunityBanksDemo: return TOrderDestinationId.orddNsxDemo;
                case Zenith.TradingMarket.NsxIndustrialDemo: return TOrderDestinationId.orddNsxDemo;
                case Zenith.TradingMarket.NsxDebtDemo: return TOrderDestinationId.orddNsxDemo;
                case Zenith.TradingMarket.NsxMiningAndEnergyDemo: return TOrderDestinationId.orddNsxDemo;
                case Zenith.TradingMarket.NsxCertifiedPropertyDemo: return TOrderDestinationId.orddNsxDemo;
                case Zenith.TradingMarket.NsxPropertyDemo: return TOrderDestinationId.orddNsxDemo;
                case Zenith.TradingMarket.NsxRestrictedDemo: return TOrderDestinationId.orddNsxDemo;
                case Zenith.TradingMarket.SimVentureDemo: return TOrderDestinationId.orddSimVentureDemo;
                case Zenith.TradingMarket.SouthPacificStockExchangeEquitiesDemo: return TOrderDestinationId.orddSouthPacificDemo;
                case Zenith.TradingMarket.SouthPacificStockExchangeRestrictedDemo: return TOrderDestinationId.orddSouthPacificDemo;
                case Zenith.TradingMarket.NzxMainBoardDemo: return undefined; // TODO:MED Is this a valid order destination?
                case Zenith.TradingMarket.NzxMainBoardDemo_Alt: return undefined;
                case Zenith.TradingMarket.NzxNXTDemo: return undefined;
                case Zenith.TradingMarket.NzxSpecDemo: return undefined;
                case Zenith.TradingMarket.NzxFonterraShareholdersDemo: return undefined;
                case Zenith.TradingMarket.NzxIndexDemo: return undefined;
                case Zenith.TradingMarket.NzxDebtDemo: return undefined;
                case Zenith.TradingMarket.NzxAlternateDemo: return undefined;
                case Zenith.TradingMarket.NzxDerivativeFuturesDemo: return undefined;
                case Zenith.TradingMarket.NzxDerivativeOptionsDemo: return undefined;
                case Zenith.TradingMarket.NzxIndexFuturesDemo: return undefined;
                case Zenith.TradingMarket.NzxFxDerivativeOptionsDemo: return undefined;
                case Zenith.TradingMarket.NzxFxDerivativeFuturesDemo: return undefined;
                case Zenith.TradingMarket.NzxFxEquityOptionsDemo: return undefined;
                case Zenith.TradingMarket.NzxFxIndexFuturesDemo: return undefined;
                case Zenith.TradingMarket.NzxFxMilkOptionsDemo: return undefined;
                case Zenith.TradingMarket.PtxDemo: return undefined;
                // TODO:MED Add support for two more market boards.
                // - ASX:TM:AD = ASX TradeMatch American derivatives.
                // - ASX:TM:ED = ASX TradeMatch European derivatives.
                //case ZenithTradingMarket.NzxMainBoard:     return TMarketBoardId.mktbNzxMainBoard;
                //case ZenithTradingMarket.NzxMainBoard_Alt: return TMarketBoardId.mktbNzxMainBoard;
                //case ZenithTradingMarket.NzxMainBoardDemo:     return TMarketBoardId.mktbNzxMainBoardDemo;
                //case ZenithTradingMarket.NzxMainBoardDemo_Alt: return TMarketBoardId.mktbNzxMainBoardDemo;
                default:
                    // TODO:MED Raising exceptions when unable to convert the value is inconvenient.
                    // It however is the dominant pattern here right now. What to do?
                    console.warn(`Condition not handled [ID:47823164655] Value: "${zenithTradingMarket}"`);
                    return undefined;
            }
        }

        export function fromId(orderDestination: TOrderDestinationId): Zenith.TradingMarket | undefined {
            switch (orderDestination) {
                case TOrderDestinationId.orddBestPrice:                 return undefined;
                case TOrderDestinationId.orddMyxNormal:                 return undefined;
                case TOrderDestinationId.orddMyxOddLot:                 return undefined;
                case TOrderDestinationId.orddMyxBuyIn:                  return undefined;
                case TOrderDestinationId.orddAsxTradeMatch:             return Zenith.TradingMarket.AsxTradeMatch;
                case TOrderDestinationId.orddAsxTradeMatchDelayed:      return undefined;
                case TOrderDestinationId.orddAsxTradeMatchDemo:         return Zenith.TradingMarket.AsxTradeMatchDemo;
                case TOrderDestinationId.orddAsxCentrepoint:            return Zenith.TradingMarket.AsxCentrePoint;
                case TOrderDestinationId.orddAsxCentrepointDemo:        return Zenith.TradingMarket.AsxCentrePointDemo;
                case TOrderDestinationId.orddAsxPurematch:              return Zenith.TradingMarket.AsxPureMatch;
                case TOrderDestinationId.orddAsxPurematchDemo:          return Zenith.TradingMarket.AsxPureMatchDemo;
                case TOrderDestinationId.orddChixAustLimit:             return Zenith.TradingMarket.ChixAustLimit;
                case TOrderDestinationId.orddChixAustLimitDemo:         return Zenith.TradingMarket.ChixAustLimitDemo;
                case TOrderDestinationId.orddChixAustNearPoint:         return Zenith.TradingMarket.ChixAustNearPoint;
                case TOrderDestinationId.orddChixAustNearPointDemo:     return Zenith.TradingMarket.ChixAustNearPointDemo;
                case TOrderDestinationId.orddChixAustFarPoint:          return Zenith.TradingMarket.ChixAustFarPoint;
                case TOrderDestinationId.orddChixAustFarPointDemo:      return Zenith.TradingMarket.ChixAustFarPointDemo;
                case TOrderDestinationId.orddChixAustMidPoint:          return Zenith.TradingMarket.ChixAustMidPoint;
                case TOrderDestinationId.orddChixAustMidPointDemo:      return Zenith.TradingMarket.ChixAustMidPointDemo;
                case TOrderDestinationId.orddChixAustMarketOnClose:     return Zenith.TradingMarket.ChixAustMarketOnClose;
                case TOrderDestinationId.orddChixAustMarketOnCloseDemo: return Zenith.TradingMarket.ChixAustMarketOnCloseDemo;
                case TOrderDestinationId.orddNsx:                       return Zenith.TradingMarket.NsxMain;
                case TOrderDestinationId.orddNsxDemo:                   return Zenith.TradingMarket.NsxMainDemo;
                case TOrderDestinationId.orddSimVenture:                return Zenith.TradingMarket.SimVenture;
                case TOrderDestinationId.orddSimVentureDemo:            return Zenith.TradingMarket.SimVentureDemo;
                case TOrderDestinationId.orddSouthPacific:              return Zenith.TradingMarket.SouthPacificStockExchange;
                case TOrderDestinationId.orddSouthPacificDemo:          return Zenith.TradingMarket.SouthPacificStockExchangeDemo;
                default:
                    throw new UnreachableCaseError('ID:25603102541', orderDestination);
            }
        }

        // #Question: TODO:LOW The location of this method doesn't seem quite right. Is there a better spot?
        export function toZenithExchange(orderDestination: TOrderDestinationId): Zenith.Exchange | undefined {
            switch (orderDestination) {
                case TOrderDestinationId.orddBestPrice:                 return undefined;
                case TOrderDestinationId.orddMyxNormal:                 return undefined;
                case TOrderDestinationId.orddMyxOddLot:                 return undefined;
                case TOrderDestinationId.orddMyxBuyIn:                  return undefined;
                case TOrderDestinationId.orddAsxTradeMatch:             return Zenith.Exchange.ASX;
                case TOrderDestinationId.orddAsxTradeMatchDelayed:      return Zenith.Exchange.AsxDelayed;
                case TOrderDestinationId.orddAsxTradeMatchDemo:         return Zenith.Exchange.AsxDemo;
                case TOrderDestinationId.orddAsxCentrepoint:            return Zenith.Exchange.ASX;
                case TOrderDestinationId.orddAsxCentrepointDemo:        return Zenith.Exchange.AsxDemo;
                case TOrderDestinationId.orddAsxPurematch:              return Zenith.Exchange.ASX;
                case TOrderDestinationId.orddAsxPurematchDemo:          return Zenith.Exchange.AsxDemo;
                case TOrderDestinationId.orddChixAustLimit:             return Zenith.Exchange.Cxa;
                case TOrderDestinationId.orddChixAustLimitDemo:         return Zenith.Exchange.CxaDemo;
                case TOrderDestinationId.orddChixAustNearPoint:         return Zenith.Exchange.Cxa;
                case TOrderDestinationId.orddChixAustNearPointDemo:     return Zenith.Exchange.CxaDemo;
                case TOrderDestinationId.orddChixAustFarPoint:          return Zenith.Exchange.Cxa;
                case TOrderDestinationId.orddChixAustFarPointDemo:      return Zenith.Exchange.CxaDemo;
                case TOrderDestinationId.orddChixAustMidPoint:          return Zenith.Exchange.Cxa;
                case TOrderDestinationId.orddChixAustMidPointDemo:      return Zenith.Exchange.CxaDemo;
                case TOrderDestinationId.orddChixAustMarketOnClose:     return Zenith.Exchange.Cxa;
                case TOrderDestinationId.orddChixAustMarketOnCloseDemo: return Zenith.Exchange.CxaDemo;
                case TOrderDestinationId.orddNsx:                       return Zenith.Exchange.Nsx;
                case TOrderDestinationId.orddNsxDemo:                   return Zenith.Exchange.NsxDemo;
                case TOrderDestinationId.orddSimVenture:                return Zenith.Exchange.Nsx;
                case TOrderDestinationId.orddSimVentureDemo:            return Zenith.Exchange.NsxDemo;
                case TOrderDestinationId.orddSouthPacific:              return Zenith.Exchange.Nsx;
                case TOrderDestinationId.orddSouthPacificDemo:          return Zenith.Exchange.NsxDemo;
                default:
                    throw new UnreachableCaseError('ID:25603102541', orderDestination);
            }
        }
    }*/

    export namespace Feed {
        export function toAdi(zenithFeed: Zenith.ZenithController.Feeds.Feed) {
            const zenithClass = zenithFeed.Class;
            const classId = FeedClass.toId(zenithClass);
            if (classId === undefined) {
                throw new ZenithDataError(ExternalError.Code.ZCFTACF874444934239, JSON.stringify(zenithFeed));
            } else {
                const zenithName = zenithFeed.Name;
                if (zenithName === undefined) {
                    throw new ZenithDataError(ExternalError.Code.ZCFTANU874444934239, JSON.stringify(zenithFeed));
                } else {
                    let feedId: FeedId;
                    let environmentId: ExchangeEnvironmentId | undefined;
                    switch (classId) {
                        case FeedClassId.Authority: {
                            feedId = AuthorityFeed.toId(zenithName as Zenith.ZenithController.Feeds.AuthorityFeed);
                            environmentId = undefined;
                            break;
                        }
                        case FeedClassId.Trading: {
                            const environmentedFeedId = EnvironmentedTradingFeed.toId(zenithName);
                            environmentId = environmentedFeedId.environmentId;
                            feedId = environmentedFeedId.feedId;
                            break;
                        }
                        case FeedClassId.Market: {
                            const environmentedMarketId = EnvironmentedMarket.toId(zenithName);
                            environmentId = environmentedMarketId.environmentId;
                            const marketId = environmentedMarketId.marketId;
                            feedId = MarketInfo.idToFeedId(marketId);
                            break;
                        }
                        case FeedClassId.News: {
                            const environmentedFeedId = EnvironmentedNewsFeed.toId(zenithName);
                            environmentId = environmentedFeedId.environmentId;
                            feedId = environmentedFeedId.feedId;
                            break;
                        }
                        default:
                            throw new UnreachableCaseError('ZCFTACU688300211843', classId);
                    }

                    if (feedId === FeedId.Null) {
                        throw new AssertInternalError('ZCFTACFNUL9688300211843', JSON.stringify(zenithFeed));
                    } else {
                        const zenithStatus = zenithFeed.Status;
                        const statusId = FeedStatus.toId(zenithStatus);
                        if (statusId === undefined) {
                            throw new ZenithDataError(ExternalError.Code.ZCFTASF874444934239, JSON.stringify(zenithFeed));
                        } else {
                            const result: FeedsDataMessage.Feed = {
                                id: feedId,
                                environmentId,
                                statusId,
                            };
                            return result;
                        }
                    }
                }
            }
        }

        export namespace FeedClass {
            export function toId(value: Zenith.ZenithController.Feeds.FeedClass) {
                switch (value) {
                    case Zenith.ZenithController.Feeds.FeedClass.Authority: return FeedClassId.Authority;
                    case Zenith.ZenithController.Feeds.FeedClass.Market: return FeedClassId.Market;
                    case Zenith.ZenithController.Feeds.FeedClass.News: return FeedClassId.News;
                    case Zenith.ZenithController.Feeds.FeedClass.Trading: return FeedClassId.Trading;
                    default:
                        throw new UnreachableCaseError('ZCFFCU0092288573', value);
                }
            }
        }

        export namespace EnvironmentedTradingFeed {
            export function toId(environmentedName: string): EnvironmentedFeedId {
                const environmentOpenerPos = environmentedName.indexOf(Zenith.exchangeEnvironmentOpenChar);
                let environmentId: ExchangeEnvironmentId;
                let name: string;
                if (environmentOpenerPos < 0) {
                    name = environmentedName;
                    environmentId = ExchangeEnvironmentId.Production;
                } else {
                    name = environmentedName.substr(0, environmentOpenerPos);
                    const lastCharPos = environmentedName.length - 1;
                    if (environmentedName[lastCharPos] !== Zenith.exchangeEnvironmentCloseChar) {
                        throw new ZenithDataError(ExternalError.Code.ZCFETFTIE11104419948, environmentedName);
                    } else {
                        const environmentAsStrLength = lastCharPos - environmentOpenerPos - 1;
                        const environmentAsStr = environmentedName.substr(environmentOpenerPos + 1, environmentAsStrLength);
                        environmentId = ExchangeEnvironment.toId(environmentAsStr as Zenith.ExchangeEnvironment);
                    }
                }

                const feedId = TradingFeed.toFeedId(name as Zenith.ZenithController.Feeds.TradingFeed);

                if (feedId === undefined) {
                    throw new ZenithDataError(ExternalError.Code.ZCFETFTIF11104419948, environmentedName);
                } else {
                    return {
                        environmentId,
                        feedId,
                    };
                }
            }

            export function fromId(feedId: FeedId): string {
                const zenithFeedName = TradingFeed.fromFeedId(feedId);
                return zenithFeedName + ExchangeEnvironment.enclosedFromResolvedId(undefined);
            }
        }

        export namespace TradingFeed {
            export function toFeedId(value: Zenith.ZenithController.Feeds.TradingFeed) {
                switch (value) {
                    case Zenith.ZenithController.Feeds.TradingFeed.Malacca: return FeedId.Trading_Malacca;
                    case Zenith.ZenithController.Feeds.TradingFeed.Motif: return FeedId.Trading_Motif;
                    default:
                        throw new UnreachableCaseError('ZCFTFTFIU787833333952', value);
                }
            }

            export function fromFeedId(value: FeedId) {
                switch (value) {
                    case FeedId.Trading_Malacca: return Zenith.ZenithController.Feeds.TradingFeed.Malacca;
                    case FeedId.Trading_Motif: return Zenith.ZenithController.Feeds.TradingFeed.Motif;
                    default:
                        throw new AssertInternalError('ZCFTFFFIU7817833333952', FeedInfo.idToName(value));
                }
            }
        }

        export namespace EnvironmentedNewsFeed {
            export function toId(environmentedName: string): EnvironmentedFeedId {
                const environmentOpenerPos = environmentedName.indexOf(Zenith.exchangeEnvironmentOpenChar);
                let environmentId: ExchangeEnvironmentId;
                let name: string;
                if (environmentOpenerPos < 0) {
                    name = environmentedName;
                    environmentId = ExchangeEnvironmentId.Production;
                } else {
                    name = environmentedName.substr(0, environmentOpenerPos);
                    const lastCharPos = environmentedName.length - 1;
                    if (environmentedName[lastCharPos] !== Zenith.exchangeEnvironmentCloseChar) {
                        throw new ZenithDataError(ExternalError.Code.ZCFETFTIE11104419948, environmentedName);
                    } else {
                        const environmentAsStrLength = lastCharPos - environmentOpenerPos - 1;
                        const environmentAsStr = environmentedName.substr(environmentOpenerPos + 1, environmentAsStrLength);
                        environmentId = ExchangeEnvironment.toId(environmentAsStr as Zenith.ExchangeEnvironment);
                    }
                }

                const feedId = NewsFeed.toFeedId(name as Zenith.ZenithController.Feeds.NewsFeed);

                if (feedId === undefined) {
                    throw new ZenithDataError(ExternalError.Code.ZCFENFTIU13104419948, environmentedName);
                } else {
                    return {
                        environmentId,
                        feedId,
                    };
                }
            }
        }

        export namespace NewsFeed {
            export function toFeedId(value: Zenith.ZenithController.Feeds.NewsFeed) {
                switch (value) {
                    case Zenith.ZenithController.Feeds.NewsFeed.Asx: return FeedId.News_Asx;
                    case Zenith.ZenithController.Feeds.NewsFeed.Nsx: return FeedId.News_Nsx;
                    case Zenith.ZenithController.Feeds.NewsFeed.Nzx: return FeedId.News_Nzx;
                    case Zenith.ZenithController.Feeds.NewsFeed.Myx: return FeedId.News_Myx;
                    case Zenith.ZenithController.Feeds.NewsFeed.Ptx: return FeedId.News_Ptx;
                    case Zenith.ZenithController.Feeds.NewsFeed.Fnsx: return FeedId.News_Fnsx;
                    default:
                        throw new UnreachableCaseError('ZCFNFTFIU987833333952', value);
                }
            }
        }

        export namespace AuthorityFeed {
            export function toId(value: Zenith.ZenithController.Feeds.AuthorityFeed) {
                switch (value) {
                    case Zenith.ZenithController.Feeds.AuthorityFeed.TradingAuthority: return FeedId.Authority_Trading;
                    case Zenith.ZenithController.Feeds.AuthorityFeed.Watchlist: return FeedId.Authority_Watchlist;
                    default:
                        throw new UnreachableCaseError('ZCFTFTIU787833333952', value);
                }
            }
        }
    }

    export namespace TradingState {
        export function toAdi(value: Zenith.MarketController.TradingStates.TradeState) {
            const result: AdiTradingState = {
                name: value.Name,
                allowIds: toAllowIdArray(value.Allows),
                reasonId: Reason.toId(value.Reason)
            };

            return result;
        }

        function toAllowIdArray(value: string) {
            const array = value.split(Zenith.commaTextSeparator);
            if (array.length === 0) {
                return [];
            } else {
                const allow0 = array[0].trim() as Zenith.MarketController.TradingStates.Allow;
                let result = Allow.toIdArray(allow0);
                for (let i = 1; i < array.length; i++) {
                    const allow = array[i].trim() as Zenith.MarketController.TradingStates.Allow;
                    const elementIdArray = Allow.toIdArray(allow);
                    result = concatenateArrayUniquely(result, elementIdArray);
                }

                return result;
            }
        }

        namespace Allow {
            export function toIdArray(value: Zenith.MarketController.TradingStates.Allow) {
                switch (value) {
                    case Zenith.MarketController.TradingStates.Allow.None: return [];
                    case Zenith.MarketController.TradingStates.Allow.OrderPlace: return [AdiTradingState.AllowId.OrderPlace];
                    case Zenith.MarketController.TradingStates.Allow.OrderAmend: return [AdiTradingState.AllowId.OrderAmend];
                    case Zenith.MarketController.TradingStates.Allow.OrderCancel: return [AdiTradingState.AllowId.OrderCancel];
                    case Zenith.MarketController.TradingStates.Allow.OrderMove: return [AdiTradingState.AllowId.OrderMove];
                    case Zenith.MarketController.TradingStates.Allow.Match: return [AdiTradingState.AllowId.Match];
                    case Zenith.MarketController.TradingStates.Allow.ReportCancel: return [AdiTradingState.AllowId.ReportCancel];
                    case Zenith.MarketController.TradingStates.Allow.OrdersOnly:
                        return [
                            AdiTradingState.AllowId.OrderPlace,
                            AdiTradingState.AllowId.OrderAmend,
                            AdiTradingState.AllowId.OrderCancel,
                            AdiTradingState.AllowId.OrderMove,
                        ];
                    case Zenith.MarketController.TradingStates.Allow.All:
                        return [
                            AdiTradingState.AllowId.OrderPlace,
                            AdiTradingState.AllowId.OrderAmend,
                            AdiTradingState.AllowId.OrderCancel,
                            AdiTradingState.AllowId.OrderMove,
                            AdiTradingState.AllowId.Match,
                            AdiTradingState.AllowId.ReportCancel,
                        ];
                    default:
                        throw new UnreachableCaseError(`ZCTSATI29584776`, value);
                }
            }
        }

        namespace Reason {
            export function toId(value: Zenith.MarketController.TradingStates.Reason) {
                switch (value) {
                    case Zenith.MarketController.TradingStates.Reason.Unknown: return AdiTradingState.ReasonId.Unknown;
                    case Zenith.MarketController.TradingStates.Reason.Normal: return AdiTradingState.ReasonId.Normal;
                    case Zenith.MarketController.TradingStates.Reason.Suspend: return AdiTradingState.ReasonId.Suspend;
                    case Zenith.MarketController.TradingStates.Reason.TradingHalt: return AdiTradingState.ReasonId.TradingHalt;
                    case Zenith.MarketController.TradingStates.Reason.NewsRelease: return AdiTradingState.ReasonId.NewsRelease;
                    default:
                        throw new UnreachableCaseError(`ZCTSRTI118693`, value);
                }
            }
        }
    }

    export namespace MarketState {
        export function toAdi(zenithState: Zenith.MarketController.Markets.MarketState) {
            const environmentedMarketId = ZenithConvert.EnvironmentedMarket.toId(zenithState.Code);

            let tradingDate: SourceTzOffsetDate | undefined;
            if (zenithState.TradingDate !== undefined) {
                tradingDate = ZenithConvert.Date.DateYYYYMMDD.toSourceTzOffsetDate(zenithState.TradingDate);
            }

            let marketTime: SourceTzOffsetDateTime | undefined;
            if (zenithState.MarketTime !== undefined) {
                marketTime = ZenithConvert.Date.DateTimeIso8601.toSourceTzOffsetDateTime(zenithState.MarketTime);
                if (marketTime === undefined) {
                    throw new ZenithDataError(ExternalError.Code.ZCMSMT9834447361, zenithState.MarketTime);
                }
            }

            let status: string | undefined;
            if (zenithState.Status !== undefined) {
                status = zenithState.Status;
            }

            let tradingMarkets: MarketsDataMessage.TradingMarketBoard[] | undefined;
            if (zenithState.States !== undefined) {
                tradingMarkets = TradingMarketState.toTradingMarketBoards(zenithState.States);
            }

            const result: MarketsDataMessage.Market = {
                code: zenithState.Code,
                marketId: environmentedMarketId.marketId,
                environmentId: environmentedMarketId.environmentId,
                feedStatusId: ZenithConvert.FeedStatus.toId(zenithState.Feed),
                tradingDate,
                marketTime,
                status,
                tradingMarketBoards: tradingMarkets,
            };

            return result;
        }

        namespace TradingMarketState {
            export function toTradingMarketBoards(zenithStates: Zenith.MarketController.Markets.TradingMarketState[]) {
                const result = new Array<MarketsDataMessage.TradingMarketBoard>(zenithStates.length);

                for (let index = 0; index < zenithStates.length; index++) {
                    const environmentedMarketBoardId = ZenithConvert.EnvironmentedMarketBoard.toId(zenithStates[index].Name);

                    const state: MarketsDataMessage.TradingMarketBoard = {
                        id: environmentedMarketBoardId.marketBoardId,
                        environmentId: environmentedMarketBoardId.environmentId,
                        status: zenithStates[index].Status,
                    };

                    result[index] = state;
                }

                return result;
            }
        }
    }

    export namespace EquityOrderType {
        export function toId(value: Zenith.EquityOrderType): OrderTypeId {
            switch (value) {
                case Zenith.EquityOrderType.Limit: return OrderTypeId.Limit;
                case Zenith.EquityOrderType.Best: return OrderTypeId.Best;
                case Zenith.EquityOrderType.Market: return OrderTypeId.Market;
                case Zenith.EquityOrderType.MarketToLimit: return OrderTypeId.MarketToLimit;
                case Zenith.EquityOrderType.Unknown: return OrderTypeId.Unknown;
                default: throw new UnreachableCaseError('ZCEOTTI2755', value);
            }
        }

        export function fromId(value: OrderTypeId): Zenith.EquityOrderType {
            switch (value) {
                case OrderTypeId.Limit: return Zenith.EquityOrderType.Limit;
                case OrderTypeId.Best: return Zenith.EquityOrderType.Best;
                case OrderTypeId.Market: return Zenith.EquityOrderType.Market;
                case OrderTypeId.MarketToLimit: return Zenith.EquityOrderType.MarketToLimit;
                case OrderTypeId.Unknown: return Zenith.EquityOrderType.Unknown;
                default: throw new UnexpectedCaseError('ZCEOTFI2755', OrderType.idToName(value));
            }
        }
    }

    export namespace EquityOrderValidity {
        export function toId(value: Zenith.EquityOrderValidity): TimeInForceId {
            switch (value) {
                case Zenith.EquityOrderValidity.UntilCancel: return TimeInForceId.GoodTillCancel;
                case Zenith.EquityOrderValidity.FillAndKill: return TimeInForceId.FillAndKill;
                case Zenith.EquityOrderValidity.FillOrKill: return TimeInForceId.FillOrKill;
                case Zenith.EquityOrderValidity.AllOrNone: return TimeInForceId.AllOrNone;
                default: throw new UnreachableCaseError('ZCEOVTI9336', value);
            }
        }

        export function fromId(value: TimeInForceId): Zenith.EquityOrderValidity {
            switch (value) {
                case TimeInForceId.GoodTillCancel: return Zenith.EquityOrderValidity.UntilCancel;
                case TimeInForceId.FillAndKill: return Zenith.EquityOrderValidity.FillAndKill;
                case TimeInForceId.FillOrKill: return Zenith.EquityOrderValidity.FillOrKill;
                case TimeInForceId.AllOrNone: return Zenith.EquityOrderValidity.AllOrNone;
                case TimeInForceId.GoodTillDate:
                case TimeInForceId.Day:
                    return Zenith.EquityOrderValidity.UntilCancel; // need date
                case TimeInForceId.AtTheOpening:
                case TimeInForceId.AtTheClose:
                case TimeInForceId.GoodTillCrossing:
                    throw new UnexpectedCaseError('ZCEOVN6817734', `${value}`);
                default:
                    throw new UnreachableCaseError('ZCEOVFID583776', value);
            }
        }
    }

    export namespace OrderPriceUnitType {
        export function toId(value: Zenith.OrderPriceUnitType): OrderPriceUnitTypeId {
            switch (value) {
                case Zenith.OrderPriceUnitType.Currency: return OrderPriceUnitTypeId.Currency;
                case Zenith.OrderPriceUnitType.Units: return OrderPriceUnitTypeId.Units;
                default: throw new UnreachableCaseError('ZCOPUTTI8699', value);
            }
        }
        export function fromId(value: OrderPriceUnitTypeId): Zenith.OrderPriceUnitType {
            switch (value) {
                case OrderPriceUnitTypeId.Currency: return Zenith.OrderPriceUnitType.Currency;
                case OrderPriceUnitTypeId.Units: return Zenith.OrderPriceUnitType.Units;
                default: throw new UnreachableCaseError('ZCOPUTFI119857', value);
            }
        }
    }

    export namespace OrderRouteAlgorithm {
        export function toId(value: Zenith.OrderRouteAlgorithm): OrderRouteAlgorithmId {
            switch (value) {
                case Zenith.OrderRouteAlgorithm.Market: return OrderRouteAlgorithmId.Market;
                case Zenith.OrderRouteAlgorithm.BestMarket: return OrderRouteAlgorithmId.BestMarket;
                case Zenith.OrderRouteAlgorithm.Fix: return OrderRouteAlgorithmId.Fix;
                default: throw new UnreachableCaseError('ZCORATI1153', value);
            }
        }
    }

    export namespace OrderStyle {
        export function toId(value: Zenith.TradingController.OrderStyle) {
            return IvemClass.toId(value);
        }
        export function fromId(value: IvemClassId) {
            return IvemClass.fromId(value);
        }
    }

    export namespace OrderStatus {
        export function toAdi(value: Zenith.TradingController.OrderStatuses.Status) {
            const exchange = value.Exchange;
            let exchangeId: ExchangeId | undefined;
            let environmentId: ExchangeEnvironmentId | undefined;
            if (exchange === undefined) {
                exchangeId = undefined;
                environmentId = undefined;
            } else {
                const environmentedExchangeId = EnvironmentedExchange.toId(exchange);
                exchangeId = environmentedExchangeId.exchangeId;
                environmentId = environmentedExchangeId.environmentId;
            }

            const adiOrderStatus: AdiOrderStatus = {
                code: value.Code,
                exchangeId,
                environmentId,
                allowIds: toAllowIdArray(value.Allows),
                reasonIds: toReasonIdArray(value.Reason)
            };

            return adiOrderStatus;
        }

        function toAllowIdArray(value: string): AdiOrderStatus.AllowId[] {
            const array = value.split(Zenith.commaTextSeparator);
            if (array.length === 0) {
                return [];
            } else {
                const allow0 = array[0].trim() as Zenith.TradingController.OrderStatuses.Allow;
                let result = Allow.toIdArray(allow0);
                for (let i = 1; i < array.length; i++) {
                    const allow = array[i].trim() as Zenith.TradingController.OrderStatuses.Allow;
                    const elementIdArray = Allow.toIdArray(allow);
                    result = concatenateArrayUniquely(result, elementIdArray);
                }

                return result;
            }
        }

        function toReasonIdArray(value: string): AdiOrderStatus.ReasonId[] {
            const array = value.split(Zenith.commaTextSeparator);
            if (array.length === 0) {
                return [];
            } else {
                const reason0 = array[0].trim() as Zenith.TradingController.OrderStatuses.Reason;
                const result = [Reason.toId(reason0)];
                for (let i = 1; i < array.length; i++) {
                    const reason = array[i].trim() as Zenith.TradingController.OrderStatuses.Reason;
                    const id = Reason.toId(reason);
                    if (!result.includes(id)) {
                        result.push(id);
                    }
                }

                return result;
            }
        }

        namespace Allow {
            export function toIdArray(value: Zenith.TradingController.OrderStatuses.Allow) {
                switch (value) {
                    case Zenith.TradingController.OrderStatuses.Allow.None: return [];
                    case Zenith.TradingController.OrderStatuses.Allow.Trade: return [AdiOrderStatus.AllowId.Trade];
                    case Zenith.TradingController.OrderStatuses.Allow.Amend: return [AdiOrderStatus.AllowId.Amend];
                    case Zenith.TradingController.OrderStatuses.Allow.Cancel: return [AdiOrderStatus.AllowId.Cancel];
                    case Zenith.TradingController.OrderStatuses.Allow.Move: return [AdiOrderStatus.AllowId.Move];
                    case Zenith.TradingController.OrderStatuses.Allow.All:
                        return [AdiOrderStatus.AllowId.Trade, AdiOrderStatus.AllowId.Amend, AdiOrderStatus.AllowId.Cancel];
                    default:
                        throw new UnreachableCaseError(`ZCOSATI29584776`, value);
                }
            }
        }

        namespace Reason {
            export function toId(value: Zenith.TradingController.OrderStatuses.Reason) {
                switch (value) {
                    case Zenith.TradingController.OrderStatuses.Reason.Unknown: return AdiOrderStatus.ReasonId.Unknown;
                    case Zenith.TradingController.OrderStatuses.Reason.Normal: return AdiOrderStatus.ReasonId.Normal;
                    case Zenith.TradingController.OrderStatuses.Reason.Manual: return AdiOrderStatus.ReasonId.Manual;
                    case Zenith.TradingController.OrderStatuses.Reason.Abnormal: return AdiOrderStatus.ReasonId.Abnormal;
                    case Zenith.TradingController.OrderStatuses.Reason.Completed: return AdiOrderStatus.ReasonId.Completed;
                    case Zenith.TradingController.OrderStatuses.Reason.Waiting: return AdiOrderStatus.ReasonId.Waiting;
                    default:
                        throw new UnreachableCaseError(`ZCOSRTI118693`, value);
                }
            }
        }
    }

    export namespace HoldingStyle {
        export function toId(value: Zenith.TradingController.Holdings.HoldingStyle) {
            return IvemClass.toId(value);
        }
    }

    export namespace CallOrPut {
        export function toId(value: Zenith.CallOrPut): CallOrPutId {
            switch (value) {
                case Zenith.CallOrPut.Call: return CallOrPutId.Call;
                case Zenith.CallOrPut.Put: return CallOrPutId.Put;
                default:
                    throw new UnreachableCaseError('8305163948', value);
            }
        }
    }

    export namespace DepthDirection {
        export function toId(value: Zenith.MarketController.SearchSymbols.DepthDirection): DepthDirectionId {
            switch (value) {
                case Zenith.MarketController.SearchSymbols.DepthDirection.BidBelowAsk: return DepthDirectionId.BidBelowAsk;
                case Zenith.MarketController.SearchSymbols.DepthDirection.AskBelowBid: return DepthDirectionId.AskBelowBid;
                default:
                    throw new UnreachableCaseError('ZCDDTI77743', value);
            }
        }
    }

    export namespace ExerciseType {
        export function toId(value: Zenith.MarketController.SearchSymbols.FullDetail.ExerciseType): ExerciseTypeId | undefined {
            switch (value) {
                case Zenith.MarketController.SearchSymbols.FullDetail.ExerciseType.American: return ExerciseTypeId.American;
                case Zenith.MarketController.SearchSymbols.FullDetail.ExerciseType.Asian: return ExerciseTypeId.Asian;
                case Zenith.MarketController.SearchSymbols.FullDetail.ExerciseType.European: return ExerciseTypeId.European;
                case Zenith.MarketController.SearchSymbols.FullDetail.ExerciseType.Unknown: return undefined;
                default:
                    throw new UnreachableCaseError('ZCETTI38852', value);
            }
        }
    }

    export namespace SymbolClass {
        export function fromId(value: IvemClassId): Zenith.MarketController.SearchSymbols.Request.Class | undefined {
            switch (value) {
                case IvemClassId.Unknown: return undefined;
                case IvemClassId.Market: return Zenith.MarketController.SearchSymbols.Request.Class.Market;
                case IvemClassId.ManagedFund: return Zenith.MarketController.SearchSymbols.Request.Class.ManagedFund;
                default:
                    throw new UnreachableCaseError('ZCSCFI39852', value);
            }
        }
    }

    export namespace SymbolAlternateKey {
        export function fromId(value: SearchSymbolsDataDefinition.FieldId): Zenith.MarketController.SearchSymbols.AlternateKey | undefined {
            switch (value) {
                case SearchSymbolsDataDefinition.FieldId.Code: return undefined;
                case SearchSymbolsDataDefinition.FieldId.Name: return undefined;
                case SearchSymbolsDataDefinition.FieldId.Short: return Zenith.MarketController.SearchSymbols.AlternateKey.Short;
                case SearchSymbolsDataDefinition.FieldId.Long: return Zenith.MarketController.SearchSymbols.AlternateKey.Long;
                case SearchSymbolsDataDefinition.FieldId.Ticker: return Zenith.MarketController.SearchSymbols.AlternateKey.Ticker;
                case SearchSymbolsDataDefinition.FieldId.Gics: return Zenith.MarketController.SearchSymbols.AlternateKey.Gics;
                case SearchSymbolsDataDefinition.FieldId.Isin: return Zenith.MarketController.SearchSymbols.AlternateKey.Isin;
                case SearchSymbolsDataDefinition.FieldId.Base: return Zenith.MarketController.SearchSymbols.AlternateKey.Base;
                case SearchSymbolsDataDefinition.FieldId.Ric: return Zenith.MarketController.SearchSymbols.AlternateKey.Ric;
                default:
                    throw new UnreachableCaseError('ZCSAK08577', value);
            }
        }
    }

    export namespace SymbolConditionMatch {
        export function fromIds(ids: SearchSymbolsDataDefinition.Condition.MatchId[]): string {
            const count = ids.length;
            const matches = new Array<Zenith.MarketController.SearchSymbols.Condition.Match>(count);
            for (let i = 0; i < count; i++) {
                const id = ids[i];
                matches[i] = fromId(id);
            }

            return CommaText.fromStringArray(matches);
        }

        function fromId(value: SearchSymbolsDataDefinition.Condition.MatchId):
            Zenith.MarketController.SearchSymbols.Condition.Match
        {
            switch (value) {
                case SearchSymbolsDataDefinition.Condition.MatchId.fromStart:
                    return Zenith.MarketController.SearchSymbols.Condition.Match.FromStart;
                case SearchSymbolsDataDefinition.Condition.MatchId.fromEnd:
                    return Zenith.MarketController.SearchSymbols.Condition.Match.FromEnd;
                case SearchSymbolsDataDefinition.Condition.MatchId.exact:
                    return Zenith.MarketController.SearchSymbols.Condition.Match.Exact;
                default:
                    throw new UnreachableCaseError('ZCSCMFI08777', value);
            }
        }
    }

    export namespace SubscriptionData {
        function parseElement(value: Zenith.SubscriptionData): ZenithSubscriptionDataId[] {
            switch (value) {
                case Zenith.SubscriptionData.Asset: return [ZenithSubscriptionDataId.Asset];
                case Zenith.SubscriptionData.Trades: return [ZenithSubscriptionDataId.Trades];
                case Zenith.SubscriptionData.Depth: return [ZenithSubscriptionDataId.Depth];
                case Zenith.SubscriptionData.DepthFull: return [ZenithSubscriptionDataId.DepthFull];
                case Zenith.SubscriptionData.DepthShort: return [ZenithSubscriptionDataId.DepthShort];
                case Zenith.SubscriptionData.All: return [ZenithSubscriptionDataId.Asset,
                        ZenithSubscriptionDataId.Trades,
                        ZenithSubscriptionDataId.Depth,
                        ZenithSubscriptionDataId.DepthFull,
                        ZenithSubscriptionDataId.DepthShort
                    ];
                default:
                    throw new UnreachableCaseError('ZTSDPE49986', value);
            }
        }

        export function toIdArray(value: string): ZenithSubscriptionDataId[] {
            const elements = value.split(Zenith.commaTextSeparator);
            let result: ZenithSubscriptionDataId[] = [];
            for (let i = 0; i < elements.length; i++) {
                const idArray = parseElement(elements[i].trim() as Zenith.SubscriptionData);
                result = concatenateArrayUniquely(result, idArray);
            }
            return result;
        }
    }

    export namespace IvemClass {
        export function toId(value: Zenith.MarketController.SecurityClass): IvemClassId {
            switch (value) {
                case Zenith.MarketController.SecurityClass.Unknown: return IvemClassId.Unknown;
                case Zenith.MarketController.SecurityClass.Market: return IvemClassId.Market;
                case Zenith.MarketController.SecurityClass.ManagedFund: return IvemClassId.ManagedFund;
                default:
                    throw new UnreachableCaseError('ZCICTI6805163604', value);
            }
        }

        export function fromId(value: IvemClassId): Zenith.MarketController.SecurityClass {
            switch (value) {
                case IvemClassId.Unknown: return Zenith.MarketController.SecurityClass.Unknown;
                case IvemClassId.Market: return Zenith.MarketController.SecurityClass.Market;
                case IvemClassId.ManagedFund: return Zenith.MarketController.SecurityClass.ManagedFund;
                default:
                    throw new UnreachableCaseError('ZCICFI104610122649', value);
            }
        }
    }

    export namespace ChartHistory {
        export namespace Period {
            export function fromChartIntervalId(id: ChartIntervalId) {
                switch (id) {
                    case ChartIntervalId.OneMinute: return Zenith.MarketController.ChartHistory.PeriodTimeSpan.OneMinute;
                    case ChartIntervalId.FiveMinutes: return Zenith.MarketController.ChartHistory.PeriodTimeSpan.FiveMinutes;
                    case ChartIntervalId.FifteenMinutes: return Zenith.MarketController.ChartHistory.PeriodTimeSpan.FifteenMinutes;
                    case ChartIntervalId.ThirtyMinutes: return Zenith.MarketController.ChartHistory.PeriodTimeSpan.ThirtyMinutes;
                    case ChartIntervalId.OneDay: return Zenith.MarketController.ChartHistory.PeriodTimeSpan.OneDay;
                    default:
                        throw new UnreachableCaseError('CHPFCII8447448432', id);
                }
            }
        }
    }

    export namespace Side {
        export function toId(value: Zenith.Side): BidAskSideId {
            switch (value) {
                case Zenith.Side.Bid: return BidAskSideId.Bid;
                case Zenith.Side.Ask: return BidAskSideId.Ask;
                default:
                    throw new UnreachableCaseError('ZCSTI66333392', value);
            }
        }

        export function fromId(value: BidAskSideId): Zenith.Side {
            switch (value) {
                case BidAskSideId.Bid: return Zenith.Side.Bid;
                case BidAskSideId.Ask: return Zenith.Side.Ask;
                default:
                    throw new UnreachableCaseError('ZCSFI8860911', value);
            }
        }
    }

    /*export namespace MarketBoard {
        export function toId(value: string): MarketBoardId {
            switch (value) {
                case Zenith.TradingMarket.AsxBookBuild: return MarketBoardId.mktbAsxBookBuild;
                case Zenith.TradingMarket.AsxCentrePoint: return MarketBoardId.mktbAsxCentrePoint;
                case Zenith.TradingMarket.AsxTradeMatch: return MarketBoardId.mktbAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchDerivatives: return MarketBoardId.mktbAsxTradeMatchDerivatives;
                case Zenith.TradingMarket.AsxTradeMatchEquity1: return MarketBoardId.mktbAsxTradeMatchEquity1;
                case Zenith.TradingMarket.AsxTradeMatchEquity2: return MarketBoardId.mktbAsxTradeMatchEquity2;
                case Zenith.TradingMarket.AsxTradeMatchEquity3: return MarketBoardId.mktbAsxTradeMatchEquity3;
                case Zenith.TradingMarket.AsxTradeMatchEquity4: return MarketBoardId.mktbAsxTradeMatchEquity4;
                case Zenith.TradingMarket.AsxTradeMatchEquity5: return MarketBoardId.mktbAsxTradeMatchEquity5;
                case Zenith.TradingMarket.AsxTradeMatchIndex: return MarketBoardId.mktbAsxTradeMatchIndex;
                case Zenith.TradingMarket.AsxTradeMatchIndexDerivatives: return MarketBoardId.mktbAsxTradeMatchIndexDerivatives;
                case Zenith.TradingMarket.AsxTradeMatchInterestRate: return MarketBoardId.mktbAsxTradeMatchInterestRate;
                case Zenith.TradingMarket.AsxTradeMatchPrivate: return MarketBoardId.mktbAsxTradeMatchPrivate;
                case Zenith.TradingMarket.AsxTradeMatchQuoteDisplayBoard: return MarketBoardId.mktbAsxTradeMatchQuoteDisplayBoard;
                case Zenith.TradingMarket.AsxTradeMatchPractice: return MarketBoardId.mktbAsxTradeMatchPractice;
                case Zenith.TradingMarket.AsxTradeMatchWarrants: return MarketBoardId.mktbAsxTradeMatchWarrants;
                case Zenith.TradingMarket.AsxPureMatchEquity1: return MarketBoardId.mktbAsxPureMatchEquity1;
                case Zenith.TradingMarket.AsxPureMatchEquity2: return MarketBoardId.mktbAsxPureMatchEquity2;
                case Zenith.TradingMarket.AsxPureMatchEquity3: return MarketBoardId.mktbAsxPureMatchEquity3;
                case Zenith.TradingMarket.AsxPureMatchEquity4: return MarketBoardId.mktbAsxPureMatchEquity4;
                case Zenith.TradingMarket.AsxPureMatchEquity5: return MarketBoardId.mktbAsxPureMatchEquity5;
                case Zenith.TradingMarket.AsxVolumeMatch: return MarketBoardId.mktbAsxVolumeMatch;
                case Zenith.TradingMarket.ChixAustFarPoint: return MarketBoardId.mktbChixAustFarPoint;
                case Zenith.TradingMarket.ChixAustLimit: return MarketBoardId.mktbChixAustLimit;
                case Zenith.TradingMarket.ChixAustMarketOnClose: return MarketBoardId.mktbChixAustMarketOnClose;
                case Zenith.TradingMarket.ChixAustMidPoint: return MarketBoardId.mktbChixAustMidPoint;
                case Zenith.TradingMarket.ChixAustNearPoint: return MarketBoardId.mktbChixAustNearPoint;
                case Zenith.TradingMarket.NsxMain: return MarketBoardId.mktbNsxMain;
                case Zenith.TradingMarket.NsxCommunityBanks: return MarketBoardId.mktbNsxCommunityBanks;
                case Zenith.TradingMarket.NsxIndustrial: return MarketBoardId.mktbNsxIndustrial;
                case Zenith.TradingMarket.NsxDebt: return MarketBoardId.mktbNsxDebt;
                case Zenith.TradingMarket.NsxMiningAndEnergy: return MarketBoardId.mktbNsxMiningAndEnergy;
                case Zenith.TradingMarket.NsxCertifiedProperty: return MarketBoardId.mktbNsxCertifiedProperty;
                case Zenith.TradingMarket.NsxProperty: return MarketBoardId.mktbNsxProperty;
                case Zenith.TradingMarket.NsxRestricted: return MarketBoardId.mktbNsxRestricted;
                case Zenith.TradingMarket.SimVenture: return MarketBoardId.mktbSimVenture;
                case Zenith.TradingMarket.SouthPacificStockExchangeEquities: return MarketBoardId.mktbSouthPacificStockExchangeEquities;
                case Zenith.TradingMarket.SouthPacificStockExchangeRestricted: return MarketBoardId.mktbSouthPacificStockExchangeRestricted;
                case Zenith.TradingMarket.NzxMainBoard: return MarketBoardId.mktbNzxMainBoard;
                case Zenith.TradingMarket.NzxNXT: return MarketBoardId.mktbNzxNXT;
                case Zenith.TradingMarket.NzxSpec: return MarketBoardId.mktbNzxSpec;
                case Zenith.TradingMarket.NzxFonterraShareholders: return MarketBoardId.mktbNzxFonterraShareholders;
                case Zenith.TradingMarket.NzxIndex: return MarketBoardId.mktbNzxIndex;
                case Zenith.TradingMarket.NzxDebt: return MarketBoardId.mktbNzxDebt;
                case Zenith.TradingMarket.NzxAlternate: return MarketBoardId.mktbNzxAlternate;
                case Zenith.TradingMarket.NzxDerivativeFutures: return MarketBoardId.mktbNzxDerivativeFutures;
                case Zenith.TradingMarket.NzxDerivativeOptions: return MarketBoardId.mktbNzxDerivativeOptions;
                case Zenith.TradingMarket.NzxIndexFutures: return MarketBoardId.mktbNzxIndexFutures;
                case Zenith.TradingMarket.NzxFxDerivativeOptions: return MarketBoardId.mktbNzxFxDerivativeOptions;
                case Zenith.TradingMarket.NzxFxDerivativeFutures: return MarketBoardId.mktbNzxFxDerivativeFutures;
                case Zenith.TradingMarket.NzxFxEquityOptions: return MarketBoardId.mktbNzxFxEquityOptions;
                case Zenith.TradingMarket.NzxFxIndexFutures: return MarketBoardId.mktbNzxFxIndexFutures;
                case Zenith.TradingMarket.NzxFxMilkOptions: return MarketBoardId.mktbNzxFxMilkOptions;
                case Zenith.TradingMarket.AsxBookBuildDemo: return MarketBoardId.mktbAsxBookBuildDemo;
                case Zenith.TradingMarket.AsxCentrePointDemo: return MarketBoardId.mktbAsxCentrePointDemo;
                case Zenith.TradingMarket.AsxTradeMatchDemo: return MarketBoardId.mktbAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchDerivativesDemo: return MarketBoardId.mktbAsxTradeMatchDerivativesDemo;
                case Zenith.TradingMarket.AsxTradeMatchEquity1Demo: return MarketBoardId.mktbAsxTradeMatchEquity1Demo;
                case Zenith.TradingMarket.AsxTradeMatchEquity2Demo: return MarketBoardId.mktbAsxTradeMatchEquity2Demo;
                case Zenith.TradingMarket.AsxTradeMatchEquity3Demo: return MarketBoardId.mktbAsxTradeMatchEquity3Demo;
                case Zenith.TradingMarket.AsxTradeMatchEquity4Demo: return MarketBoardId.mktbAsxTradeMatchEquity4Demo;
                case Zenith.TradingMarket.AsxTradeMatchEquity5Demo: return MarketBoardId.mktbAsxTradeMatchEquity5Demo;
                case Zenith.TradingMarket.AsxTradeMatchIndexDemo: return MarketBoardId.mktbAsxTradeMatchIndexDemo;
                case Zenith.TradingMarket.AsxTradeMatchIndexDerivativesDemo: return MarketBoardId.mktbAsxTradeMatchIndexDerivativesDemo;
                case Zenith.TradingMarket.AsxTradeMatchInterestRateDemo: return MarketBoardId.mktbAsxTradeMatchInterestRateDemo;
                case Zenith.TradingMarket.AsxTradeMatchPrivateDemo: return MarketBoardId.mktbAsxTradeMatchPrivateDemo;
                case Zenith.TradingMarket.AsxTradeMatchQuoteDisplayBoardDemo: return MarketBoardId.mktbAsxTradeMatchQuoteDisplayBoardDemo;
                case Zenith.TradingMarket.AsxTradeMatchPracticeDemo: return MarketBoardId.mktbAsxTradeMatchPracticeDemo;
                case Zenith.TradingMarket.AsxTradeMatchWarrantsDemo: return MarketBoardId.mktbAsxTradeMatchWarrantsDemo;
                case Zenith.TradingMarket.AsxPureMatchEquity1Demo: return MarketBoardId.mktbAsxPureMatchEquity1Demo;
                case Zenith.TradingMarket.AsxPureMatchEquity2Demo: return MarketBoardId.mktbAsxPureMatchEquity2Demo;
                case Zenith.TradingMarket.AsxPureMatchEquity3Demo: return MarketBoardId.mktbAsxPureMatchEquity3Demo;
                case Zenith.TradingMarket.AsxPureMatchEquity4Demo: return MarketBoardId.mktbAsxPureMatchEquity4Demo;
                case Zenith.TradingMarket.AsxPureMatchEquity5Demo: return MarketBoardId.mktbAsxPureMatchEquity5Demo;
                case Zenith.TradingMarket.AsxVolumeMatchDemo: return MarketBoardId.mktbAsxVolumeMatchDemo;
                case Zenith.TradingMarket.ChixAustFarPointDemo: return MarketBoardId.mktbChixAustFarPointDemo;
                case Zenith.TradingMarket.ChixAustLimitDemo: return MarketBoardId.mktbChixAustLimitDemo;
                case Zenith.TradingMarket.ChixAustMarketOnCloseDemo: return MarketBoardId.mktbChixAustMarketOnCloseDemo;
                case Zenith.TradingMarket.ChixAustMidPointDemo: return MarketBoardId.mktbChixAustMidPointDemo;
                case Zenith.TradingMarket.ChixAustNearPointDemo: return MarketBoardId.mktbChixAustNearPointDemo;
                case Zenith.TradingMarket.NsxMainDemo: return MarketBoardId.mktbNsxMainDemo;
                case Zenith.TradingMarket.NsxCommunityBanksDemo: return MarketBoardId.mktbNsxCommunityBanksDemo;
                case Zenith.TradingMarket.NsxIndustrialDemo: return MarketBoardId.mktbNsxIndustrialDemo;
                case Zenith.TradingMarket.NsxDebtDemo: return MarketBoardId.mktbNsxDebtDemo;
                case Zenith.TradingMarket.NsxMiningAndEnergyDemo: return MarketBoardId.mktbNsxMiningAndEnergyDemo;
                case Zenith.TradingMarket.NsxCertifiedPropertyDemo: return MarketBoardId.mktbNsxCertifiedPropertyDemo;
                case Zenith.TradingMarket.NsxPropertyDemo: return MarketBoardId.mktbNsxPropertyDemo;
                case Zenith.TradingMarket.NsxRestrictedDemo: return MarketBoardId.mktbNsxRestrictedDemo;
                case Zenith.TradingMarket.SimVentureDemo: return MarketBoardId.mktbSimVentureDemo;
                case Zenith.TradingMarket.SouthPacificStockExchangeEquitiesDemo:
                    return MarketBoardId.mktbSouthPacificStockExchangeEquitiesDemo;
                case Zenith.TradingMarket.SouthPacificStockExchangeRestrictedDemo:
                    return MarketBoardId.mktbSouthPacificStockExchangeRestrictedDemo;
                case Zenith.TradingMarket.NzxMainBoardDemo: return MarketBoardId.mktbNzxMainBoardDemo;
                case Zenith.TradingMarket.NzxMainBoardDemo_Alt: return MarketBoardId.mktbNzxMainBoardDemo;
                case Zenith.TradingMarket.NzxNXTDemo: return MarketBoardId.mktbNzxNXTDemo;
                case Zenith.TradingMarket.NzxSpecDemo: return MarketBoardId.mktbNzxSpecDemo;
                case Zenith.TradingMarket.NzxFonterraShareholdersDemo: return MarketBoardId.mktbNzxFonterraShareholdersDemo;
                case Zenith.TradingMarket.NzxIndexDemo: return MarketBoardId.mktbNzxIndexDemo;
                case Zenith.TradingMarket.NzxDebtDemo: return MarketBoardId.mktbNzxDebtDemo;
                case Zenith.TradingMarket.NzxAlternateDemo: return MarketBoardId.mktbNzxAlternateDemo;
                case Zenith.TradingMarket.NzxDerivativeFuturesDemo: return MarketBoardId.mktbNzxDerivativeFuturesDemo;
                case Zenith.TradingMarket.NzxDerivativeOptionsDemo: return MarketBoardId.mktbNzxDerivativeOptionsDemo;
                case Zenith.TradingMarket.NzxIndexFuturesDemo: return MarketBoardId.mktbNzxIndexFuturesDemo;
                case Zenith.TradingMarket.NzxFxDerivativeOptionsDemo: return MarketBoardId.mktbNzxFxDerivativeOptionsDemo;
                case Zenith.TradingMarket.NzxFxDerivativeFuturesDemo: return MarketBoardId.mktbNzxFxDerivativeFuturesDemo;
                case Zenith.TradingMarket.NzxFxEquityOptionsDemo: return MarketBoardId.mktbNzxFxEquityOptionsDemo;
                case Zenith.TradingMarket.NzxFxIndexFuturesDemo: return MarketBoardId.mktbNzxFxIndexFuturesDemo;
                case Zenith.TradingMarket.NzxFxMilkOptionsDemo: return MarketBoardId.mktbNzxFxMilkOptionsDemo;
                case Zenith.TradingMarket.PtxDemo: return MarketBoardId.mktbPtxDemo;
                default:
                    throw new AdiError(`Condition not handled [ID:21415113829] Value: "${value}"`);
            }
        }
    }*/

    /*export namespace Market {
        export function toId(value: string): MarketId {
            ExchangeMarket.parseMarket();
            // #TestingRequired: Confirm that all market codes return values and do not throw exceptions.
            // #TestingRequired: Confirm all function results corrospond with those returned by IdToZenithMarketCode().
            switch (value) {
                case Zenith.Market.Asx: return MarketId.AsxTradeMatch;
                case Zenith.Market.AsxDelayed: return MarketId.AsxTradeMatchDelayed;
                case Zenith.Market.AsxDemo: return MarketId.AsxTradeMatchDemo;
                case Zenith.Market.AsxTradeMatch: return MarketId.AsxTradeMatch;
                case Zenith.Market.AsxTradeMatchDemo: return MarketId.AsxTradeMatchDemo;
                case Zenith.Market.AsxPureMatch: return MarketId.AsxPureMatch;
                case Zenith.Market.AsxPureMatchDemo: return MarketId.AsxPureMatchDemo;
                case Zenith.Market.Calastone: return MarketId.Calastone;
                case Zenith.Market.Cxa: return MarketId.ChixAustLimit; // TODO:MED #Question: Is this the right market?
                case Zenith.Market.CxaDemo: return MarketId.ChixAustLimitDemo; // TODO:MED #Question: Is this the right market?
                case Zenith.Market.Nsx: return MarketId.Nsx;
                case Zenith.Market.NsxDemo: return MarketId.NsxDemo;
                case Zenith.Market.Nzx: return MarketId.Nzx;
                case Zenith.Market.NzxDemo: return MarketId.NzxDemo;
                // TODO:MED Is 'PTX[Demo]' equivalent to 'PTX::PTX[Demo]'? If not, the following two lines are incorrect.
                case Zenith.Market.PtxDemo: return MarketId.PtxDemo;
                case Zenith.Market.PtxPtxDemo: return MarketId.PtxDemo;
                default:
                    throw new UnexpectedCaseError('ZCMTI22946', `${value}`);
            }
        }

        export function fromId(value: MarketId): string {
            // #TestingRequired: Confirm that all market codes return values and do not throw exceptions.
            // #TestingRequired: Confirm all function results corrospond with those returned by IdToZenithMarketCode().
            switch (value) {
                case MarketId.AsxTradeMatch: return Zenith.Market.Asx;
                case MarketId.AsxTradeMatchDelayed: return Zenith.Market.AsxDelayed;
                case MarketId.AsxTradeMatchDemo: return Zenith.Market.AsxDemo;
                case MarketId.AsxPureMatch: return Zenith.Market.AsxPureMatch;
                case MarketId.AsxPureMatchDemo: return Zenith.Market.AsxPureMatchDemo;
                case MarketId.Calastone: return Zenith.Market.Calastone;
                case MarketId.ChixAustLimit: return Zenith.Market.Cxa; // TODO:MED #Question: Is this the right market?
                case MarketId.ChixAustLimitDemo: return Zenith.Market.CxaDemo; // TODO:MED #Question: Is this the right market?
                case MarketId.Nsx: return Zenith.Market.Nsx;
                case MarketId.NsxDemo: return Zenith.Market.NsxDemo;
                case MarketId.Nzx: return Zenith.Market.Nzx;
                case MarketId.NzxDemo: return Zenith.Market.NzxDemo;
                case MarketId.PtxDemo: return Zenith.Market.PtxDemo;
                default:
                    throw new UnexpectedCaseError('ZCMFI54009', `${value}`);
            }
        }
    }*/

    export namespace CodeAndMarket {

        export function fromLitIvemId(litIvemId: LitIvemId): string {
            const marketId = litIvemId.litId;
            const exchangeEnvironmentId = litIvemId.environmentId;
            return litIvemId.code + '.' + EnvironmentedMarket.fromId(marketId, exchangeEnvironmentId);
        }
    }

    export namespace ShortSellType {
        export function fromId(value: OrderShortSellTypeId): Zenith.TradingController.PlaceOrder.ShortSellType {
            switch (value) {
                case OrderShortSellTypeId.ShortSell: return Zenith.TradingController.PlaceOrder.ShortSellType.ShortSell;
                case OrderShortSellTypeId.ShortSellExempt: return Zenith.TradingController.PlaceOrder.ShortSellType.ShortSellExempt;
                default: throw new UnreachableCaseError('ZCSSTFI555879', value);
            }
        }
    }

    export namespace OrderRequestError {
        export namespace Code {
            export function toId(value: Zenith.TradingController.OrderRequestError.Code): OrderRequestErrorCodeId {
                switch (value) {
                    case Zenith.TradingController.OrderRequestError.Code.Account: return OrderRequestErrorCodeId.Account;
                    case Zenith.TradingController.OrderRequestError.Code.Account_DailyNet: return OrderRequestErrorCodeId.Account_DailyNet;
                    case Zenith.TradingController.OrderRequestError.Code.Account_DailyGross:
                        return OrderRequestErrorCodeId.Account_DailyGross;
                    case Zenith.TradingController.OrderRequestError.Code.Authority: return OrderRequestErrorCodeId.Authority;
                    case Zenith.TradingController.OrderRequestError.Code.Connection: return OrderRequestErrorCodeId.Connection;
                    case Zenith.TradingController.OrderRequestError.Code.Details: return OrderRequestErrorCodeId.Details;
                    case Zenith.TradingController.OrderRequestError.Code.Error: return OrderRequestErrorCodeId.Error;
                    case Zenith.TradingController.OrderRequestError.Code.Exchange: return OrderRequestErrorCodeId.Exchange;
                    case Zenith.TradingController.OrderRequestError.Code.Internal: return OrderRequestErrorCodeId.Internal;
                    case Zenith.TradingController.OrderRequestError.Code.Internal_NotFound:
                        return OrderRequestErrorCodeId.Internal_NotFound;
                    case Zenith.TradingController.OrderRequestError.Code.Order: return OrderRequestErrorCodeId.Order;
                    case Zenith.TradingController.OrderRequestError.Code.Operation: return OrderRequestErrorCodeId.Operation;
                    case Zenith.TradingController.OrderRequestError.Code.Retry: return OrderRequestErrorCodeId.Retry;
                    case Zenith.TradingController.OrderRequestError.Code.Route: return OrderRequestErrorCodeId.Route;
                    case Zenith.TradingController.OrderRequestError.Code.Route_Algorithm: return OrderRequestErrorCodeId.Route_Algorithm;
                    case Zenith.TradingController.OrderRequestError.Code.Route_Market: return OrderRequestErrorCodeId.Route_Market;
                    case Zenith.TradingController.OrderRequestError.Code.Route_Symbol: return OrderRequestErrorCodeId.Route_Symbol;
                    case Zenith.TradingController.OrderRequestError.Code.Status: return OrderRequestErrorCodeId.Status;
                    case Zenith.TradingController.OrderRequestError.Code.Style: return OrderRequestErrorCodeId.Style;
                    case Zenith.TradingController.OrderRequestError.Code.Submitted: return OrderRequestErrorCodeId.Submitted;
                    case Zenith.TradingController.OrderRequestError.Code.Symbol: return OrderRequestErrorCodeId.Symbol;
                    case Zenith.TradingController.OrderRequestError.Code.Symbol_Authority: return OrderRequestErrorCodeId.Symbol_Authority;
                    case Zenith.TradingController.OrderRequestError.Code.Symbol_Status: return OrderRequestErrorCodeId.Symbol_Status;
                    case Zenith.TradingController.OrderRequestError.Code.TotalValue_Balance:
                        return OrderRequestErrorCodeId.TotalValue_Balance;
                    case Zenith.TradingController.OrderRequestError.Code.TotalValue_Maximum:
                        return OrderRequestErrorCodeId.TotalValue_Maximum;
                    case Zenith.TradingController.OrderRequestError.Code.ExpiryDate: return OrderRequestErrorCodeId.ExpiryDate;
                    case Zenith.TradingController.OrderRequestError.Code.HiddenQuantity: return OrderRequestErrorCodeId.HiddenQuantity;
                    case Zenith.TradingController.OrderRequestError.Code.HiddenQuantity_Symbol:
                        return OrderRequestErrorCodeId.HiddenQuantity_Symbol;
                    case Zenith.TradingController.OrderRequestError.Code.LimitPrice: return OrderRequestErrorCodeId.LimitPrice;
                    case Zenith.TradingController.OrderRequestError.Code.LimitPrice_Distance:
                        return OrderRequestErrorCodeId.LimitPrice_Distance;
                    case Zenith.TradingController.OrderRequestError.Code.LimitPrice_Given: return OrderRequestErrorCodeId.LimitPrice_Given;
                    case Zenith.TradingController.OrderRequestError.Code.LimitPrice_Maximum:
                        return OrderRequestErrorCodeId.LimitPrice_Maximum;
                    case Zenith.TradingController.OrderRequestError.Code.LimitPrice_Missing:
                        return OrderRequestErrorCodeId.LimitPrice_Missing;
                    case Zenith.TradingController.OrderRequestError.Code.MinimumQuantity: return OrderRequestErrorCodeId.MinimumQuantity;
                    case Zenith.TradingController.OrderRequestError.Code.MinimumQuantity_Symbol:
                        return OrderRequestErrorCodeId.MinimumQuantity_Symbol;
                    case Zenith.TradingController.OrderRequestError.Code.OrderType: return OrderRequestErrorCodeId.OrderType;
                    case Zenith.TradingController.OrderRequestError.Code.OrderType_Market: return OrderRequestErrorCodeId.OrderType_Market;
                    case Zenith.TradingController.OrderRequestError.Code.OrderType_Status: return OrderRequestErrorCodeId.OrderType_Status;
                    case Zenith.TradingController.OrderRequestError.Code.OrderType_Symbol: return OrderRequestErrorCodeId.OrderType_Symbol;
                    case Zenith.TradingController.OrderRequestError.Code.Side: return OrderRequestErrorCodeId.Side;
                    case Zenith.TradingController.OrderRequestError.Code.Side_Maximum: return OrderRequestErrorCodeId.Side_Maximum;
                    case Zenith.TradingController.OrderRequestError.Code.TotalQuantity: return OrderRequestErrorCodeId.TotalQuantity;
                    case Zenith.TradingController.OrderRequestError.Code.TotalQuantity_Minimum:
                        return OrderRequestErrorCodeId.TotalQuantity_Minimum;
                    case Zenith.TradingController.OrderRequestError.Code.TotalQuantity_Holdings:
                        return OrderRequestErrorCodeId.TotalQuantity_Holdings;
                    case Zenith.TradingController.OrderRequestError.Code.Validity: return OrderRequestErrorCodeId.Validity;
                    case Zenith.TradingController.OrderRequestError.Code.Validity_Symbol: return OrderRequestErrorCodeId.Validity_Symbol;
                    case Zenith.TradingController.OrderRequestError.Code.VisibleQuantity: return OrderRequestErrorCodeId.VisibleQuantity;
                    case Zenith.TradingController.OrderRequestError.Code.TotalQuantity_Maximum:
                        return OrderRequestErrorCodeId.TotalQuantity_Maximum;
                    case Zenith.TradingController.OrderRequestError.Code.UnitType: return OrderRequestErrorCodeId.UnitType;
                    case Zenith.TradingController.OrderRequestError.Code.UnitAmount: return OrderRequestErrorCodeId.UnitAmount;
                    case Zenith.TradingController.OrderRequestError.Code.Currency: return OrderRequestErrorCodeId.Currency;
                    case Zenith.TradingController.OrderRequestError.Code.Flags_PDS: return OrderRequestErrorCodeId.Flags_PDS;
                    default:
                        return OrderRequestErrorCodeId.Unknown;
                }
            }
        }

        export function toError(value: Zenith.TradingController.OrderRequestError) {
            let errorCode: Zenith.TradingController.OrderRequestError.Code;
            let errorValue: string | undefined;

            const separatorIdx = value.indexOf(Zenith.TradingController.OrderRequestError.valueSeparator);
            if (separatorIdx < 0) {
                errorCode = value as Zenith.TradingController.OrderRequestError.Code;
                errorValue = undefined;
            } else {
                errorCode = value.substr(0, separatorIdx) as Zenith.TradingController.OrderRequestError.Code;
                errorValue = value.substr(separatorIdx + 1);
            }

            const result: AdiOrderRequestError = {
                codeId: Code.toId(errorCode),
                code: errorCode,
                value: errorValue
            };

            return result;
        }

        export function toErrorArray(value: Zenith.TradingController.OrderRequestError[]) {
            const result = new Array<AdiOrderRequestError>(value.length);
            for (let i = 0; i < result.length; i++) {
                result[i] = toError(value[i]);
            }
            return result;
        }
    }

    export namespace EnvironmentedAccount {
        export function toId(id: string): EnvironmentedAccountId {
            const environmentOpenerPos = id.indexOf(Zenith.exchangeEnvironmentOpenChar);
            if (environmentOpenerPos < 0) {
                return {
                    accountId: id,
                    environmentId: ExchangeEnvironmentId.Production,
                };
            } else {
                const accountId = id.substr(0, environmentOpenerPos);
                const lastCharPos = id.length - 1;
                if (id[lastCharPos] !== Zenith.exchangeEnvironmentCloseChar) {
                    throw new ZenithDataError(ExternalError.Code.ZCAPICM19948, id);
                } else {
                    const environmentAsStrLength = lastCharPos - environmentOpenerPos - 1;
                    const environmentAsStr = id.substr(environmentOpenerPos + 1, environmentAsStrLength);
                    const environmentId = ExchangeEnvironment.toId(environmentAsStr as Zenith.ExchangeEnvironment);
                    return {
                        accountId,
                        environmentId
                    };
                }
            }
        }

        export function fromId(accountId: BrokerageAccountId, explicitEnvironmentId?: ExchangeEnvironmentId): string {
            return accountId +  ExchangeEnvironment.enclosedFromResolvedId(explicitEnvironmentId);
        }
    }

    export namespace Trades {
        export function toDataMessageChange(zenithChange: Zenith.MarketController.Trades.Change): TradesDataMessage.Change {
            const changeTypeId = ZenithConvert.AuiChangeType.toId(zenithChange.O);
            switch (changeTypeId) {
                case AuiChangeTypeId.Add:
                    const addDetail = zenithChange.Trade;
                    if (addDetail === undefined) {
                        throw new ZenithDataError(ExternalError.Code.ZCTTDMCRA15392887209, JSON.stringify(zenithChange));
                    } else {
                        return toDataMessageAddChange(addDetail);
                    }
                case AuiChangeTypeId.Update:
                    const updateDetail = zenithChange.Trade;
                    if (updateDetail === undefined) {
                        throw new ZenithDataError(ExternalError.Code.ZCTTDMCRU15392887209, JSON.stringify(zenithChange));
                    } else {
                        return toDataMessageUpdateChange(updateDetail);
                    }
                case AuiChangeTypeId.Initialise:
                    const mostRecentId = zenithChange.ID;
                    if (mostRecentId === undefined) {
                        throw new ZenithDataError(ExternalError.Code.ZCTTDMCRI120033332434, JSON.stringify(zenithChange));
                    } else {
                        return toDataMessageInitialiseChange(mostRecentId);
                    }
                default: throw new UnreachableCaseError('ZCTTDMCRD854477240128', changeTypeId);
            }
        }

        function toDataMessageAddChange(tradeData: Zenith.MarketController.Trades.Data) {
            const { marketId, environmentId } = tradeData.Market
                ? ZenithConvert.EnvironmentedMarket.toId(tradeData.Market)
                : { marketId: undefined, environmentId: undefined };

            const result: TradesDataMessage.AddChange = {
                typeId: AuiChangeTypeId.Add,
                id: tradeData.ID,
                price: newUndefinableDecimal(tradeData.Price),
                quantity: tradeData.Quantity,
                time: tradeData.Time === undefined ? undefined : Date.DateTimeIso8601.toSourceTzOffsetDateTime(tradeData.Time),
                flagIds: TradeFlag.toIdArray(tradeData.Flags),
                trendId: tradeData.Trend === undefined ? undefined : Trend.toId(tradeData.Trend),
                sideId: tradeData.Side === undefined ? undefined : Side.toId(tradeData.Side),
                affectsIds: TradeAffects.toIdArray(tradeData.Affects),
                conditionCodes: tradeData.Codes,
                buyBroker: tradeData.BuyBroker,
                buyCrossRef: tradeData.BuyCrossRef,
                sellBroker: tradeData.SellBroker,
                sellCrossRef: tradeData.SellCrossRef,
                marketId,
                relatedId: tradeData.RelatedID,
                attributes: tradeData.Attributes === undefined ? [] : tradeData.Attributes,
                buyDepthOrderId: tradeData.Buy,
                sellDepthOrderId: tradeData.Sell,
            } as const;
            return result;
        }

        function toDataMessageUpdateChange(tradeData: Zenith.MarketController.Trades.Data) {
            const { marketId, environmentId } = tradeData.Market
                ? ZenithConvert.EnvironmentedMarket.toId(tradeData.Market)
                : { marketId: undefined, environmentId: undefined };

            const result: TradesDataMessage.UpdateChange = {
                typeId: AuiChangeTypeId.Update,
                id: tradeData.ID,
                price: newUndefinableDecimal(tradeData.Price),
                quantity: tradeData.Quantity,
                time: tradeData.Time === undefined ? undefined : Date.DateTimeIso8601.toSourceTzOffsetDateTime(tradeData.Time),
                flagIds: TradeFlag.toIdArray(tradeData.Flags),
                trendId: tradeData.Trend === undefined ? undefined : Trend.toId(tradeData.Trend),
                sideId: tradeData.Side === undefined ? undefined : Side.toId(tradeData.Side),
                affectsIds: TradeAffects.toIdArray(tradeData.Affects),
                conditionCodes: tradeData.Codes,
                buyBroker: tradeData.BuyBroker,
                buyCrossRef: tradeData.BuyCrossRef,
                sellBroker: tradeData.SellBroker,
                sellCrossRef: tradeData.SellCrossRef,
                marketId,
                relatedId: tradeData.RelatedID,
                attributes: tradeData.Attributes === undefined ? [] : tradeData.Attributes,
                buyDepthOrderId: tradeData.Buy,
                sellDepthOrderId: tradeData.Sell,
            } as const;
            return result;
        }

        function toDataMessageInitialiseChange(mostRecentId: Integer) {
            const result: TradesDataMessage.InitialiseChange = {
                typeId: AuiChangeTypeId.Initialise,
                mostRecentId,
            };
            return result;
        }
    }

    export namespace Accounts {
        export function toDataMessageAccount(accountState: Zenith.TradingController.Accounts.AccountState) {
            const { accountId, environmentId } = ZenithConvert.EnvironmentedAccount.toId(accountState.ID);
            if (accountId === undefined || accountId === '') {
                throw new ZenithDataError(ExternalError.Code.ZCATDMA10588824494, JSON.stringify(accountState).substr(0, 300));
            } else {
                const tradingFeedZenithName = accountState.Provider;
                let tradingFeedId: FeedId | undefined;
                if (tradingFeedZenithName === undefined) {
                    tradingFeedId = undefined;
                } else {
                    const environmentedTradingFeedId = Feed.EnvironmentedTradingFeed.toId(tradingFeedZenithName);
                    tradingFeedId = environmentedTradingFeedId.feedId;
                }
                let currencyId: CurrencyId | undefined;
                const accountStateCurrency = accountState.Currency;
                if (accountStateCurrency === undefined) {
                    currencyId = undefined;
                } else {
                    currencyId = ZenithConvert.Currency.tryToId(accountStateCurrency);
                    if (currencyId === undefined) {
                        Logger.logDataError('ZCATDMAC588588223', accountStateCurrency);
                    }
                }
                const result: BrokerageAccountsDataMessage.Account = {
                    id: accountId,
                    environmentId,
                    name: accountState.Name,
                    feedStatusId: ZenithConvert.FeedStatus.toId(accountState.Feed),
                    tradingFeedId,
                    currencyId,
                } as const;
                return result;
            }
        }
    }

    export namespace Holdings {
        export function toDataMessageChangeRecord(cr: Zenith.TradingController.Holdings.ChangeRecord) {
            const typeId = ZenithConvert.AurcChangeType.toId(cr.O);
            const changeData = toDataMessageChangeData(typeId, cr);

            const result: HoldingsDataMessage.ChangeRecord = {
                typeId,
                data: changeData
            } as const;

            return result;
        }

        function toDataMessageChangeData(typeId: AurcChangeTypeId, cr: Zenith.TradingController.Holdings.ChangeRecord) {
            switch (typeId) {
                case AurcChangeTypeId.Clear:
                    const account = cr.Account;
                    if (account !== undefined) {
                        return toDataMessageClearChangeData(account);
                    } else {
                        throw new ZenithDataError(ExternalError.Code.ZCHTDMHC99813380, `${JSON.stringify(cr)}`);
                    }
                case AurcChangeTypeId.Remove:
                    const removeHolding = cr.Holding as Zenith.TradingController.Holdings.RemoveDetail;
                    if (removeHolding !== undefined) {
                        return toDataMessageRemoveChangeData(removeHolding);
                    } else {
                        throw new ZenithDataError(ExternalError.Code.ZCHTDMHR472999123, `${JSON.stringify(cr)}`);
                    }
                case AurcChangeTypeId.Add:
                case AurcChangeTypeId.Update:
                    const addUpdateHolding = cr.Holding as Zenith.TradingController.Holdings.AddUpdateDetail;
                    if (addUpdateHolding !== undefined) {
                        return toDataMessageAddUpdateChangeData(addUpdateHolding);
                    } else {
                        throw new ZenithDataError(ExternalError.Code.ZCHTDMHAU22920765, `${JSON.stringify(cr)}`);
                    }
                default:
                    throw new ZenithDataError(ExternalError.Code.ZCHTDMHD10000984, `TypeId: ${typeId} Record: ${JSON.stringify(cr)}`);
            }
        }

        function toDataMessageClearChangeData(account: string) {
            const environmentedAccountId = EnvironmentedAccount.toId(account);
            const data: HoldingsDataMessage.ClearChangeData = {
                environmentId: environmentedAccountId.environmentId,
                accountId: environmentedAccountId.accountId
            } as const;
            return data;
        }

        function toDataMessageRemoveChangeData(zenithHolding: Zenith.TradingController.Holdings.RemoveDetail) {
            const environmentedAccountId = EnvironmentedAccount.toId(zenithHolding.Account);
            const environmentedExchangeId = EnvironmentedExchange.toId(zenithHolding.Exchange);
            const data: HoldingsDataMessage.RemoveChangeData = {
                environmentId: environmentedAccountId.environmentId,
                accountId: environmentedAccountId.accountId,
                exchangeId: environmentedExchangeId.exchangeId,
                code: zenithHolding.Code
            } as const;
            return data;
        }

        export function toDataMessageAddUpdateChangeData(zenithHolding: Zenith.TradingController.Holdings.AddUpdateDetail):
            HoldingsDataMessage.AddUpdateChangeData {

            const ivemClassId = HoldingStyle.toId(zenithHolding.Style);
            switch (ivemClassId) {
                case IvemClassId.Unknown:
                    throw new ZenithDataError(ExternalError.Code.ZCHTHU1200199547792, JSON.stringify(zenithHolding).substr(0, 200));
                case IvemClassId.Market:
                    const environmentedExchangeId = ZenithConvert.EnvironmentedExchange.toId(zenithHolding.Exchange);
                    const environmentedAccountId = ZenithConvert.EnvironmentedAccount.toId(zenithHolding.Account);
                    const marketDetail = toMarketDetailChangeData(zenithHolding as Zenith.TradingController.Holdings.MarketDetail);
                    const market: HoldingsDataMessage.MarketChangeData = {
                        exchangeId: environmentedExchangeId.exchangeId,
                        environmentId: environmentedExchangeId.environmentId,
                        code: zenithHolding.Code,
                        accountId: environmentedAccountId.accountId,
                        styleId: IvemClassId.Market,
                        cost: new Decimal(zenithHolding.Cost),
                        currencyId: Currency.tryToId(zenithHolding.Currency),
                        marketDetail,
                    };
                    return market;
                case IvemClassId.ManagedFund:
                    const managedFundEnvironmentedExchangeId = ZenithConvert.EnvironmentedExchange.toId(zenithHolding.Exchange);
                    const managedFundEnvironmentedAccountId = ZenithConvert.EnvironmentedAccount.toId(zenithHolding.Account);
                    const managedFund: HoldingsDataMessage.ManagedFundChangeData = {
                        exchangeId: managedFundEnvironmentedExchangeId.exchangeId,
                        environmentId: managedFundEnvironmentedExchangeId.environmentId,
                        code: zenithHolding.Code,
                        accountId: managedFundEnvironmentedAccountId.accountId,
                        styleId: IvemClassId.ManagedFund,
                        cost: new Decimal(zenithHolding.Cost),
                        currencyId: Currency.tryToId(zenithHolding.Currency),
                    };
                    return managedFund;
                default:
                    throw new UnreachableCaseError('ZCCTO30228857', ivemClassId);
            }
        }

        function toMarketDetailChangeData(zenithMarketHolding: Zenith.TradingController.Holdings.MarketDetail) {
            const marketDetail: HoldingsDataMessage.MarketChangeData.Detail = {
                totalQuantity: zenithMarketHolding.TotalQuantity,
                totalAvailableQuantity: zenithMarketHolding.TotalAvailable,
                averagePrice: new Decimal(zenithMarketHolding.AveragePrice),
            };
            return marketDetail;
        }
    }

    export namespace Balances {
        export function toChange(balance: Zenith.TradingController.Balances.Balance): BalancesDataMessage.Change | string {
            const environmentedAccountId = EnvironmentedAccount.toId(balance.Account);
            if (balance.Type === '') {
                const change: BalancesDataMessage.InitialiseAccountChange = {
                    typeId: BalancesDataMessage.ChangeTypeId.InitialiseAccount,
                    accountId: environmentedAccountId.accountId,
                    environmentId: environmentedAccountId.environmentId
                } as const;
                return change;
            } else {
                const currencyId = Currency.tryToId(balance.Currency);
                if (currencyId === undefined) {
                    return `Unknown Zenith Currency: "${balance.Currency}"`;
                } else {
                    const change: BalancesDataMessage.AddUpdateChange = {
                        typeId: BalancesDataMessage.ChangeTypeId.AddUpdate,
                        accountId: environmentedAccountId.accountId,
                        environmentId: environmentedAccountId.environmentId,
                        balanceType: balance.Type,
                        currencyId,
                        amount: new Decimal(balance.Amount)
                    } as const;
                    return change;
                }
            }
        }
    }

    export namespace Transactions {
        export function toDataMessageChange(zenithChange: Zenith.TradingController.Transactions.Change) {
            const changeTypeId = ZenithConvert.AuiChangeType.toId(zenithChange.O);
            switch (changeTypeId) {
                case AuiChangeTypeId.Add:
                    const addDetail = zenithChange.Transaction;
                    if (addDetail === undefined) {
                        throw new ZenithDataError(ExternalError.Code.ZCTTDMCRA3339929166, JSON.stringify(zenithChange));
                    } else {
                        return toDataMessageAddChange(addDetail);
                    }
                case AuiChangeTypeId.Update:
                    const updateDetail = zenithChange.Transaction;
                    if (updateDetail === undefined) {
                        throw new ZenithDataError(ExternalError.Code.ZCTTDMCRU3339929166, JSON.stringify(zenithChange));
                    } else {
                        return toDataMessageUpdateChange(updateDetail);
                    }
                case AuiChangeTypeId.Initialise:
                    const zenithAccount = zenithChange.Account;
                    if (zenithAccount === undefined) {
                        throw new ZenithDataError(ExternalError.Code.ZCTTDMCRI2009009121, JSON.stringify(zenithChange));
                    } else {
                        return toDataMessageInitialiseChange(zenithAccount);
                    }
                default: throw new UnreachableCaseError('ZCTTDMCRD4999969969', changeTypeId);
            }
        }

        function toDataMessageAddChange(detail: Zenith.TradingController.Transactions.Detail) {
            const result: TransactionsDataMessage.AddChange = {
                typeId: AuiChangeTypeId.Add,
                transaction: toAdiTransaction(detail)
            };
            return result;
        }

        function toDataMessageUpdateChange(detail: Zenith.TradingController.Transactions.Detail) {
            const result: TransactionsDataMessage.UpdateChange = {
                typeId: AuiChangeTypeId.Update,
                transaction: toAdiTransaction(detail)
            };
            return result;
        }

        function toDataMessageInitialiseChange(zenithAccount: string) {
            const environmentedAccountId = ZenithConvert.EnvironmentedAccount.toId(zenithAccount);
            const result: TransactionsDataMessage.InitialiseChange = {
                typeId: AuiChangeTypeId.Initialise,
                accountId: environmentedAccountId.accountId,
                envionmentId: environmentedAccountId.environmentId
            };
            return result;
        }

        export function toAdiTransaction(detail: Zenith.TradingController.Transactions.Detail) {
            const ivemClassId = OrderStyle.toId(detail.Style);
            switch (ivemClassId) {
                case IvemClassId.Unknown:
                    throw new ZenithDataError(ExternalError.Code.ZCTTATU5693483701, JSON.stringify(detail).substr(0, 200));
                case IvemClassId.Market:
                    return toAdiMarketTransaction(detail as Zenith.TradingController.Transactions.MarketDetail);
                case IvemClassId.ManagedFund:
                    return toAdiManagedFundTransaction(detail as Zenith.TradingController.Transactions.ManagedFundDetail);
                default:
                    throw new UnreachableCaseError('ZCTTAT684820111', ivemClassId);
            }
        }

        function toAdiMarketTransaction(detail: Zenith.TradingController.Transactions.MarketDetail) {
            const { exchangeId, environmentId } = ZenithConvert.EnvironmentedExchange.toId(detail.Exchange);
            const { marketId } = ZenithConvert.EnvironmentedMarket.toId(detail.TradingMarket);
            const currencyId = (detail.Currency === undefined) ? undefined : ZenithConvert.Currency.tryToId(detail.Currency);

            const tradeDate = ZenithConvert.Date.DateTimeIso8601.toSourceTzOffsetDateTime(detail.TradeDate);
            if (tradeDate === undefined) {
                throw new ZenithDataError(ExternalError.Code.ZCTTAMTT97728332, detail.TradeDate ?? '');
            } else {
                const settlementDate = ZenithConvert.Date.DateTimeIso8601.toSourceTzOffsetDateTime(detail.SettlementDate);
                if (settlementDate === undefined) {
                    throw new ZenithDataError(ExternalError.Code.ZCTTAMTS97728332, detail.TradeDate ?? '');
                } else {
                    const result: MarketTransaction = {
                        id: detail.ID,
                        exchangeId,
                        environmentId,
                        code: detail.Code,
                        tradingMarketId: marketId,
                        accountId: detail.Account,
                        orderStyleId: IvemClassId.Market,
                        tradeDate,
                        settlementDate,
                        grossAmount: new Decimal(detail.GrossAmount),
                        netAmount: new Decimal(detail.NetAmount),
                        settlementAmount: new Decimal(detail.SettlementAmount),
                        currencyId,
                        orderId: detail.OrderID,
                        totalQuantity: detail.TotalQuantity,
                        averagePrice: new Decimal(detail.AveragePrice),
                    };

                    return result;
                }
            }
        }

        function toAdiManagedFundTransaction(detail: Zenith.TradingController.Transactions.ManagedFundDetail) {
            const { exchangeId, environmentId } = ZenithConvert.EnvironmentedExchange.toId(detail.Exchange);
            const { marketId } = ZenithConvert.EnvironmentedMarket.toId(detail.TradingMarket);
            const currencyId = (detail.Currency === undefined) ? undefined : ZenithConvert.Currency.tryToId(detail.Currency);

            const tradeDate = ZenithConvert.Date.DateTimeIso8601.toSourceTzOffsetDateTime(detail.TradeDate);
            if (tradeDate === undefined) {
                throw new ZenithDataError(ExternalError.Code.ZCTTAMFTT97728332, detail.TradeDate ?? '');
            } else {
                const settlementDate = ZenithConvert.Date.DateTimeIso8601.toSourceTzOffsetDateTime(detail.SettlementDate);
                if (settlementDate === undefined) {
                    throw new ZenithDataError(ExternalError.Code.ZCTTAMFTS97728332, detail.TradeDate ?? '');
                } else {
                    const result: ManagedFundTransaction = {
                        id: detail.ID,
                        exchangeId,
                        environmentId,
                        code: detail.Code,
                        tradingMarketId: marketId,
                        accountId: detail.Account,
                        orderStyleId: IvemClassId.ManagedFund,
                        tradeDate,
                        settlementDate,
                        grossAmount: new Decimal(detail.GrossAmount),
                        netAmount: new Decimal(detail.NetAmount),
                        settlementAmount: new Decimal(detail.SettlementAmount),
                        currencyId,
                        orderId: detail.OrderID,
                        totalUnits: new Decimal(detail.TotalUnits),
                        unitValue: new Decimal(detail.UnitValue),
                    };

                    return result;
                }
            }
        }
    }

    export namespace OrderRequestFlag {
        export function fromId(value: OrderRequestFlagId): Zenith.TradingController.OrderRequestFlag {
            switch (value) {
                case OrderRequestFlagId.Pds: return Zenith.TradingController.OrderRequestFlag.Pds;
                default: throw new UnreachableCaseError('ZCORFFI38885', value);
            }
        }

        export function fromIdArray(value: readonly OrderRequestFlagId[]): Zenith.TradingController.OrderRequestFlag[] {
            const result = new Array<Zenith.TradingController.OrderRequestFlag>(value.length);
            for (let i = 0; i < value.length; i++) {
                result[i] = fromId(value[i]);
            }
            return result;
        }
    }

    export namespace OrderRequestResult {
        export function toId(value: Zenith.TradingController.OrderRequestResult): OrderRequestResultId {
            switch (value) {
                case Zenith.TradingController.OrderRequestResult.Success: return OrderRequestResultId.Success;
                case Zenith.TradingController.OrderRequestResult.Error: return OrderRequestResultId.Error;
                case Zenith.TradingController.OrderRequestResult.Incomplete: return OrderRequestResultId.Incomplete;
                case Zenith.TradingController.OrderRequestResult.Invalid: return OrderRequestResultId.Invalid;
                case Zenith.TradingController.OrderRequestResult.Rejected: return OrderRequestResultId.Rejected;
                default: throw new UnreachableCaseError('ZCORTCORTI3376', value);
            }
        }
    }

    export namespace PlaceOrderDetails {
        function fromMarket(details: MarketOrderDetails): Zenith.TradingController.PlaceOrder.MarketDetails {
            const result: Zenith.TradingController.PlaceOrder.MarketDetails = {
                Exchange: EnvironmentedExchange.fromId(details.exchangeId),
                Code: details.code,
                Side: ZenithConvert.Side.fromId(details.sideId),
                Style: Zenith.TradingController.OrderStyle.Market,
                // BrokerageSchedule?: // not supported currently
                Type: ZenithConvert.EquityOrderType.fromId(details.typeId),
                LimitPrice: details.limitPrice === undefined ? undefined : details.limitPrice.toNumber(),
                Quantity: details.quantity,
                HiddenQuantity: details.hiddenQuantity,
                MinimumQuantity: details.minimumQuantity,
                Validity: ZenithConvert.EquityOrderValidity.fromId(details.timeInForceId),
                ExpiryDate: details.expiryDate === undefined ? undefined : ZenithConvert.Date.DateTimeIso8601.fromDate(details.expiryDate),
                ShortType: details.shortSellTypeId === undefined ?
                    undefined : ZenithConvert.ShortSellType.fromId(details.shortSellTypeId),
            };

            return result;
        }

        function fromManagedFund(details: ManagedFundOrderDetails): Zenith.TradingController.PlaceOrder.ManagedFundDetails {
            const result: Zenith.TradingController.PlaceOrder.ManagedFundDetails = {
                Exchange: EnvironmentedExchange.fromId(details.exchangeId),
                Code: details.code,
                Side: ZenithConvert.Side.fromId(details.sideId),
                Style: Zenith.TradingController.OrderStyle.ManagedFund,
                // BrokerageSchedule?: // not supported currently
                UnitType: ZenithConvert.OrderPriceUnitType.fromId(details.unitTypeId),
                UnitAmount: details.unitAmount,
                Currency: details.currency,
                PhysicalDelivery: details.physicalDelivery,
            };

            return result;
        }

        export function from(details: OrderDetails): Zenith.TradingController.PlaceOrder.Details {
            switch (details.styleId) {
                case IvemClassId.Unknown: throw new AssertInternalError('ZCPODFU033399272942', JSON.stringify(details).substr(0, 200));
                case IvemClassId.Market: return fromMarket(details as MarketOrderDetails);
                case IvemClassId.ManagedFund: return fromManagedFund(details as ManagedFundOrderDetails);
                default: throw new UnreachableCaseError('ZCPODRD86674', details.styleId);
            }
        }
    }

    export namespace PlaceOrderRoute {
        function fromMarket(route: MarketOrderRoute): Zenith.TradingController.PlaceOrder.MarketRoute {
            const result: Zenith.TradingController.PlaceOrder.MarketRoute = {
                Algorithm: Zenith.OrderRouteAlgorithm.Market,
                Market: ZenithConvert.EnvironmentedMarket.tradingFromId(route.marketId),
            };

            return result;
        }

        function fromBestMarket(route: BestMarketOrderRoute): Zenith.TradingController.PlaceOrder.BestMarketRoute {
            const result: Zenith.TradingController.PlaceOrder.BestMarketRoute = {
                Algorithm: Zenith.OrderRouteAlgorithm.BestMarket,
            };

            return result;
        }

        function fromFix(details: FixOrderRoute): Zenith.TradingController.PlaceOrder.FixRoute {
            const result: Zenith.TradingController.PlaceOrder.FixRoute = {
                Algorithm: Zenith.OrderRouteAlgorithm.Fix,
            };

            return result;
        }

        export function from(route: OrderRoute): Zenith.TradingController.PlaceOrder.Route {
            switch (route.algorithmId) {
                case OrderRouteAlgorithmId.Market: return fromMarket(route as MarketOrderRoute);
                case OrderRouteAlgorithmId.BestMarket: return fromBestMarket(route as BestMarketOrderRoute);
                case OrderRouteAlgorithmId.Fix: return fromFix(route as FixOrderRoute);
                default: throw new UnreachableCaseError('ZCPORF574777', route.algorithmId);
            }
        }
    }

    export namespace PlaceOrderCondition {
        function fromPrice(condition: PriceOrderTrigger) {
            const value = condition.value;
            const fieldId = condition.fieldId;
            const movementId = condition.movementId;
            const result: Zenith.TradingController.PlaceOrder.StopLossCondition = {
                Name: Zenith.TradingController.PlaceOrder.Condition.Name.StopLoss,
                Stop: value === undefined ? undefined : value.toNumber(),
                Reference: fieldId === undefined ? undefined : Reference.fromId(fieldId),
                Direction: movementId === undefined ? undefined : Direction.fromId(movementId),
            };

            return result;
        }

        function fromTrailingPrice(trigger: TrailingPriceOrderTrigger) {
            // this should be changed
            const result: Zenith.TradingController.PlaceOrder.TrailingStopLossCondition = {
                Name: Zenith.TradingController.PlaceOrder.Condition.Name.TrailingStopLoss,
                Type: Zenith.TradingController.PlaceOrder.TrailingStopLossCondition.Type.Price,
                Value: trigger.value.toNumber(),
                Limit: trigger.limit.toNumber(),
                Stop: trigger.stop === undefined ? undefined : trigger.stop.toNumber(),
            };

            return result;
        }

        function fromPercentageTrailingPrice(trigger: PercentageTrailingPriceOrderTrigger) {
            // this should be changed
            const result: Zenith.TradingController.PlaceOrder.TrailingStopLossCondition = {
                Name: Zenith.TradingController.PlaceOrder.Condition.Name.TrailingStopLoss,
                Type: Zenith.TradingController.PlaceOrder.TrailingStopLossCondition.Type.Percent,
                Value: trigger.value.toNumber(),
                Limit: trigger.limit.toNumber(),
                Stop: trigger.stop === undefined ? undefined : trigger.stop.toNumber(),
            };

            return result;
        }

        export function from(trigger: OrderTrigger): Zenith.TradingController.PlaceOrder.Condition | undefined {
            switch (trigger.typeId) {
                case OrderTriggerTypeId.Immediate: return undefined;
                case OrderTriggerTypeId.Price: return fromPrice(trigger as PriceOrderTrigger);
                case OrderTriggerTypeId.TrailingPrice:
                    return fromTrailingPrice(trigger as TrailingPriceOrderTrigger);
                case OrderTriggerTypeId.PercentageTrailingPrice:
                    return fromPercentageTrailingPrice(trigger as PercentageTrailingPriceOrderTrigger);
                case OrderTriggerTypeId.Overnight: throw new NotImplementedError('ZCPOCFP3434887');
                default: throw new UnreachableCaseError('ZCPOCF333399', trigger.typeId);
            }
        }

        export function toOrderTrigger(condition: Zenith.TradingController.PlaceOrder.Condition | undefined) {
            if (condition === undefined) {
                return new ImmediateOrderTrigger();
            } else {
                switch (condition.Name) {
                    case Zenith.TradingController.PlaceOrder.Condition.Name.StopLoss: {
                        const stopLossCondition = condition as Zenith.TradingController.PlaceOrder.StopLossCondition;
                        return toPriceOrderTrigger(stopLossCondition);
                    }
                    case Zenith.TradingController.PlaceOrder.Condition.Name.TrailingStopLoss:
                        const trailingStopLossCondition = condition as Zenith.TradingController.PlaceOrder.TrailingStopLossCondition;
                        return toTrailingPriceOrderTrigger(trailingStopLossCondition);
                    default: throw new UnreachableCaseError('ZCTOC88871', condition.Name);
                }
            }
        }

        function toPriceOrderTrigger(value: Zenith.TradingController.PlaceOrder.StopLossCondition) {
            const triggerValue = newUndefinableDecimal(value.Stop);
            const reference = value.Reference;
            const triggerFieldId = reference === undefined ? undefined : Reference.toId(reference);
            const direction = value.Direction;
            const triggerMovementId = direction === undefined ? undefined : Direction.toId(direction);

            return new PriceOrderTrigger(triggerValue, triggerFieldId, triggerMovementId);
        }

        function toTrailingPriceOrderTrigger(value: Zenith.TradingController.PlaceOrder.TrailingStopLossCondition) {
            switch (value.Type) {
                case Zenith.TradingController.PlaceOrder.TrailingStopLossCondition.Type.Price:
                    const trigger = new TrailingPriceOrderTrigger();
                    trigger.value = new Decimal(value.Value);
                    trigger.limit = new Decimal(value.Limit);
                    trigger.stop = newUndefinableDecimal(value.Stop);
                    return trigger;

                case Zenith.TradingController.PlaceOrder.TrailingStopLossCondition.Type.Percent:
                    const percentTrigger = new PercentageTrailingPriceOrderTrigger();
                    percentTrigger.value = new Decimal(value.Value);
                    percentTrigger.limit = new Decimal(value.Limit);
                    percentTrigger.stop = newUndefinableDecimal(value.Stop);
                    return percentTrigger;

                default:
                    throw new UnreachableCaseError('ZOCLTSLOC34487', value.Type);
            }
        }

        export namespace Reference {
            export function toId(value: Zenith.TradingController.PlaceOrder.Condition.Reference): PriceOrderTrigger.FieldId {
                switch (value) {
                    case Zenith.TradingController.PlaceOrder.Condition.Reference.Last: return PriceOrderTrigger.FieldId.Last;
                    case Zenith.TradingController.PlaceOrder.Condition.Reference.BestBid: return PriceOrderTrigger.FieldId.BestBid;
                    case Zenith.TradingController.PlaceOrder.Condition.Reference.BestAsk: return PriceOrderTrigger.FieldId.BestAsk;
                    default:
                        throw new UnreachableCaseError('ZCPOCRTI4181', value);
                }
            }

            export function fromId(value: PriceOrderTrigger.FieldId): Zenith.TradingController.PlaceOrder.Condition.Reference {
                switch (value) {
                    case PriceOrderTrigger.FieldId.Last: return Zenith.TradingController.PlaceOrder.Condition.Reference.Last;
                    case PriceOrderTrigger.FieldId.BestBid: return Zenith.TradingController.PlaceOrder.Condition.Reference.BestBid;
                    case PriceOrderTrigger.FieldId.BestAsk: return Zenith.TradingController.PlaceOrder.Condition.Reference.BestAsk;
                    default:
                        throw new UnreachableCaseError('ZCPOCRFI4181', value);
                }
            }
        }

        export namespace Direction {
            export function toId(value: Zenith.TradingController.PlaceOrder.Condition.Direction): MovementId {
                switch (value) {
                    case Zenith.TradingController.PlaceOrder.Condition.Direction.None: return MovementId.None;
                    case Zenith.TradingController.PlaceOrder.Condition.Direction.Up: return MovementId.Up;
                    case Zenith.TradingController.PlaceOrder.Condition.Direction.Down: return MovementId.Down;
                    default:
                        throw new UnreachableCaseError('ZCPOCDTI4181', value);
                }
            }

            export function fromId(value: MovementId): Zenith.TradingController.PlaceOrder.Condition.Direction {
                switch (value) {
                    case MovementId.None: return Zenith.TradingController.PlaceOrder.Condition.Direction.None;
                    case MovementId.Up: return Zenith.TradingController.PlaceOrder.Condition.Direction.Up;
                    case MovementId.Down: return Zenith.TradingController.PlaceOrder.Condition.Direction.Down;
                    default:
                        throw new UnreachableCaseError('ZCPOCDFI4181', value);
                }
            }
        }

        export namespace TrailingStopLossOrderConditionType {
            export function toId(value: Zenith.TradingController.PlaceOrder.TrailingStopLossCondition.Type):
                TrailingStopLossOrderConditionTypeId {

                switch (value) {
                    case Zenith.TradingController.PlaceOrder.TrailingStopLossCondition.Type.Price:
                        return TrailingStopLossOrderConditionTypeId.Price;
                    case Zenith.TradingController.PlaceOrder.TrailingStopLossCondition.Type.Percent:
                        return TrailingStopLossOrderConditionTypeId.Percent;
                    default: throw new UnreachableCaseError('ZCTSLOCTTI3559', value);
                }
            }
            export function fromId(value: TrailingStopLossOrderConditionTypeId):
                Zenith.TradingController.PlaceOrder.TrailingStopLossCondition.Type {

                switch (value) {
                    case TrailingStopLossOrderConditionTypeId.Price:
                        return Zenith.TradingController.PlaceOrder.TrailingStopLossCondition.Type.Price;
                    case TrailingStopLossOrderConditionTypeId.Percent:
                        return Zenith.TradingController.PlaceOrder.TrailingStopLossCondition.Type.Percent;
                    default: throw new UnreachableCaseError('ZCTSLOCTFI87553', value);
                }
            }
        }
    }
}

export namespace ZenithConvertModule {
    export function initialiseStatic() {
        ZenithConvert.MessageContainer.Action.initialise();
    }
}
