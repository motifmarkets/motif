/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ExternalError, Logger, ZenithDataError } from 'src/sys/internal-api';
import {
    MoveOrderRequestDataDefinition,
    MoveOrderResponseDataMessage,
    PublisherRequest,
    PublisherSubscription
} from '../../../common/internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';
import { ZenithOrderConvert } from './zenith-order-convert';

export namespace MoveOrderMessageConvert {

    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof MoveOrderRequestDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('MOMCCRM55583399', definition.description);
        }
    }

    export function createPublishMessage(definition: MoveOrderRequestDataDefinition) {
        const result: Zenith.TradingController.MoveOrder.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Trading,
            Topic: Zenith.TradingController.TopicName.MoveOrder,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: PublisherRequest.getNextTransactionId(),
            Data: {
                Account: ZenithConvert.EnvironmentedAccount.fromId(definition.accountId),
                OrderID: definition.orderId,
                Flags: definition.flags === undefined ? undefined : ZenithConvert.OrderRequestFlag.fromIdArray(definition.flags),
                Destination: ZenithConvert.EnvironmentedAccount.fromId(definition.destination),
            }
        };

        const messageText = JSON.stringify(result);
        Logger.logInfo('Move Order Request', messageText);

        return result;
    }

    export function parseMessage(subscription: PublisherSubscription, message: Zenith.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {

        const messageText = JSON.stringify(message);
        Logger.logInfo('Move Order Response', messageText);

        if (message.Controller !== Zenith.MessageContainer.Controller.Trading) {
            throw new ZenithDataError(ExternalError.Code.MOMCPMA6744444883, message.Controller);
        } else {
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Publish) {
                throw new ZenithDataError(ExternalError.Code.MOMCPMA333928660, JSON.stringify(message));
            } else {
                if (message.Topic !== Zenith.TradingController.TopicName.MoveOrder) {
                    throw new ZenithDataError(ExternalError.Code.MOMCPMT1009199929, message.Topic);
                } else {
                    const responseMsg = message as Zenith.TradingController.MoveOrder.PublishPayloadMessageContainer;
                    const response = responseMsg.Data;

                    const dataMessage = new MoveOrderResponseDataMessage();
                    dataMessage.dataItemId = subscription.dataItemId;
                    dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
                    dataMessage.result = ZenithConvert.OrderRequestResult.toId(response.Result);
                    const order = response.Order;
                    dataMessage.order = order === undefined ? undefined : ZenithOrderConvert.toAddUpdateChange(order);
                    const errors = response.Errors;
                    dataMessage.errors = errors === undefined ? undefined : ZenithConvert.OrderRequestError.toErrorArray(errors);

                    return dataMessage;
                }
            }
        }
    }
}
