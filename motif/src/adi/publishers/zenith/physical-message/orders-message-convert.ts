/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ExternalError, UnexpectedCaseError, ZenithDataError } from 'sys-internal-api';
import {
    AurcChangeTypeId,
    BrokerageAccountOrdersDataDefinition,
    OrdersDataMessage,
    PublisherRequest,
    PublisherSubscription,
    QueryBrokerageAccountOrdersDataDefinition
} from '../../../common/internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';
import { ZenithOrderConvert } from './zenith-order-convert';

export namespace OrdersMessageConvert {

    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof BrokerageAccountOrdersDataDefinition) {
            return createSubUnsubMessage(definition, request.typeId);
        } else {
            if (definition instanceof QueryBrokerageAccountOrdersDataDefinition) {
                return createPublishMessage(definition);
            } else {
                throw new AssertInternalError('TCOCM9842242384', definition.description);
            }
        }
    }

    function createPublishMessage(definition: QueryBrokerageAccountOrdersDataDefinition) {
        const account = ZenithConvert.EnvironmentedAccount.fromId(definition.accountId, definition.environmentId);
        const orderId = definition.orderId;

        const result: Zenith.TradingController.Orders.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Trading,
            Topic: Zenith.TradingController.TopicName.QueryHoldings,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: PublisherRequest.getNextTransactionId(),
            Data: {
                Account: account,
                OrderID: orderId,
            }
        };

        return result;
    }

    function createSubUnsubMessage(definition: BrokerageAccountOrdersDataDefinition, requestTypeId: PublisherRequest.TypeId) {
        const topicName = Zenith.TradingController.TopicName.Orders;
        const enviromentedAccount = ZenithConvert.EnvironmentedAccount.fromId(definition.accountId, definition.environmentId);

        const result: Zenith.SubUnsubMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Trading,
            Topic: topicName + Zenith.topicArgumentsAnnouncer + enviromentedAccount,
            Action: ZenithConvert.MessageContainer.Action.fromRequestTypeId(requestTypeId),
        };

        return result;
    }

    export function parseMessage(subscription: PublisherSubscription, message: Zenith.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {

        if (message.Controller !== Zenith.MessageContainer.Controller.Trading) {
            throw new ZenithDataError(ExternalError.Code.TCOPMC9923852488, message.Controller);
        } else {
            const dataMessage = new OrdersDataMessage();
            dataMessage.dataItemId = subscription.dataItemId;
            dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
            switch (actionId) {
                case ZenithConvert.MessageContainer.Action.Id.Publish:
                    if (message.Topic !== Zenith.TradingController.TopicName.QueryOrders) {
                        throw new ZenithDataError(ExternalError.Code.TCOPMP555832222, message.Topic);
                    } else {
                        const publishMsg = message as Zenith.TradingController.Orders.PublishPayloadMessageContainer;
                        dataMessage.changeRecords = parsePublishMessageData(publishMsg.Data);
                    }
                    break;
                case ZenithConvert.MessageContainer.Action.Id.Sub:
                    if (!message.Topic.startsWith(Zenith.TradingController.TopicName.Orders)) {
                        throw new ZenithDataError(ExternalError.Code.TCOPMS884352993242, message.Topic);
                    } else {
                        const subMsg = message as Zenith.TradingController.Orders.SubPayloadMessageContainer;
                        dataMessage.changeRecords = parseSubMessageData(subMsg.Data);
                    }
                    break;
                default:
                    throw new UnexpectedCaseError('TCOPMU12122209553', actionId.toString(10));
            }

            return dataMessage;
        }
    }

    function parsePublishMessageData(data: Zenith.TradingController.Orders.PublishPayload) {
        const result = new Array<OrdersDataMessage.ChangeRecord>(data.length);
        for (let index = 0; index < data.length; index++) {
            const zenithOrder = data[index];
            try {
                const changeRecord: OrdersDataMessage.ChangeRecord = {
                    typeId: AurcChangeTypeId.Add,
                    change: ZenithOrderConvert.toAddChange(zenithOrder)
                };
                result[index] = changeRecord;
            } catch (e) {
                if (e instanceof Error) {
                    e.message += ` Index: ${index}`;
                }
                throw e;
            }
        }
        return result;
    }

    function parseSubMessageData(data: Zenith.TradingController.Orders.SubPayload) {
        const result = new Array<OrdersDataMessage.ChangeRecord>(data.length);
        let count = 0;
        for (let index = 0; index < data.length; index++) {
            const record = parseChangeRecord(data[index]);
            result[count++] = record;
        }
        return result;
    }

    function parseChangeRecord(cr: Zenith.TradingController.Orders.OrderChangeRecord): OrdersDataMessage.ChangeRecord {
        const typeId = ZenithConvert.AurcChangeType.toId(cr.O);
        if (typeId === AurcChangeTypeId.Clear) {
            const account = cr.Account;
            if (account !== undefined) {
                const environmentedAccountId = ZenithConvert.EnvironmentedAccount.toId(account);
                const clearAccountChange = new OrdersDataMessage.ClearAccountChange();
                clearAccountChange.accountId = environmentedAccountId.accountId;
                // ignore environment.  Environment for orders must always be the same
                return {
                    typeId,
                    change: clearAccountChange,
                };
            } else {
                throw new ZenithDataError(ExternalError.Code.TCOTCOPCRA9741, `TypeId: ${typeId} Record: ${JSON.stringify(cr)}`);
            }
        } else {
            if (cr.Order !== undefined) {
                const change = ZenithOrderConvert.toChange(typeId, cr.Order);
                return {
                    typeId,
                    change,
                };
            } else {
                throw new ZenithDataError(ExternalError.Code.TCOTCOPCRO3232, `TypeId: ${typeId} Record: ${JSON.stringify(cr)}`);
            }
        }
    }
}
