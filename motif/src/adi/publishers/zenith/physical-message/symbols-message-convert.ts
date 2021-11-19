/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    ExternalError,
    ifDefined,
    Logger,
    newUndefinableDecimal, ZenithDataError
} from 'src/sys/internal-api';
import {
    AurcChangeTypeId,
    ExchangeId,
    ExchangeInfo,
    IvemId,
    LitIvemAlternateCodes,
    LitIvemAttributes,
    LitIvemId,
    MarketId,
    PublisherRequest,
    PublisherSubscription,
    SearchSymbolsDataDefinition,
    SymbolFieldId,
    SymbolsDataMessage,
    TmcLeg
} from '../../../common/internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';
import { ZenithMarketAsx } from './zenith-market-asx';
import { ZenithMarketAsxConvert } from './zenith-market-asx-convert';
import { ZenithMarketFnsx } from './zenith-market-fnsx';
import { ZenithMarketFnsxConvert } from './zenith-market-fnsx-convert';
import { ZenithMarketMyx } from './zenith-market-myx';
import { ZenithMarketMyxConvert } from './zenith-market-myx-convert';
import { ZenithMarketPtx } from './zenith-market-ptx';
import { ZenithMarketPtxConvert } from './zenith-market-ptx-convert';

export namespace SymbolsMessageConvert {

    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof SearchSymbolsDataDefinition) {
            return createSearchPublishMessage(definition);
        } else {
            // if (definition instanceof SymbolsDataDefinition) {
            //     return createSubUnsubMessage(definition, request.typeId);
            // } else {
                throw new AssertInternalError('SMCCRM1111999428', definition.description);
            // }
        }
    }

    function convertMarketsArray(marketIds: readonly MarketId[] | undefined) {
        if (marketIds === undefined) {
            return undefined;
        } else {
            const count = marketIds.length;
            const result = new Array<string>(count);
            for (let i = 0; i < count; i++) {
                result[i] = ZenithConvert.EnvironmentedMarket.fromId(marketIds[i]);
            }
            return result;
        }
    }

    // function convertField(id: SearchSymbolsDataDefinition.FieldId) {
    //     switch (id) {
    //         case SearchSymbolsDataDefinition.FieldId.Code: return Zenith.MarketController.SearchSymbols.SearchField.Code;
    //         case SearchSymbolsDataDefinition.FieldId.Name: return Zenith.MarketController.SearchSymbols.SearchField.Name;
    //         // case SearchSymbolsDataDefinition.FieldId.Ticker: return Zenith.MarketController.SearchSymbols.AlternateKey.Ticker;
    //         // case SearchSymbolsDataDefinition.FieldId.Gics: return Zenith.MarketController.SearchSymbols.AlternateKey.Gics;
    //         // case SearchSymbolsDataDefinition.FieldId.Isin: return Zenith.MarketController.SearchSymbols.AlternateKey.Isin;
    //         // case SearchSymbolsDataDefinition.FieldId.Base: return Zenith.MarketController.SearchSymbols.AlternateKey.Base;
    //         // case SearchSymbolsDataDefinition.FieldId.Ric: return Zenith.MarketController.SearchSymbols.AlternateKey.Ric;
    //         default:
    //             // throw new UnreachableCaseError('MCSCFFI11945', id);
    //     }
    // }

    // function convertFields(ids: readonly SearchSymbolsDataDefinition.FieldId[] | undefined) {
    //     if (ids === undefined) {
    //         return undefined;
    //     } else {
    //         const count = ids.length;
    //         const zenithFields = new Array<string>(count);
    //         for (let i = 0; i < count; i++) {
    //             const id = ids[i];
    //             zenithFields[i] = convertField(id);
    //         }
    //         return zenithFields.join(Zenith.MarketController.SearchSymbols.fieldSeparator);
    //     }
    // }

    // function createPublishMessage(definition: SearchSymbolsDataDefinition) {
    //     const exchange = definition.exchangeId === undefined ? undefined :
    //         ZenithConvert.EnvironmentedExchange.fromId(definition.exchangeId);
    //     const targetDate = definition.targetDate === undefined ? undefined :
    //     ZenithConvert.Date.DateTimeIso8601.fromDate(definition.targetDate);

    //     const result: Zenith.MarketController.SearchSymbols.PublishMessageContainer = {
    //         Controller: Zenith.MessageContainer.Controller.Market,
    //         Topic: Zenith.MarketController.TopicName.SearchSymbols,
    //         Action: Zenith.MessageContainer.Action.Publish,
    //         TransactionID: PublisherRequest.getNextTransactionId(),
    //         Data: {
    //             SearchText: definition.searchText,
    //             Exchange: exchange,
    //             Markets: convertMarketsArray(definition.marketIds),
    //             Field: convertFields(definition.fieldIds),
    //             IsPartial: definition.isPartial,
    //             IsCaseSensitive: definition.isCaseSensitive,
    //             PreferExact: definition.preferExact,
    //             StartIndex: definition.startIndex,
    //             Count: definition.count,
    //             TargetDate: targetDate,
    //             ShowFull: definition.showFull,
    //             Account: definition.accountId,
    //             CFI: definition.cfi,
    //         }
    //     };

    //     return result;
    // }

    function createSearchPublishMessage(definition: SearchSymbolsDataDefinition) {
        const exchange = definition.exchangeId === undefined
            ? undefined
            : ZenithConvert.EnvironmentedExchange.fromId(definition.exchangeId);
        const ivemClass = definition.ivemClassId === undefined
            ? undefined
            : ZenithConvert.SymbolClass.fromId(definition.ivemClassId);
        const conditions = createSearchConditions(definition.conditions);
        const expiryDateMin = definition.expiryDateMin === undefined
            ? undefined
            : ZenithConvert.Date.DateTimeIso8601.fromDate(definition.expiryDateMin);
        const expiryDateMax = definition.expiryDateMax === undefined
            ? undefined
            : ZenithConvert.Date.DateTimeIso8601.fromDate(definition.expiryDateMax);
        const strikePriceMin = definition.strikePriceMin === undefined
            ? undefined
            : definition.strikePriceMin.toNumber();
        const strikePriceMax = definition.strikePriceMax === undefined
            ? undefined
            : definition.strikePriceMax.toNumber();

        const result: Zenith.MarketController.SearchSymbols.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Market,
            Topic: Zenith.MarketController.TopicName.SearchSymbols,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: PublisherRequest.getNextTransactionId(),
            Data: {
                CFI: definition.cfi,
                Class: ivemClass,
                CombinationLeg: definition.combinationLeg,
                Conditions: conditions,
                Count: definition.count,
                Exchange: exchange,
                ExpiryDateMin: expiryDateMin,
                ExpiryDateMax: expiryDateMax,
                FullSymbol: definition.fullSymbol,
                Index: definition.index,
                Markets: convertMarketsArray(definition.marketIds),
                PreferExact: definition.preferExact,
                StartIndex: definition.startIndex,
                StrikePriceMin: strikePriceMin,
                StrikePriceMax: strikePriceMax,
                // Field: convertFields(definition.fieldIds),
                // IsPartial: definition.isPartial,
                // IsCaseSensitive: definition.isCaseSensitive,
                // TargetDate: targetDate,
                // Account: definition.accountId,
            }
        };

        return result;
    }

    function createSearchConditions(conditions: SearchSymbolsDataDefinition.Condition[] | undefined) {
        if (conditions === undefined) {
            return undefined;
        } else {
            const count = conditions.length;
            let result: Zenith.MarketController.SearchSymbols.Condition[] = [];
            for (let i = 0; i < count; i++) {
                const condition = conditions[i];
                result = [...result, ...createFieldSearchConditions(condition)];
            }
            return result;
        }
    }

    export function createFieldSearchConditions(condition: SearchSymbolsDataDefinition.Condition) {
        const fieldIds = condition.fieldIds;
        let result: Zenith.MarketController.SearchSymbols.Condition[];
        if (fieldIds === undefined) {
            result = [createFieldSearchCondition(undefined, undefined, condition)];
        } else {
            const maxCount = fieldIds.length;
            result = new Array<Zenith.MarketController.SearchSymbols.Condition>(maxCount);
            let count = 0;
            const containsCode = fieldIds.includes(SymbolFieldId.Code);
            const containsName = fieldIds.includes(SymbolFieldId.Name);
            if (containsCode && containsName) {
                result[count++] = createFieldSearchCondition(undefined, undefined, condition); // undefined field = code + name
            } else {
                if (containsCode) {
                    const field = Zenith.MarketController.SearchSymbols.Condition.Field.Code;
                    result[count++] = createFieldSearchCondition(field, undefined, condition);
                }
                if (containsName) {
                    const field = Zenith.MarketController.SearchSymbols.Condition.Field.Name;
                    result[count++] = createFieldSearchCondition(field, undefined, condition);
                }
            }

            for (const fieldId of fieldIds) {
                const alternateKey = ZenithConvert.SymbolAlternateKey.fromId(fieldId);
                if (alternateKey !== undefined) {
                    const field = Zenith.MarketController.SearchSymbols.Condition.Field.Alternate;
                    result[count++] = createFieldSearchCondition(field, alternateKey, condition);
                }
            }

            result.length = count;
        }

        return result;
    }

    export function createFieldSearchCondition(
        field: Zenith.MarketController.SearchSymbols.Condition.Field | undefined,
        alternateKey: Zenith.MarketController.SearchSymbols.AlternateKey | undefined,
        condition: SearchSymbolsDataDefinition.Condition
    ) {
        const match = condition.matchIds === undefined
            ? undefined
            : ZenithConvert.SymbolConditionMatch.fromIds(condition.matchIds);

        const result: Zenith.MarketController.SearchSymbols.Condition = {
            Field: field,
            Group: condition.group,
            IsCaseSensitive: condition.isCaseSensitive,
            Key: alternateKey,
            Match: match,
            Text: condition.text,
        };

        return result;
    }


    // function createSubUnsubMessage(definition: SymbolsDataDefinition, requestTypeId: PublisherRequest.TypeId) {
    //     const topicName = Zenith.MarketController.TopicName.Symbols;
    //     const market = ZenithConvert.EnvironmentedMarket.fromId(definition.marketId);
    //     const zenithClass = ZenithConvert.IvemClass.fromId(definition.classId);
    //     const topic = topicName + Zenith.topicArgumentsAnnouncer + zenithClass + Zenith.topicArgumentsSeparator + market;

    //     const result: Zenith.SubUnsubMessageContainer = {
    //         Controller: Zenith.MessageContainer.Controller.Trading,
    //         Topic: topic,
    //         Action: ZenithConvert.MessageContainer.Action.fromRequestTypeId(requestTypeId),
    //     };

    //     return result;
    // }

    export function parseMessage(subscription: PublisherSubscription, message: Zenith.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {
        if (message.Controller !== Zenith.MessageContainer.Controller.Market) {
            throw new ZenithDataError(ExternalError.Code.SMCPMC588329999199, message.Controller);
        } else {
            const dataMessage = new SymbolsDataMessage();
            dataMessage.dataItemId = subscription.dataItemId;
            dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Publish) {
                throw new ZenithDataError(ExternalError.Code.SMCPMD558382000, actionId.toString(10));
            } else {
                if (message.Topic !== Zenith.MarketController.TopicName.SearchSymbols) {
                    throw new ZenithDataError(ExternalError.Code.SMCPMP5885239991, message.Topic);
                } else {
                    const publishMsg = message as Zenith.MarketController.SearchSymbols.PublishPayloadMessageContainer;
                    const data = publishMsg.Data;
                    if (data !== undefined) {
                        dataMessage.changes = parsePublishPayload(data);
                    }
                    return dataMessage;
                }
            }
        }
    }

    function parsePublishPayload(symbols: Zenith.MarketController.SearchSymbols.Detail[] | null) {
        let result: SymbolsDataMessage.Change[];
        if (symbols === null) {
            const change: SymbolsDataMessage.ClearChange = {
                typeId: AurcChangeTypeId.Clear,
            };
            result = [change];
        } else {
            result = new Array<SymbolsDataMessage.Change>(symbols.length);

            for (let index = 0; index < symbols.length; index++) {
                const symbol = symbols[index] as Zenith.MarketController.SearchSymbols.FullDetail;
                result[index] = createAddChange(AurcChangeTypeId.Add, symbol);
            }
        }

        return result;
    }

    // function parseSubPayload(changes: Zenith.MarketController.Symbols.Change[]) {
    //     const result = new Array<SymbolsDataMessage.Change>(changes.length);

    //     for (let index = 0; index < changes.length; index++) {
    //         const change = changes[index];
    //         result[index] = parseChange(change);
    //     }

    //     return result;
    // }

    // function parseChange(change: Zenith.MarketController.Symbols.Change) {
    //     const changeTypeId = ZenithConvert.AurcChangeType.toId(change.O);
    //     switch (changeTypeId) {
    //         case AurcChangeTypeId.Clear: return createClearChange();
    //         case AurcChangeTypeId.Remove: return createRemoveChange(change.Symbol);
    //         case AurcChangeTypeId.Update:
    //             const updateDetail = change.Symbol as Zenith.MarketController.Symbols.FullDetail;
    //             return createUpdateChange(changeTypeId, updateDetail);
    //         case AurcChangeTypeId.Add:
    //             const addDetail = change.Symbol as Zenith.MarketController.Symbols.FullDetail;
    //             return createAddChange(changeTypeId, addDetail);
    //         default: throw new UnreachableCaseError('SMCPC677777488', changeTypeId);
    //     }
    // }

    // function createClearChange() {
    //     const change: SymbolsDataMessage.Change = {
    //         typeId: AurcChangeTypeId.Clear,
    //     };

    //     return change;
    // }

    // function createRemoveChange(detail: Zenith.MarketController.Symbols.Detail | undefined) {
    //     if (detail === undefined) {
    //         throw new AssertInternalError('SMCCRC232200095534');
    //     } else {
    //         const { marketId, environmentId } = ZenithConvert.EnvironmentedMarket.toId(detail.Market);
    //         const litIvemId = LitIvemId.createFromCodeMarket(detail.Code, marketId);
    //         if (environmentId !== ExchangeInfo.getDefaultEnvironmentId()) {
    //             litIvemId.explicitEnvironmentId = environmentId;
    //         }

    //         const change: SymbolsDataMessage.RemoveChange = {
    //             typeId: AurcChangeTypeId.Remove,
    //             litIvemId,
    //         };

    //         return change;
    //     }
    // }

    // function createUpdateChange(changeTypeId: AurcChangeTypeId, detail: Zenith.MarketController.Symbols.FullDetail | undefined) {
    //     if (detail === undefined) {
    //         throw new AssertInternalError('SMCCUCFD232200095534');
    //     } else {
    //         try {
    //             const { litIvemId, exchangeId } = parseLitIvemIdExchangeName(detail);

    //             const result: SymbolsDataMessage.UpdateChange = {
    //                 typeId: changeTypeId,
    //                 litIvemId,
    //                 ivemClassId: ZenithConvert.IvemClass.toId(detail.Class),
    //                 subscriptionDataIds: ZenithConvert.SubscriptionData.toIdArray(detail.SubscriptionData),
    //                 tradingMarketIds: parseTradingMarkets(detail.TradingMarkets),
    //                 exchangeId,
    //                 name: detail.Name,
    //                 // ShowFull fields are only included if specified in request
    //                 cfi: detail.CFI,
    //                 depthDirectionId: ifDefinedAndNotNull(detail.DepthDirection, x => ZenithConvert.DepthDirection.toId(x)),
    //                 isIndex: detail.IsIndex,
    //                 expiryDate: ifDefinedAndNotNull(detail.ExpiryDate, x => ZenithConvert.Date.DateYYYYMMDD.toSourceTzOffsetDate(x)),
    //                 strikePrice: newUndefinableNullableDecimal(detail.StrikePrice),
    //                 exerciseTypeId: ifDefinedAndNotNull(detail.ExerciseType, x => ZenithConvert.ExerciseType.toId(x)),
    //                 callOrPutId: ifDefinedAndNotNull(detail.CallOrPut, x => ZenithConvert.CallOrPut.toId(x)),
    //                 contractSize: detail.ContractSize,
    //                 alternateCodes: detail.Alternates === null ? null : parseAlternates(exchangeId, detail.Alternates),
    //                 attributes: detail.Attributes === null ? null : parseAttributes(exchangeId, detail.Attributes),
    //                 tmcLegs: detail.Legs === null ? null : parseLegs(detail.Legs),
    //                 categories: detail.Categories,
    //             };

    //             return result;
    //         } catch (error) {
    //             throw new ZenithDataError(ExternalError.Code.SMCCUCFD1212943448, `${error}: ${detail}`);
    //         }
    //     }
    // }

    function createAddChange(changeTypeId: AurcChangeTypeId, detail: Zenith.MarketController.SearchSymbols.FullDetail | undefined) {
        if (detail === undefined) {
            throw new AssertInternalError('SMCCACFFD232200095534');
        } else {
            try {
                const { litIvemId, exchangeId } = parseLitIvemIdExchangeName(detail);

                const result: SymbolsDataMessage.AddChange = {
                    typeId: changeTypeId,
                    litIvemId,
                    ivemClassId: ZenithConvert.IvemClass.toId(detail.Class),
                    subscriptionDataIds: ZenithConvert.SubscriptionData.toIdArray(detail.SubscriptionData),
                    tradingMarketIds: parseTradingMarkets(detail.TradingMarkets),
                    exchangeId,
                    name: detail.Name,
                    // ShowFull fields are only included if specified in request
                    cfi: detail.CFI,
                    depthDirectionId: ifDefined(detail.DepthDirection, x => ZenithConvert.DepthDirection.toId(x)),
                    isIndex: detail.IsIndex,
                    expiryDate: ifDefined(detail.ExpiryDate, x => ZenithConvert.Date.DateYYYYMMDD.toSourceTzOffsetDate(x)),
                    strikePrice: newUndefinableDecimal(detail.StrikePrice),
                    exerciseTypeId: ifDefined(detail.ExerciseType, x => ZenithConvert.ExerciseType.toId(x)),
                    callOrPutId: ifDefined(detail.CallOrPut, x => ZenithConvert.CallOrPut.toId(x)),
                    contractSize: newUndefinableDecimal(detail.ContractSize),
                    lotSize: detail.LotSize,
                    alternateCodes: parseAlternates(exchangeId, detail.Alternate),
                    attributes: parseAttributes(exchangeId, detail.Attributes),
                    tmcLegs: detail.Legs === null ? undefined : parseLegs(detail.Legs),
                    categories: detail.Categories,
                };

                return result;
            } catch (error) {
                throw new ZenithDataError(ExternalError.Code.SMCCACFFD121243448, `${error}: ${detail}`);
            }
        }
    }

    function parseTradingMarkets(tradingMarkets: string[]): MarketId[] {
        return tradingMarkets.map(tm => ZenithConvert.EnvironmentedMarket.toId(tm).marketId);
    }

    interface LitIvemIdExchangeId {
        litIvemId: LitIvemId;
        exchangeId: ExchangeId;
    }

    function parseLitIvemIdExchangeName(detail: Zenith.MarketController.SearchSymbols.Detail) {
        const { marketId, environmentId } = ZenithConvert.EnvironmentedMarket.toId(detail.Market);
        const litIvemId = LitIvemId.createFromCodeMarket(detail.Code, marketId);
        if (environmentId !== ExchangeInfo.getDefaultEnvironmentId()) {
            litIvemId.explicitEnvironmentId = environmentId;
        }

        let symbolExchange: string;
        if (detail.Exchange !== undefined) {
            symbolExchange = detail.Exchange;
        } else {
            symbolExchange = detail.Market; // Exchange and Market are same so only provided once
        }
        const environmentedExchangeId = ZenithConvert.EnvironmentedExchange.toId(symbolExchange);

        if (environmentId !== ExchangeInfo.getDefaultEnvironmentId()) {
            litIvemId.explicitEnvironmentId = environmentId;
        }
        const exchangeId = environmentedExchangeId.exchangeId;

        const result: LitIvemIdExchangeId = {
            litIvemId,
            exchangeId,
        };

        return result;
    }

    function parseAttributes(exchangeId: ExchangeId, attributes: Zenith.MarketController.SearchSymbols.Attributes | undefined) {
        if (attributes === undefined) {
            return undefined;
        } else {
            let result: LitIvemAttributes | undefined;
            switch (exchangeId) {
                case ExchangeId.Myx:
                    result = ZenithMarketMyxConvert.Symbols.Attributes.toLitIvem(attributes);
                    break;
                default:
                    Logger.logDataError('SMCCAUC77667733772', ExchangeInfo.idToName(exchangeId));
                    result = undefined;
            }
            return result;
        }
    }

    function parseAlternates(exchangeId: ExchangeId, value: Zenith.MarketController.SearchSymbols.Alternates | undefined) {
        if (value === undefined) {
            return undefined;
        } else {
            let result: LitIvemAlternateCodes | undefined;
            switch (exchangeId) {
                case ExchangeId.Myx: {
                    const myxValue = value as ZenithMarketMyx.MarketController.Symbols.Alternates;
                    result = ZenithMarketMyxConvert.Symbols.Alternates.toAdi(myxValue);
                    break;
                }
                case ExchangeId.Asx: {
                    const asxValue = value as ZenithMarketAsx.MarketController.Symbols.Alternates;
                    result = ZenithMarketAsxConvert.Symbols.Alternates.toAdi(asxValue);
                    break;
                }
                case ExchangeId.Ptx: {
                    const ptxValue = value as ZenithMarketPtx.MarketController.Symbols.Alternates;
                    result = ZenithMarketPtxConvert.Symbols.Alternates.toAdi(ptxValue);
                    break;
                }
                case ExchangeId.Fnsx: {
                    const fnsxValue = value as ZenithMarketFnsx.MarketController.Symbols.Alternates;
                    result = ZenithMarketFnsxConvert.Symbols.Alternates.toAdi(fnsxValue);
                    break;
                }
                default:
                    Logger.logDataError('SMCCAUC77667733773', ExchangeInfo.idToName(exchangeId));
                    result = undefined;
            }
            return result;
        }
    }

    function parseLegs(value: Zenith.MarketController.SearchSymbols.FullDetail.Leg[] | undefined) {
        if (value === undefined) {
            return undefined;
        } else {
            const result = new Array<TmcLeg>(value.length);
            for (let i = 0; i < value.length; i++) {
                const zenithLeg = value[i];
                const leg: TmcLeg = {
                    ivemId: new IvemId(zenithLeg.Code, ExchangeId.Asx),
                    ratio: zenithLeg.Ratio,
                    bidAskSideId: ZenithConvert.Side.toId(zenithLeg.Side)
                };
                result[i] = leg;
            }

            return result;
        }
    }
}
