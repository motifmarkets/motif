/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ExternalError, ZenithDataError } from 'sys-internal-api';
import {
    PublisherRequest,
    PublisherSubscription,
    ZenithServerInfoDataDefinition,
    ZenithServerInfoDataMessage
} from '../../../common/internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';

export namespace ServerInfoMessageConvert {

    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof ZenithServerInfoDataDefinition) {
            return createSubUnsubMessage(definition, request.typeId);
        } else {
            throw new AssertInternalError('SIOMCCRM55583399', definition.description);
        }
    }

    function createSubUnsubMessage(definition: ZenithServerInfoDataDefinition, requestTypeId: PublisherRequest.TypeId) {
        const result: Zenith.SubUnsubMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Zenith,
            Topic: Zenith.ZenithController.TopicName.ServerInfo,
            Action: ZenithConvert.MessageContainer.Action.fromRequestTypeId(requestTypeId),
        };

        return result;
    }

    export function parseMessage(subscription: PublisherSubscription, message: Zenith.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {
        if (message.Controller !== Zenith.MessageContainer.Controller.Zenith) {
            throw new ZenithDataError(ExternalError.Code.SICAPMT95883743, message.Controller);
        } else {
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Sub) {
                throw new ZenithDataError(ExternalError.Code.SISOMCPMA333928660, JSON.stringify(message));
            } else {
                if (message.Topic !== Zenith.ZenithController.TopicName.ServerInfo) {
                    throw new ZenithDataError(ExternalError.Code.SISOMCPMT1009199929, message.Topic);
                } else {
                    const payloadMsg = message as Zenith.ZenithController.ServerInfo.SubPayloadMessageContainer;
                    const payload = payloadMsg.Data;

                    const dataMessage = new ZenithServerInfoDataMessage();
                    dataMessage.dataItemId = subscription.dataItemId;
                    dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
                    dataMessage.serverName = payload.Name;
                    dataMessage.serverClass = payload.Class;
                    dataMessage.softwareVersion = payload.Version;
                    dataMessage.protocolVersion = payload.Protocol;

                    return dataMessage;
                }
            }
        }
    }
}
