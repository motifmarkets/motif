/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ExternalError, Logger, newUndefinableDecimal, ZenithDataError } from 'sys-internal-api';
import {
    PlaceOrderRequestDataDefinition,
    PlaceOrderResponseDataMessage,
    PublisherRequest,
    PublisherSubscription
} from '../../../common/internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';
import { ZenithOrderConvert } from './zenith-order-convert';

export namespace PlaceOrderMessageConvert {

    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof PlaceOrderRequestDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('POMCCRM4999938838', definition.description);
        }
    }

    export function createPublishMessage(definition: PlaceOrderRequestDataDefinition) {
        const flags = definition.flags === undefined || definition.flags.length === 0 ? undefined :
            ZenithConvert.OrderRequestFlag.fromIdArray(definition.flags);

        const result: Zenith.TradingController.PlaceOrder.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Trading,
            Topic: Zenith.TradingController.TopicName.PlaceOrder,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: PublisherRequest.getNextTransactionId(),
            Data: {
                Account: ZenithConvert.EnvironmentedAccount.fromId(definition.accountId),
                Details: ZenithConvert.PlaceOrderDetails.from(definition.details),
                Flags: flags,
                Route: ZenithConvert.PlaceOrderRoute.from(definition.route),
                Condition: definition.trigger === undefined ? undefined : ZenithConvert.PlaceOrderCondition.from(definition.trigger),
            }
        };

        const messageText = JSON.stringify(result);
        Logger.logInfo('Place Order Request', messageText);

        return result;
    }

    export function parseMessage(subscription: PublisherSubscription, message: Zenith.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {

        const messageText = JSON.stringify(message);
        Logger.logInfo('Place Order Response', messageText);

        if (message.Controller !== Zenith.MessageContainer.Controller.Trading) {
            throw new ZenithDataError(ExternalError.Code.POMCPMC4444838484, message.Controller);
        } else {
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Publish) {
                throw new ZenithDataError(ExternalError.Code.POMCPMA883771277577, JSON.stringify(message));
            } else {
                if (message.Topic !== Zenith.TradingController.TopicName.PlaceOrder) {
                    throw new ZenithDataError(ExternalError.Code.POMCPMT2323992323, message.Topic);
                } else {
                    const responseMsg = message as Zenith.TradingController.PlaceOrder.PublishPayloadMessageContainer;
                    const response = responseMsg.Data;
                    const dataMessage = new PlaceOrderResponseDataMessage();
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
