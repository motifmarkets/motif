/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness, Correctness, CorrectnessId, MultiEvent } from 'src/sys/internal-api';
import { FeedId, OrderStatusesDataDefinition } from './common/internal-api';
import { DataItem } from './data-item';
import { OrderStatusesDataItem } from './order-statuses-data-item';

export class OrderStatusesFetcher {
    correctnessChangedEvent: OrderStatusesFetcher.CorrectnessChangedEventHandler;

    private _dataItem: OrderStatusesDataItem;
    private _correctnessChangeSubscriptionId: MultiEvent.SubscriptionId;

    private _unsubscribeDateItemFtn: DataItem.UnsubscribeDataItemFtn;

    constructor(tradingFeedId: FeedId, subscribeDateItemFtn: DataItem.SubscribeDataItemFtn,
        unsubscribeDateItemFtn: DataItem.UnsubscribeDataItemFtn
    ) {
        this._unsubscribeDateItemFtn = unsubscribeDateItemFtn;

        const orderStatusesDefinition = new OrderStatusesDataDefinition();
        orderStatusesDefinition.tradingFeedId = tradingFeedId;
        this._dataItem = subscribeDateItemFtn(orderStatusesDefinition) as OrderStatusesDataItem;
        this._dataItem.setFeedId(tradingFeedId);
        if (!this.completed) {
            this._correctnessChangeSubscriptionId = this._dataItem.subscribeCorrectnessChangeEvent(
                () => this.handleCorrectnessChangeEvent()
            );
        }
    }

    get badness(): Badness { return this._dataItem.badness; }
    get completed() { return Correctness.idIsIncubated(this.correctnessId); }
    get correctnessId(): CorrectnessId { return this._dataItem.correctnessId; }
    get orderStatuses() { return this._dataItem.orderStatuses; }

    finalise() {
        this._dataItem.unsubscribeCorrectnessChangeEvent(this._correctnessChangeSubscriptionId);
        this._unsubscribeDateItemFtn(this._dataItem);
    }

    private handleCorrectnessChangeEvent() {
        this.correctnessChangedEvent();
    }
}

export namespace OrderStatusesFetcher {
    export type CorrectnessChangedEventHandler = (this: void) => void;
}
