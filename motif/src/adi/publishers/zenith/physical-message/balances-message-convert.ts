/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ExternalError, Logger, UnexpectedCaseError, ZenithDataError } from 'sys-internal-api';
import {
    BalancesDataMessage,
    BrokerageAccountBalancesDataDefinition,
    ErrorPublisherSubscriptionDataMessage_DataError,
    PublisherRequest,
    PublisherSubscription,
    QueryBrokerageAccountBalancesDataDefinition
} from '../../../common/internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';

export namespace BalancesMessageConvert {

    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof BrokerageAccountBalancesDataDefinition) {
            return createSubUnsubMessage(definition, request.typeId);
        } else {
            if (definition instanceof QueryBrokerageAccountBalancesDataDefinition) {
                return createPublishMessage(definition);
            } else {
                throw new AssertInternalError('TCBCM548192875', definition.description);
            }
        }
    }

    function createPublishMessage(definition: QueryBrokerageAccountBalancesDataDefinition) {
        const account = ZenithConvert.EnvironmentedAccount.fromId(definition.accountId, definition.environmentId);
        const result: Zenith.TradingController.Balances.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Trading,
            Topic: Zenith.TradingController.TopicName.QueryBalances,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: PublisherRequest.getNextTransactionId(),
            Data: {
                Account: account,
            }
        };

        return result;
    }

    function createSubUnsubMessage(definition: BrokerageAccountBalancesDataDefinition, requestTypeId: PublisherRequest.TypeId) {
        const topicName = Zenith.TradingController.TopicName.Balances;
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
            throw new ZenithDataError(ExternalError.Code.BMCPMC393833421, message.Controller);
        } else {
            let changesOrErrorText: BalancesDataMessage.Change[] | string;
            switch (actionId) {
                case ZenithConvert.MessageContainer.Action.Id.Publish:
                    if (message.Topic !== Zenith.TradingController.TopicName.QueryBalances) {
                        throw new ZenithDataError(ExternalError.Code.BMCPMP9833333828, message.Topic);
                    } else {
                        const publishMsg = message as Zenith.TradingController.Balances.PublishSubPayloadMessageContainer;
                        changesOrErrorText = parseData(publishMsg.Data);
                    }
                    break;
                case ZenithConvert.MessageContainer.Action.Id.Sub:
                    if (!message.Topic.startsWith(Zenith.TradingController.TopicName.Balances)) {
                        throw new ZenithDataError(ExternalError.Code.BMCPMS7744777737277, message.Topic);
                    } else {
                        const subMsg = message as Zenith.TradingController.Balances.PublishSubPayloadMessageContainer;
                        changesOrErrorText = parseData(subMsg.Data);
                    }
                    break;
                default:
                    throw new UnexpectedCaseError('BMCPMD43888432888448', actionId.toString(10));
            }

            if (typeof changesOrErrorText === 'string') {
                const errorText = 'Balances: ' + changesOrErrorText;
                Logger.logDataError('BMCPME989822220', errorText);
                const errorMessage = new ErrorPublisherSubscriptionDataMessage_DataError(subscription.dataItemId,
                    subscription.dataItemRequestNr,
                    errorText,
                    PublisherSubscription.AllowedRetryTypeId.Never
                );
                return errorMessage;
            } else {
                const dataMessage = new BalancesDataMessage();
                dataMessage.dataItemId = subscription.dataItemId;
                dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
                dataMessage.changes = changesOrErrorText;
                return dataMessage;
            }
        }
    }

    function parseData(balances: Zenith.TradingController.Balances.Balance[]) {
        const result = new Array<BalancesDataMessage.Change>(balances.length);
        let count = 0;
        for (let index = 0; index < balances.length; index++) {
            const balance = balances[index];
            const change = ZenithConvert.Balances.toChange(balance);
            if (typeof change !== 'string') {
                result[count++] = change;
            } else {
                return change; // Error Text string;
            }
        }
        result.length = count;
        return result;
    }
}
