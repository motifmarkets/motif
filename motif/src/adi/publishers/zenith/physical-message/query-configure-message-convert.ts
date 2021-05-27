/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ExternalError, SysTick, ZenithDataError } from 'src/sys/internal-api';
import { PublisherRequest, PublisherSubscription } from '../../../common/internal-api';
import { ZenithQueryConfigureDataDefinition } from '../zenith-data-definitions';
import { ZenithQueryConfigureDataMessage } from '../zenith-data-messages';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';

export namespace QueryConfigureMessageConvert {

    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof ZenithQueryConfigureDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('QCMCCRM338843593', definition.description);
        }
    }

    function createPublishMessage(definition: ZenithQueryConfigureDataDefinition) {
        const result: Zenith.ControllersCommon.QueryConfigure.PublishRequestMessageContainer = {
            Controller: definition.controller,
            Topic: Zenith.ControllersCommon.TopicName.QueryConfigure,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: PublisherRequest.getNextTransactionId(),
        };

        return result;
    }

    export function parseMessage(subscription: PublisherSubscription, message: Zenith.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {
        if (actionId !== ZenithConvert.MessageContainer.Action.Id.Publish) {
            throw new ZenithDataError(ExternalError.Code.QCMCPMA788853223, JSON.stringify(message));
        } else {
            if (message.Topic !== Zenith.ControllersCommon.TopicName.QueryConfigure) {
                throw new ZenithDataError(ExternalError.Code.QCMCPMT10053584222, message.Topic);
            } else {
                const responseMsg = message as Zenith.ControllersCommon.QueryConfigure.PayloadMessageContainer;
                const {actionTimeout, subscriptionTimeout} = parseData(responseMsg.Data);

                const dataMessage = new ZenithQueryConfigureDataMessage(subscription.dataItemId, subscription.dataItemRequestNr,
                    actionTimeout, subscriptionTimeout);

                return dataMessage;
            }
        }
    }

    function parseData(payload: Zenith.ControllersCommon.QueryConfigure.Payload) {
        const payloadActionTimeout = payload.ActionTimeout;
        let actionTimeout: SysTick.Span;
        if (payloadActionTimeout === undefined) {
            actionTimeout = Zenith.ControllersCommon.QueryConfigure.defaultActionTimeout;
        } else {
            const parsedActionTimeout = ZenithConvert.Time.toTimeSpan(payloadActionTimeout);
            if (parsedActionTimeout === undefined) {
                throw new ZenithDataError(ExternalError.Code.ZCQCTAA7744510945348, payloadActionTimeout);
            } else {
                actionTimeout = parsedActionTimeout;
            }
        }

        const payloadSubscriptionTimeout = payload.SubscriptionTimeout;
        let subscriptionTimeout: SysTick.Span;
        if (payloadSubscriptionTimeout === undefined) {
            subscriptionTimeout = Zenith.ControllersCommon.QueryConfigure.defaultSubscriptionTimeout;
        } else {
            const parsedSubscriptionTimeout = ZenithConvert.Time.toTimeSpan(payloadSubscriptionTimeout);
            if (parsedSubscriptionTimeout === undefined) {
                throw new ZenithDataError(ExternalError.Code.ZCQCTAS7744510945348, payloadSubscriptionTimeout);
            } else {
                subscriptionTimeout = parsedSubscriptionTimeout;
            }
        }

        const parsedData: ParsedData = {
            actionTimeout,
            subscriptionTimeout,
        };

        return parsedData;
    }
}

export namespace QueryConfigureMessageConvert {
    export interface ParsedData {
        actionTimeout: SysTick.Span;
        subscriptionTimeout: SysTick.Span;
    }
}
