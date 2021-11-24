/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { defined, ExternalError, Integer, ZenithDataError } from 'sys-internal-api';
import { Zenith } from './zenith';

export namespace AuthOwnerMessageConvert {
    // AuthControllers are structured differently from other controllers
    // as they do not generate PariAdi messages

    export function createMessage(
        transactionId: Integer,
        provider: string,
        username: string,
        password: string,
        clientId: string,
        clientSecret?: string
    ): Zenith.AuthController.AuthOwner.PublishMessageContainer {

        return {
            Controller: Zenith.MessageContainer.Controller.Auth,
            Topic: Zenith.AuthController.TopicName.AuthOwner,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: transactionId,
            Data: {
                Provider: provider, // 'BasicAuth',
                ClientID: clientId,
                // ClientSecret: clientSecret,
                Username: username,
                Password: password,
            },
        };
    }

    export function parseMessage(message: Zenith.AuthController.AuthOwner.PublishPayloadMessageContainer) {
        // TODO:MED: It would be better to validate the incoming message instead of doing a blind typecast.
        if (message.Controller !== Zenith.MessageContainer.Controller.Auth) {
            throw new ZenithDataError(ExternalError.Code.ACAOPMC298431, message.Controller);
        } else {
            if (message.Topic !== Zenith.AuthController.TopicName.AuthOwner) {
                throw new ZenithDataError(ExternalError.Code.ACAOPMT377521, message.Topic);
            } else {
                if (message.Action === 'Error') {
                    throw new ZenithDataError(ExternalError.Code.ACAOPMA23964, 'Error Response');
                } else {
                    if (!defined(message.Data)) {
                        throw new ZenithDataError(ExternalError.Code.ACAOPMD29984, 'Message missing Data');
                    } else {
                        return message.Data;
                    }
                }
            }
        }
    }
}
