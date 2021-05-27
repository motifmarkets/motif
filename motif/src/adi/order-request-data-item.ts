/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import Decimal from 'decimal.js-light';
import { AssertInternalError } from 'src/sys/internal-api';
import {
    DataDefinition,
    OrderRequestError,
    OrderRequestResultId,
    OrderRequestTypeId,
    OrderResponseDataMessage,
    OrdersDataMessage
} from './common/internal-api';
import { PublisherSubscriptionDataItem } from './publisher-subscription-data-item';

export abstract class OrderRequestDataItem extends PublisherSubscriptionDataItem {
    protected _result: OrderRequestResultId;
    protected _order: OrdersDataMessage.AddUpdateChange | undefined;
    protected _errors: OrderRequestError[] | undefined;

    get requestTypeId() { return this._requestTypeId; }
    get result() { return this._result; }
    get order() { return this._order; }
    get errors() { return this._errors; }

    abstract get estimatedBrokerage(): Decimal | undefined;
    abstract get estimatedTax(): Decimal | undefined;
    abstract get estimatedValue(): Decimal | undefined;

    constructor(MyDataDefinition: DataDefinition, private _requestTypeId: OrderRequestTypeId) {
        super(MyDataDefinition);
    }

    protected processSubscriptionPreOnline() {
        if (this._result !== undefined) {
            // We should never get more than one response to an order request
            throw new AssertInternalError('ORDIPSPO655224399');
        }
    }

    protected processMessage_OrderResponse(msg: OrderResponseDataMessage) {
        this._result = msg.result;
        this._order = msg.order;
        this._errors = msg.errors;
    }
}
