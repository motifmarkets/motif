/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ExternalError, Logger, newUndefinableDecimal, ZenithDataError } from 'sys-internal-api';
import {
    AmendOrderRequestDataDefinition,
    AmendOrderResponseDataMessage,
    PublisherRequest,
    PublisherSubscription
} from '../../../common/internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';
import { ZenithOrderConvert } from './zenith-order-convert';

export namespace AmendOrderMessageConvert {

    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof AmendOrderRequestDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('AOMCCRM993117333', definition.description);
        }
    }

    export function createPublishMessage(definition: AmendOrderRequestDataDefinition) {
        const result: Zenith.TradingController.AmendOrder.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Trading,
            Topic: Zenith.TradingController.TopicName.AmendOrder,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: PublisherRequest.getNextTransactionId(),
            Data: {
                Account: ZenithConvert.EnvironmentedAccount.fromId(definition.accountId),
                Details: ZenithConvert.PlaceOrderDetails.from(definition.details),
                OrderID: definition.orderId,
                Flags: definition.flags === undefined ? undefined : ZenithConvert.OrderRequestFlag.fromIdArray(definition.flags),
                Route: definition.route === undefined ? undefined : ZenithConvert.PlaceOrderRoute.from(definition.route),
                Condition: definition.trigger === undefined ? undefined : ZenithConvert.PlaceOrderCondition.from(definition.trigger),
            }
        };

        const messageText = JSON.stringify(result);
        Logger.logInfo('Amend Order Request', messageText);

        return result;
    }

    export function parseMessage(subscription: PublisherSubscription, message: Zenith.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {

        const messageText = JSON.stringify(message);
        Logger.logInfo('Amend Order Response', messageText);

        if (message.Controller !== Zenith.MessageContainer.Controller.Trading) {
            throw new ZenithDataError(ExternalError.Code.AOMCPMC585822200, message.Controller);
        } else {
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Publish) {
                throw new ZenithDataError(ExternalError.Code.AOMCPMA333928660, JSON.stringify(message));
            } else {
                if (message.Topic !== Zenith.TradingController.TopicName.AmendOrder) {
                    throw new ZenithDataError(ExternalError.Code.AOMCPMT1009199929, message.Topic);
                } else {
                    const responseMsg = message as Zenith.TradingController.AmendOrder.PublishPayloadMessageContainer;
                    const response = responseMsg.Data;
                    const dataMessage = new AmendOrderResponseDataMessage();
                    dataMessage.dataItemId = subscription.dataItemId;
                    dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
                    dataMessage.result = ZenithConvert.OrderRequestResult.toId(response.Result);
                    const order = response.Order;
                    dataMessage.order = order === undefined ? undefined : ZenithOrderConvert.toAddUpdateChange(order);
                    const errors = response.Errors;
                    dataMessage.errors = errors === undefined ? undefined : ZenithConvert.OrderRequestError.toErrorArray(errors);
                    dataMessage.estimatedBrokerage = newUndefinableDecimal(response.EstimatedBrokerage);
                    dataMessage.estimatedTax = newUndefinableDecimal(response.EstimatedTax);
                    dataMessage.estimatedValue = newUndefinableDecimal(response.EstimatedValue);
                    return dataMessage;
                }
            }
        }
    }
}
