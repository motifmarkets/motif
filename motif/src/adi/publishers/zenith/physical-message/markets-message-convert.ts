/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ExternalError, UnexpectedCaseError, ZenithDataError } from 'sys-internal-api';
import {
    MarketsDataDefinition,
    MarketsDataMessage,
    PublisherRequest,
    PublisherSubscription,
    QueryMarketsDataDefinition
} from '../../../common/internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';

export namespace MarketsMessageConvert {
    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof MarketsDataDefinition) {
            return createPublishSubUnsubRequestMessage(false, request.typeId);
        } else {
            if (definition instanceof QueryMarketsDataDefinition) {
                return createPublishSubUnsubRequestMessage(true, request.typeId);
            } else {
                throw new AssertInternalError('MMCCRMA5558482000', definition.description);
            }
        }
    }

    function createPublishSubUnsubRequestMessage(query: boolean, requestTypeId: PublisherRequest.TypeId) {
        let topic: string;
        let action: Zenith.MessageContainer.Action;
        if (query) {
            topic = Zenith.MarketController.TopicName.QueryMarkets;
            action = Zenith.MessageContainer.Action.Publish;
        } else {
            topic = Zenith.MarketController.TopicName.Markets;
            action = ZenithConvert.MessageContainer.Action.fromRequestTypeId(requestTypeId);
        }

        const result: Zenith.MarketController.Markets.PublishSubUnsubMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Market,
            Topic: topic,
            Action: action,
            TransactionID: PublisherRequest.getNextTransactionId(),
        };

        return result;
    }

    export function parseMessage(subscription: PublisherSubscription, message: Zenith.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {
        if (message.Controller !== Zenith.MessageContainer.Controller.Market) {
            throw new ZenithDataError(ExternalError.Code.MMCPMT95883743, message.Controller);
        } else {
            const dataMessage = new MarketsDataMessage();
            dataMessage.dataItemId = subscription.dataItemId;
            dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
            switch (actionId) {
                case ZenithConvert.MessageContainer.Action.Id.Publish:
                    if (message.Topic !== Zenith.MarketController.TopicName.QueryMarkets) {
                        throw new ZenithDataError(ExternalError.Code.MMCPMTP2998377, message.Topic);
                    } else {
                        const publishMsg = message as Zenith.MarketController.Markets.PublishSubPayloadMessageContainer;
                        dataMessage.markets = parseData(publishMsg.Data);
                    }
                    break;
                case ZenithConvert.MessageContainer.Action.Id.Sub:
                    if (!message.Topic.startsWith(Zenith.MarketController.TopicName.Markets)) {
                        throw new ZenithDataError(ExternalError.Code.MMCPMTS2998377, message.Topic);
                    } else {
                        const subMsg = message as Zenith.MarketController.Markets.PublishSubPayloadMessageContainer;
                        dataMessage.markets = parseData(subMsg.Data);
                    }
                    break;
                default:
                    throw new UnexpectedCaseError('MMCPMU4483969993', actionId.toString(10));
            }

            return dataMessage;
        }
    }

    function parseData(data: Zenith.MarketController.Markets.MarketState[]) {
        const result = new Array<MarketsDataMessage.Market>(data.length);
        let count = 0;
        for (let index = 0; index < data.length; index++) {
            const account = ZenithConvert.MarketState.toAdi(data[index]);
            result[count++] = account;
        }
        result.length = count;
        return result;
    }
}
