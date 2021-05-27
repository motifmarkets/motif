/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { assert, UnexpectedTypeError } from 'src/sys/internal-api';
import { DataDefinition, DataMessage, DataMessageTypeId, OrderStatuses, OrderStatusesDataMessage } from './common/internal-api';
import { FeedSubscriptionDataItem } from './feed-subscription-data-item';

export class OrderStatusesDataItem extends FeedSubscriptionDataItem {
    private _orderStatuses: OrderStatuses;

    get orderStatuses() { return this._orderStatuses; }

    constructor(definition: DataDefinition) {
        super(definition, true);
    }

    processMessage(msg: DataMessage) { // virtual;
        if (msg.typeId !== DataMessageTypeId.OrderStatuses) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                this.notifyUpdateChange();

                if (msg instanceof OrderStatusesDataMessage) {
                    this.processOrderStatusesDataMessage(msg as OrderStatusesDataMessage);
                } else {
                    throw new UnexpectedTypeError('OSDIPM33855', '');
                }
            } finally {
                this.endUpdate();
            }
        }
    }

    findStatus(code: string) {
        for (let i = 0; i < this._orderStatuses.length; i++) {
            const status = this._orderStatuses[i];
            if (status.code === code) {
                return status;
            }
        }
        return undefined;
    }

    protected processSubscriptionPreOnline() { // virtual
        if (this._orderStatuses !== undefined && this._orderStatuses.length > 0) {
            this.beginUpdate();
            try {
                this.notifyUpdateChange();
                this._orderStatuses = [];
            } finally {
                this.endUpdate();
            }
        }
    }

    private processOrderStatusesDataMessage(msg: OrderStatusesDataMessage): void {
        assert(msg instanceof OrderStatusesDataMessage, 'ID:10206103657');
        this._orderStatuses = msg.statuses;
        this.trySetUsable(); // always query
    }
}
