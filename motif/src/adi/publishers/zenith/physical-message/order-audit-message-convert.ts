/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { NotImplementedError } from 'sys-internal-api';
import { DataMessage, PublisherRequest, PublisherSubscription } from '../../../common/internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';

export namespace OrderAuditMessageConvert {
    export function createRequestMessage(request: PublisherRequest): Zenith.MessageContainer {
        throw new NotImplementedError('OAMCCRM588388534434');
    }

    export function parseMessage(subscription: PublisherSubscription, message: Zenith.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id): DataMessage {
        throw new NotImplementedError('OAMCPM668488633434');
    }
}
