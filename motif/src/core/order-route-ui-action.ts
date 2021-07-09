/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FixOrderRoute, OrderRoute } from 'src/adi/internal-api';
import { MultiEvent } from 'src/sys/internal-api';
import { UiAction } from './ui-action';

export class OrderRouteUiAction extends UiAction {

    private _value: OrderRoute | undefined;
    private _definedValue: OrderRoute = OrderRouteUiAction.undefinedOrderRoute;
    private _allowedValues: readonly OrderRoute[] = [];

    private _orderRoutePushMultiEvent = new MultiEvent<OrderRouteUiAction.PushEventHandlersInterface>();

    get valueUndefined() { return this._value === undefined; }

    get value() { return this._value; }
    get definedValue() { return this._definedValue; }
    get allowedValues() { return this._allowedValues; }

    commitValue(value: OrderRoute | undefined, typeId: UiAction.CommitTypeId) {
        this._value = value; // owns value
        this.setDefinedValue();
        this.commit(typeId);
    }

    pushAllowedValues(allowedValues: readonly OrderRoute[]) {
        this._allowedValues = OrderRoute.cloneArray(allowedValues);
        this.notifyAllowedValuesPush();
    }

    pushValue(value: OrderRoute | undefined) {
        this.pushValueWithoutAutoAcceptance(value);
        this.pushAutoAcceptance();
    }

    override subscribePushEvents(handlersInterface: OrderRouteUiAction.PushEventHandlersInterface) {
        const subscriptionId = super.subscribePushEvents(handlersInterface);
        return this._orderRoutePushMultiEvent.subscribeWithId(handlersInterface, subscriptionId);
    }

    override unsubscribePushEvents(subscriptionId: MultiEvent.SubscriptionId) {
        this._orderRoutePushMultiEvent.unsubscribe(subscriptionId);
        super.unsubscribePushEvents(subscriptionId);
    }

    protected repushValue() {
        this.pushValueWithoutAutoAcceptance(this._value);
    }

    private notifyValuePush() {
        const handlersInterfaces = this._orderRoutePushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.value !== undefined) {
                handlersInterface.value(this.value);
            }
        }
    }

    private notifyAllowedValuesPush() {
        const handlersInterfaces = this._orderRoutePushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.allowedValues !== undefined) {
                handlersInterface.allowedValues(this._allowedValues);
            }
        }
    }

    private setDefinedValue() {
        if (this._value !== undefined) {
            this._definedValue = this._value;
        } else {
            this._definedValue = OrderRouteUiAction.undefinedOrderRoute;
        }
    }

    private pushValueWithoutAutoAcceptance(value: OrderRoute | undefined) {
        this._value = value === undefined ? undefined : value.createCopy();
        this.setDefinedValue();
        this.notifyValuePush();
    }
}

export namespace OrderRouteUiAction {
    export const undefinedOrderRoute = new FixOrderRoute();

    export type ValuePushEventHandler = (this: void, value: OrderRoute | undefined) => void;
    export type AllowedValuesPushEventHandler = (this: void, values: readonly OrderRoute[]) => void;

    export interface PushEventHandlersInterface extends UiAction.PushEventHandlersInterface {
        value?: ValuePushEventHandler;
        allowedValues?: AllowedValuesPushEventHandler;
    }
}
