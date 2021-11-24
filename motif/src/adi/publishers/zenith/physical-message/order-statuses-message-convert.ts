/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ExternalError, ZenithDataError } from 'sys-internal-api';
import {
    OrderStatusesDataDefinition,
    OrderStatusesDataMessage,
    PublisherRequest,
    PublisherSubscription
} from '../../../common/internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';

export namespace OrderStatusesMessageConvert {

    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof OrderStatusesDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('OSOMCCRM55583399', definition.description);
        }
    }

    function createPublishMessage(definition: OrderStatusesDataDefinition) {
        const tradingFeedName = ZenithConvert.Feed.EnvironmentedTradingFeed.fromId(definition.tradingFeedId);

        const result: Zenith.TradingController.OrderStatuses.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Trading,
            Topic: Zenith.TradingController.TopicName.QueryOrderStatuses,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: PublisherRequest.getNextTransactionId(),
            Data: {
                Provider: tradingFeedName,
            }
        };

        return result;
    }

    export function parseMessage(subscription: PublisherSubscription, message: Zenith.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {
        if (message.Controller !== Zenith.MessageContainer.Controller.Trading) {
            throw new ZenithDataError(ExternalError.Code.OSOMCPMA6744444883, message.Controller);
        } else {
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Publish) {
                throw new ZenithDataError(ExternalError.Code.OSOMCPMA333928660, JSON.stringify(message));
            } else {
                if (message.Topic !== Zenith.TradingController.TopicName.QueryOrderStatuses) {
                    throw new ZenithDataError(ExternalError.Code.OSOMCPMT1009199929, message.Topic);
                } else {
                    const responseMsg = message as Zenith.TradingController.OrderStatuses.PublishPayloadMessageContainer;

                    const dataMessage = new OrderStatusesDataMessage();
                    dataMessage.dataItemId = subscription.dataItemId;
                    dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
                    try {
                        dataMessage.statuses = parseData(responseMsg.Data);
                    } catch (error) {
                        if (error instanceof Error) {
                            error.message = 'OSOMCPMP8847: ' + error.message;
                        }
                        throw error;
                    }

                    return dataMessage;
                }
            }
        }
    }

    function parseData(value: Zenith.TradingController.OrderStatuses.Status[]) {
        return value.map((status) => ZenithConvert.OrderStatus.toAdi(status));
    }
}
