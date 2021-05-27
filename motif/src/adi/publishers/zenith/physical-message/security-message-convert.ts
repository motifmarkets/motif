/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from 'decimal.js-light';
import {
    AssertInternalError,
    ExternalError,
    ifDefined,
    ifDefinedAndNotNull,
    newUndefinableDecimal,
    UnexpectedCaseError,
    ZenithDataError
} from 'src/sys/internal-api';
import {
    ExchangeEnvironmentId,
    ExchangeId,
    MarketId,
    PublisherRequest,
    PublisherSubscription,
    QuerySecurityDataDefinition,
    SecurityDataDefinition,
    SecurityDataMessage
} from '../../../common/internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';

export namespace SecurityMessageConvert {

    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof SecurityDataDefinition) {
            return createSubUnsubMessage(definition, request.typeId);
        } else {
            if (definition instanceof QuerySecurityDataDefinition) {
                return createPublishMessage(definition);
            } else {
                throw new AssertInternalError('SMCCRM1111999428', definition.description);
            }
        }
    }

    function createPublishMessage(definition: QuerySecurityDataDefinition) {
        const litIvemId = definition.litIvemId;
        const marketId = litIvemId.litId;
        const exchangeEnvironmentId = litIvemId.environmentId;

        const result: Zenith.MarketController.Security.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Market,
            Topic: Zenith.MarketController.TopicName.QuerySecurity,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: PublisherRequest.getNextTransactionId(),
            Data: {
                Market: ZenithConvert.EnvironmentedMarket.fromId(marketId, exchangeEnvironmentId),
                Code: definition.litIvemId.code,
            }
        };

        return result;
    }

    function createSubUnsubMessage(definition: SecurityDataDefinition, requestTypeId: PublisherRequest.TypeId) {
        const topic = Zenith.MarketController.TopicName.Security + Zenith.topicArgumentsAnnouncer +
            ZenithConvert.CodeAndMarket.fromLitIvemId(definition.litIvemId);

        const result: Zenith.SubUnsubMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Market,
            Topic: topic,
            Action: ZenithConvert.MessageContainer.Action.fromRequestTypeId(requestTypeId),
        };

        return result;
    }

    export function parseMessage(subscription: PublisherSubscription, message: Zenith.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {

        if (message.Controller !== Zenith.MessageContainer.Controller.Market) {
            throw new ZenithDataError(ExternalError.Code.SMCPMC699483333434, message.Controller);
        } else {
            const dataMessage = new SecurityDataMessage();
            dataMessage.dataItemId = subscription.dataItemId;
            dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
            switch (actionId) {
                case ZenithConvert.MessageContainer.Action.Id.Publish:
                    if (message.Topic !== Zenith.MarketController.TopicName.QuerySecurity) {
                        throw new ZenithDataError(ExternalError.Code.SMCPMP11995543833, message.Topic);
                    } else {
                        const publishMsg = message as Zenith.MarketController.Security.PayloadMessageContainer;
                        dataMessage.securityInfo = parseData(publishMsg.Data);
                    }
                    break;
                case ZenithConvert.MessageContainer.Action.Id.Sub:
                    if (!message.Topic.startsWith(Zenith.MarketController.TopicName.Security)) {
                        throw new ZenithDataError(ExternalError.Code.SMCPMS55845845454, message.Topic);
                    } else {
                        const subMsg = message as Zenith.MarketController.Security.PayloadMessageContainer;
                        dataMessage.securityInfo = parseData(subMsg.Data);
                    }
                    break;
                default:
                    throw new UnexpectedCaseError('SMCPMD559324888222', actionId.toString(10));
            }

            return dataMessage;
        }
    }

    function parseData(data: Zenith.MarketController.Security.Payload): SecurityDataMessage.Rec {
        let marketId: MarketId | undefined;
        let exchangeId: ExchangeId | undefined;
        let environmentId: ExchangeEnvironmentId | undefined;
        if (data.Market === undefined) {
            marketId = undefined;
            environmentId = undefined;
        } else {
            const environmentedMarketId = ZenithConvert.EnvironmentedMarket.toId(data.Market);
            marketId = environmentedMarketId.marketId;
            environmentId = environmentedMarketId.environmentId;
        }
        if (data.Exchange === undefined) {
            exchangeId = undefined;
        } else {
            const environmentedExchangeId = ZenithConvert.EnvironmentedExchange.toId(data.Exchange);
            exchangeId = environmentedExchangeId.exchangeId;
            environmentId = environmentedExchangeId.environmentId;
        }

        try {
            const result: SecurityDataMessage.Rec = {
                code: data.Code,
                marketId,
                exchangeId,
                exchangeEnvironmentId: environmentId,
                name: data.Name,
                classId: ifDefined(data.Class, x => ZenithConvert.IvemClass.toId(x)),
                cfi: data.CFI,
                tradingState: data.TradingState,
                marketIds: ifDefined(data.TradingMarkets, parseTradingMarkets),
                isIndex: data.IsIndex,
                expiryDate: ifDefined(data.ExpiryDate, x => ZenithConvert.Date.DateYYYYMMDD.toSourceTzOffsetDate(x)),
                strikePrice: newUndefinableDecimal(data.StrikePrice),
                callOrPutId: ifDefined(data.CallOrPut, x => ZenithConvert.CallOrPut.toId(x)),
                contractSize: data.ContractSize,
                subscriptionDataIds: ifDefined(data.SubscriptionData, x => ZenithConvert.SubscriptionData.toIdArray(x)),
                quotationBasis: data.QuotationBasis,
                open: ifDefinedAndNotNull(data.Open, x => new Decimal(x)),
                high: ifDefinedAndNotNull(data.High, x => new Decimal(x)),
                low: ifDefinedAndNotNull(data.Low, x => new Decimal(x)),
                close: ifDefinedAndNotNull(data.Close, x => new Decimal(x)),
                settlement: ifDefinedAndNotNull(data.Settlement, x => new Decimal(x)),
                last: ifDefinedAndNotNull(data.Last, x => new Decimal(x)),
                trend: ifDefined(data.Trend, x => ZenithConvert.Trend.toId(x)),
                bestAsk: ifDefinedAndNotNull(data.BestAsk, x => new Decimal(x)),
                askCount: data.AskCount,
                askQuantity: data.AskQuantity,
                askUndisclosed: data.AskUndisclosed,
                bestBid: ifDefinedAndNotNull(data.BestBid, x => new Decimal(x)),
                bidCount: data.BidCount,
                bidQuantity: data.BidQuantity,
                bidUndisclosed: data.BidUndisclosed,
                numberOfTrades: data.NumberOfTrades,
                volume: data.Volume,
                auctionPrice: ifDefinedAndNotNull(data.AuctionPrice, x => new Decimal(x)),
                auctionQuantity: data.AuctionQuantity,
                auctionRemainder: data.AuctionRemainder,
                vWAP: ifDefinedAndNotNull(data.VWAP, x => new Decimal(x)),
                valueTraded: data.ValueTraded,
                openInterest: data.OpenInterest,
                shareIssue: data.ShareIssue,
                statusNote: data.StatusNote,
            } as const;
            return result;
        } catch (error) {
            error.message = 'Security Data Message: ' + error.message;
            throw error;
        }
    }

    function parseTradingMarkets(tradingMarkets: string[]): MarketId[] {
        return tradingMarkets.map(tm => ZenithConvert.EnvironmentedMarket.toId(tm).marketId);
    }
}
