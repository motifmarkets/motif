/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { NotImplementedError } from 'src/sys/internal-api';
import { DataMessage, PublisherRequest, PublisherSubscription } from '../../../common/internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';

export namespace OrderRequestsMessageConvert {
    export function createRequestMessage(request: PublisherRequest): Zenith.MessageContainer {
        throw new NotImplementedError('ORMCCRM11111009');
    }

    export function parseMessage(subscription: PublisherSubscription, message: Zenith.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id): DataMessage {
        throw new NotImplementedError('ORMCPM5920000201');
    }
}
