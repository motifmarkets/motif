/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataChannelId, PublisherSubscription, PublisherSubscriptionDataDefinition } from '../../common/internal-api';
import { Zenith } from './physical-message/zenith';

// This may need to be moved out of here to handle PublisherOnlined

export class ZenithQueryConfigureDataDefinition extends PublisherSubscriptionDataDefinition {
    override publisherRequestSendPriorityId = PublisherSubscription.RequestSendPriorityId.High;

    controller: Zenith.MessageContainer.Controller;

    constructor() {
        super(DataChannelId.ZenithQueryConfigure);
    }

    get referencable() { return false; }

    protected override getDescription(): string {
        return super.getDescription() + ' Controller: ' + this.controller;
    }
}
