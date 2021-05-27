/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { assert, AssertInternalError, defined, ifDefined, newUndefinableDecimal } from 'src/sys/internal-api';
import {
    DataMessage,
    DepthLevelsDataDefinition,
    DepthLevelsDataMessage,
    PublisherRequest,
    PublisherSubscription,
    QueryDepthLevelsDataDefinition
} from '../../../common/internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';

export namespace DepthLevelsMessageConvert {

    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof DepthLevelsDataDefinition) {
            return createSubUnsubMessage(definition, request.typeId);
        } else {
            if (definition instanceof QueryDepthLevelsDataDefinition) {
                return createPublishMessage(definition);
            } else {
                throw new AssertInternalError('DLMCCRM1111999428', definition.description);
            }
        }
    }

    function createPublishMessage(definition: QueryDepthLevelsDataDefinition) {
        const litIvemId = definition.litIvemId;
        const marketId = litIvemId.litId;
        const exchangeEnvironmentId = litIvemId.environmentId;

        const result: Zenith.MarketController.DepthLevels.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Market,
            Topic: Zenith.MarketController.TopicName.QueryDepthLevels,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: PublisherRequest.getNextTransactionId(),
            Data: {
                Market: ZenithConvert.EnvironmentedMarket.fromId(marketId, exchangeEnvironmentId),
                Code: definition.litIvemId.code,
            }
        };

        return result;
    }

    function createSubUnsubMessage(definition: DepthLevelsDataDefinition, requestTypeId: PublisherRequest.TypeId) {
        const topic = Zenith.MarketController.TopicName.Levels + Zenith.topicArgumentsAnnouncer +
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
        assert(message.Controller === 'Market', 'ID:3422111853');
        assert((message.Topic && message.Topic.startsWith('Levels!')) as boolean, 'ID:3522111822');

        const responseUpdateMessage = message as Zenith.MarketController.DepthLevels.PayloadMessageContainer;
        const data = responseUpdateMessage.Data;
        const dataMessage = new DepthLevelsDataMessage();
        dataMessage.dataItemId = subscription.dataItemId;
        dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
        dataMessage.levelChangeRecords = parseData(data);
        return dataMessage;
    }

    function parseData(data: Zenith.MarketController.DepthLevels.Change[]): DepthLevelsDataMessage.ChangeRecord[] {
        const result: DepthLevelsDataMessage.ChangeRecord[] = [];
        for (let index = 0; index < data.length; index++) {
            const record = parseLevelChangeRecord(data[index]);
            result.push(record);
        }
        return result;
    }

    function parseLevelChangeRecord(cr: Zenith.MarketController.DepthLevels.Change): DepthLevelsDataMessage.ChangeRecord {
        return {
            o: cr.O,
            level: ifDefined(cr.Level, parseOrderInfo),
        };
    }

    function parseOrderInfo(order: Zenith.MarketController.DepthLevels.Change.Level): DepthLevelsDataMessage.Level {
        const { marketId, environmentId } = defined(order.Market)
            ? ZenithConvert.EnvironmentedMarket.toId(order.Market)
            : { marketId: undefined, environmentId: undefined };

        return {
            id: order.ID,
            sideId: ifDefined(order.Side, x => ZenithConvert.Side.toId(x)),
            price: order.Price === null ? null : newUndefinableDecimal(order.Price),
            volume: ifDefined(order.Volume, x => x),
            orderCount: ifDefined(order.Count, x => x),
            hasUndisclosed: ifDefined(order.HasUndisclosed, x => x),
            marketId,
        };
    }
}
