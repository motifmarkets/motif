/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ExternalError, ifDefined, UnexpectedCaseError, ZenithDataError } from 'src/sys/internal-api';
import {
    DataMessage,
    PublisherRequest,
    PublisherSubscription,
    QueryTradesDataDefinition,
    TradesDataDefinition,
    TradesDataMessage
} from '../../../common/internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';

export namespace TradesMessageConvert {

    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof TradesDataDefinition) {
            return createSubUnsubMessage(definition, request.typeId);
        } else {
            if (definition instanceof QueryTradesDataDefinition) {
                return createPublishMessage(definition);
            } else {
                throw new AssertInternalError('TMCCRM888888333', definition.description);
            }
        }
    }

    function createPublishMessage(definition: QueryTradesDataDefinition) {
        const litIvemId = definition.litIvemId;
        const marketId = litIvemId.litId;
        const exchangeEnvironmentId = litIvemId.environmentId;

        const result: Zenith.MarketController.Trades.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Market,
            Topic: Zenith.MarketController.TopicName.QueryTrades,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: PublisherRequest.getNextTransactionId(),
            Data: {
                Market: ZenithConvert.EnvironmentedMarket.fromId(marketId, exchangeEnvironmentId),
                Code: definition.litIvemId.code,
                Count: definition.count,
                FirstTradeID: definition.firstTradeId,
                LastTradeID: definition.lastTradeId,
                TradingDate: ifDefined(definition.tradingDate, x => ZenithConvert.Date.DateTimeIso8601.fromDate(x)),
            }
        };

        return result;
    }

    function createSubUnsubMessage(definition: TradesDataDefinition, requestTypeId: PublisherRequest.TypeId) {
        const topic = Zenith.MarketController.TopicName.Trades + Zenith.topicArgumentsAnnouncer +
            ZenithConvert.CodeAndMarket.fromLitIvemId(definition.litIvemId);

        const result: Zenith.SubUnsubMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Market,
            Topic: topic,
            Action: ZenithConvert.MessageContainer.Action.fromRequestTypeId(requestTypeId),
        };

        return result;
    }

    export function parseMessage(subscription: PublisherSubscription, message: Zenith.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id): DataMessage {

        if (message.Controller !== Zenith.MessageContainer.Controller.Market) {
            throw new ZenithDataError(ExternalError.Code.TMCPMC2019942466, message.Controller);
        } else {
            const dataMessage = new TradesDataMessage();
            dataMessage.dataItemId = subscription.dataItemId;
            dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
            switch (actionId) {
                case ZenithConvert.MessageContainer.Action.Id.Publish:
                    if (message.Topic !== Zenith.MarketController.TopicName.QueryTrades) {
                        throw new ZenithDataError(ExternalError.Code.TMCPMP9333857676, message.Topic);
                    } else {
                        const publishMsg = message as Zenith.MarketController.Trades.PayloadMessageContainer;
                        dataMessage.changes = parseData(publishMsg.Data);
                    }
                    break;
                case ZenithConvert.MessageContainer.Action.Id.Sub:
                    if (!message.Topic.startsWith(Zenith.MarketController.TopicName.Trades)) {
                        throw new ZenithDataError(ExternalError.Code.TMCPMS1102993424, message.Topic);
                    } else {
                        const subMsg = message as Zenith.MarketController.Trades.PayloadMessageContainer;
                        dataMessage.changes = parseData(subMsg.Data);
                    }
                    break;
                default:
                    throw new UnexpectedCaseError('TMCPMD558382000', actionId.toString(10));
            }

            return dataMessage;
        }
    }

    function parseData(data: Zenith.MarketController.Trades.Change[]): TradesDataMessage.Change[] {
        const count = data.length;
        const result = new Array<TradesDataMessage.Change>(count);
        for (let index = 0; index < count; index++) {
            const change = data[index];
            result[index] = ZenithConvert.Trades.toDataMessageChange(change);
        }
        return result;
    }
}
