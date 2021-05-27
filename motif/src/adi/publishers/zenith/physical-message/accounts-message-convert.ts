/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ExternalError, UnexpectedCaseError, ZenithDataError } from 'src/sys/internal-api';
import {
    BrokerageAccountsDataDefinition,
    BrokerageAccountsDataMessage,
    PublisherRequest,
    PublisherSubscription,
    QueryBrokerageAccountsDataDefinition
} from '../../../common/internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';

export namespace AccountsMessageConvert {
    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof BrokerageAccountsDataDefinition) {
            return createPublishSubUnsubRequestMessage(false, request.typeId);
        } else {
            if (definition instanceof QueryBrokerageAccountsDataDefinition) {
                return createPublishSubUnsubRequestMessage(true, request.typeId);
            } else {
                throw new AssertInternalError('TCACM5488388388', definition.description);
            }
        }
    }

    function createPublishSubUnsubRequestMessage(query: boolean, requestTypeId: PublisherRequest.TypeId) {
        let topic: string;
        let action: Zenith.MessageContainer.Action;
        if (query) {
            topic = Zenith.TradingController.TopicName.QueryAccounts;
            action = Zenith.MessageContainer.Action.Publish;
        } else {
            topic = Zenith.TradingController.TopicName.Accounts;
            action = ZenithConvert.MessageContainer.Action.fromRequestTypeId(requestTypeId);
        }

        const result: Zenith.TradingController.Accounts.PublishSubUnsubMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Trading,
            Topic: topic,
            Action: action,
            TransactionID: PublisherRequest.getNextTransactionId(),
        };

        return result;
    }

    export function parseMessage(subscription: PublisherSubscription, message: Zenith.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {
        if (message.Controller !== Zenith.MessageContainer.Controller.Trading) {
            throw new ZenithDataError(ExternalError.Code.TCAPMT95883743, message.Controller);
        } else {
            const dataMessage = new BrokerageAccountsDataMessage();
            dataMessage.dataItemId = subscription.dataItemId;
            dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
            switch (actionId) {
                case ZenithConvert.MessageContainer.Action.Id.Publish:
                    if (message.Topic !== Zenith.TradingController.TopicName.QueryAccounts) {
                        throw new ZenithDataError(ExternalError.Code.TCAPMTP2998377, message.Topic);
                    } else {
                        const publishMsg = message as Zenith.TradingController.Accounts.PublishSubPayloadMessageContainer;
                        dataMessage.accounts = parseData(publishMsg.Data);
                    }
                    break;
                case ZenithConvert.MessageContainer.Action.Id.Sub:
                    if (!message.Topic.startsWith(Zenith.TradingController.TopicName.Accounts)) {
                        throw new ZenithDataError(ExternalError.Code.TCAPMTS2998377, message.Topic);
                    } else {
                        const subMsg = message as Zenith.TradingController.Accounts.PublishSubPayloadMessageContainer;
                        dataMessage.accounts = parseData(subMsg.Data);
                    }
                    break;
                default:
                    throw new UnexpectedCaseError('TCAPMU4483969993', actionId.toString(10));
            }

            return dataMessage;
        }
    }

    function parseData(data: Zenith.TradingController.Accounts.AccountState[]) {
        const result = new Array<BrokerageAccountsDataMessage.Account>(data.length);
        let count = 0;
        for (let index = 0; index < data.length; index++) {
            const account = ZenithConvert.Accounts.toDataMessageAccount(data[index]);
            result[count++] = account;
        }
        result.length = count;
        return result;
    }
}
