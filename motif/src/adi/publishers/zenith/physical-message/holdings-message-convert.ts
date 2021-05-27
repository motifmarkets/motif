/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ExternalError, UnexpectedCaseError, ZenithDataError } from 'src/sys/internal-api';
import {
    AurcChangeTypeId,
    BrokerageAccountHoldingsDataDefinition,
    HoldingsDataMessage,
    PublisherRequest,
    PublisherSubscription,
    QueryBrokerageAccountHoldingsDataDefinition
} from '../../../common/internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';

export namespace HoldingsMessageConvert {

    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof BrokerageAccountHoldingsDataDefinition) {
            return createSubUnsubMessage(definition, request.typeId);
        } else {
            if (definition instanceof QueryBrokerageAccountHoldingsDataDefinition) {
                return createPublishMessage(definition);
            } else {
                throw new AssertInternalError('TCHCM6730002932', definition.description);
            }
        }
    }

    function createPublishMessage(definition: QueryBrokerageAccountHoldingsDataDefinition) {
        const account = ZenithConvert.EnvironmentedAccount.fromId(definition.accountId, definition.environmentId);
        let exchange: string | undefined;
        let code: string | undefined;
        const ivemId = definition.ivemId;
        if (ivemId === undefined) {
            exchange = undefined;
            code = undefined;
        } else {
            exchange = ZenithConvert.EnvironmentedExchange.fromId(ivemId.exchangeId, definition.environmentId);
            code = ivemId.code;
        }
        const result: Zenith.TradingController.Holdings.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Trading,
            Topic: Zenith.TradingController.TopicName.QueryHoldings,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: PublisherRequest.getNextTransactionId(),
            Data: {
                Account: account,
                Exchange: exchange,
                Code: code
            }
        };

        return result;
    }

    function createSubUnsubMessage(definition: BrokerageAccountHoldingsDataDefinition, requestTypeId: PublisherRequest.TypeId) {
        const topicName = Zenith.TradingController.TopicName.Holdings;
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
            throw new ZenithDataError(ExternalError.Code.TCHPMC5838323333, message.Controller);
        } else {
            const dataMessage = new HoldingsDataMessage();
            dataMessage.dataItemId = subscription.dataItemId;
            dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
            switch (actionId) {
                case ZenithConvert.MessageContainer.Action.Id.Publish:
                    if (message.Topic !== Zenith.TradingController.TopicName.QueryHoldings) {
                        throw new ZenithDataError(ExternalError.Code.TCHPMP68392967122, message.Topic);
                    } else {
                        const publishMsg = message as Zenith.TradingController.Holdings.PublishPayloadMessageContainer;
                        dataMessage.holdingChangeRecords = parsePublishMessageData(publishMsg.Data);
                    }
                    break;
                case ZenithConvert.MessageContainer.Action.Id.Sub:
                    if (!message.Topic.startsWith(Zenith.TradingController.TopicName.Holdings)) {
                        throw new ZenithDataError(ExternalError.Code.TCHPMS884352993242, message.Topic);
                    } else {
                        const subMsg = message as Zenith.TradingController.Holdings.SubPayloadMessageContainer;
                        dataMessage.holdingChangeRecords = parseSubMessageData(subMsg.Data);
                    }
                    break;
                default:
                    throw new UnexpectedCaseError('TCHPMU12122209553', actionId.toString(10));
            }

            return dataMessage;
        }
    }

    function parsePublishMessageData(data: Zenith.TradingController.Holdings.PublishPayload) {
        const result = new Array<HoldingsDataMessage.ChangeRecord>(data.length);
        for (let index = 0; index < data.length; index++) {
            const detail = data[index];
            try {
                const changeData = ZenithConvert.Holdings.toDataMessageAddUpdateChangeData(detail);
                const changeRecord: HoldingsDataMessage.ChangeRecord = {
                    typeId: AurcChangeTypeId.Add,
                    data: changeData
                };
                result[index] = changeRecord;
            } catch (e) {
                e.message += ` Index: ${index}`;
                throw e;
            }
        }
        return result;
    }

    function parseSubMessageData(data: Zenith.TradingController.Holdings.SubPayload) {
        const result = new Array<HoldingsDataMessage.ChangeRecord>(data.length);
        for (let index = 0; index < data.length; index++) {
            const zenithChangeRecord = data[index];
            try {
                const changeRecord = ZenithConvert.Holdings.toDataMessageChangeRecord(zenithChangeRecord);
                result[index] = changeRecord;
            } catch (e) {
                e.message += ` Index: ${index}`;
                throw e;
            }
        }
        return result;
    }
}
