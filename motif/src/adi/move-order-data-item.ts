/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataDefinition, DataMessage, DataMessageTypeId, MoveOrderResponseDataMessage, OrderRequestTypeId } from './common/internal-api';
import { OrderRequestDataItem } from './order-request-data-item';

export class MoveOrderDataItem extends OrderRequestDataItem {
    constructor(MyDataDefinition: DataDefinition) {
        super(MyDataDefinition, OrderRequestTypeId.Move);
    }

    get estimatedBrokerage() { return undefined; }
    get estimatedTax() { return undefined; }
    get estimatedValue() { return undefined; }

    processMessage(msg: DataMessage) { // virtual;
        if (msg.typeId !== DataMessageTypeId.MoveOrderResponse) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                this.notifyUpdateChange();
                this.processMessage_MoveOrderResponse(msg as MoveOrderResponseDataMessage);
            } finally {
                this.endUpdate();
            }
        }
    }

    private processMessage_MoveOrderResponse(msg: MoveOrderResponseDataMessage) {
        super.processMessage_OrderResponse(msg);
    }
}
