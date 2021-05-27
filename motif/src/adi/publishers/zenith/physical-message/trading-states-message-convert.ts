/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ExternalError, ZenithDataError } from 'src/sys/internal-api';
import {
    PublisherRequest,
    PublisherSubscription,
    TradingStatesDataDefinition,
    TradingStatesDataMessage
} from '../../../common/internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';

export namespace TradingStatesMessageConvert {

    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof TradingStatesDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('OSOMCCRM55583399', definition.description);
        }
    }

    function createPublishMessage(definition: TradingStatesDataDefinition) {
        const market = ZenithConvert.EnvironmentedMarket.fromId(definition.marketId);

        const result: Zenith.MarketController.TradingStates.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Market,
            Topic: Zenith.MarketController.TopicName.QueryTradingStates,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: PublisherRequest.getNextTransactionId(),
            Data: {
                Market: market,
            }
        };

        return result;
    }

    export function parseMessage(subscription: PublisherSubscription, message: Zenith.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {
        if (message.Controller !== Zenith.MessageContainer.Controller.Market) {
            throw new ZenithDataError(ExternalError.Code.TSMCPMA6744444883, message.Controller);
        } else {
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Publish) {
                throw new ZenithDataError(ExternalError.Code.TSMCPMA333928660, JSON.stringify(message));
            } else {
                if (message.Topic !== Zenith.MarketController.TopicName.QueryTradingStates) {
                    throw new ZenithDataError(ExternalError.Code.TSMCPMT1009199929, message.Topic);
                } else {
                    const responseMsg = message as Zenith.MarketController.TradingStates.PublishPayloadMessageContainer;

                    const dataMessage = new TradingStatesDataMessage();
                    dataMessage.dataItemId = subscription.dataItemId;
                    dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
                    try {
                        dataMessage.states = parseData(responseMsg.Data);
                    } catch (error) {
                        if (error instanceof Error) {
                            error.message = 'TSMCPMP8559847: ' + error.message;
                        }
                        throw error;
                    }

                    return dataMessage;
                }
            }
        }
    }

    function parseData(value: Zenith.MarketController.TradingStates.TradeState[]) {
        return value.map((status) => ZenithConvert.TradingState.toAdi(status));
    }
}
