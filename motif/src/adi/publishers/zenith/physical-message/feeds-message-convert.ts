/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ExternalError, ZenithDataError } from 'sys-internal-api';
import { FeedsDataDefinition, FeedsDataMessage, PublisherRequest, PublisherSubscription } from '../../../common/internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';

export namespace FeedsMessageConvert {
    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof FeedsDataDefinition) {
            return createSubUnsubRequestMessage(request.typeId);
        } else {
            throw new AssertInternalError('FMCCRM09993444447', definition.description);
        }
    }

    function createSubUnsubRequestMessage(requestTypeId: PublisherRequest.TypeId) {
        const topic = Zenith.ZenithController.TopicName.Feeds;
        const action = ZenithConvert.MessageContainer.Action.fromRequestTypeId(requestTypeId);

        const result: Zenith.SubUnsubMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Zenith,
            Topic: topic,
            Action: action,
            TransactionID: PublisherRequest.getNextTransactionId(),
        };

        return result;
    }

    export function parseMessage(subscription: PublisherSubscription, message: Zenith.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {
        if (message.Controller !== Zenith.MessageContainer.Controller.Zenith) {
            throw new ZenithDataError(ExternalError.Code.FMCPMC4433149989, message.Controller);
        } else {
            const dataMessage = new FeedsDataMessage();
            dataMessage.dataItemId = subscription.dataItemId;
            dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Sub) {
                throw new ZenithDataError(ExternalError.Code.FMCPMA5583200023, JSON.stringify(message));
            } else {
                if (message.Topic !== Zenith.ZenithController.TopicName.Feeds) {
                    throw new ZenithDataError(ExternalError.Code.FMCPMT5583200023, JSON.stringify(message));
                } else {
                    const subMsg = message as Zenith.ZenithController.Feeds.PayloadMessageContainer;
                    dataMessage.feeds = parseData(subMsg.Data);
                    return dataMessage;
                }
            }
        }
    }

    function parseData(data: Zenith.ZenithController.Feeds.Payload) {
        const result = new Array<FeedsDataMessage.Feed>(data.length);
        let count = 0;
        for (let index = 0; index < data.length; index++) {
            const feed = ZenithConvert.Feed.toAdi(data[index]);
            result[count++] = feed;
        }
        result.length = count;
        return result;
    }
}
