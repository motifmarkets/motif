/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CancelOrderResponseDataMessage, DataDefinition, DataMessage, DataMessageTypeId, OrderRequestTypeId } from './common/internal-api';
import { OrderRequestDataItem } from './order-request-data-item';

export class CancelOrderDataItem extends OrderRequestDataItem {
    constructor(MyDataDefinition: DataDefinition) {
        super(MyDataDefinition, OrderRequestTypeId.Cancel);
    }

    get estimatedBrokerage() { return undefined; }
    get estimatedTax() { return undefined; }
    get estimatedValue() { return undefined; }

    processMessage(msg: DataMessage) { // virtual;
        if (msg.typeId !== DataMessageTypeId.CancelOrderResponse) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                this.notifyUpdateChange();
                this.processMessage_CancelOrderResponse(msg as CancelOrderResponseDataMessage);
            } finally {
                this.endUpdate();
            }
        }
    }

    private processMessage_CancelOrderResponse(msg: CancelOrderResponseDataMessage) {
        super.processMessage_OrderResponse(msg);
    }
}
