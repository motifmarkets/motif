/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MultiEvent, newUndefinableDate } from 'sys-internal-api';
import { UiAction } from './ui-action';

export class DateUiAction extends UiAction {
    private _value: Date | undefined;
    private _definedValue = DateUiAction.undefinedDate;

    private _datePushMultiEvent = new MultiEvent<DateUiAction.PushEventHandlersInterface>();

    get valueUndefined() { return this._value === undefined; }

    get value() { return this._value; }
    get definedValue() { return this._definedValue; }

    commitValue(value: Date | undefined, typeId: UiAction.CommitTypeId) {
        this._value = value; // owns value
        this.setDefinedValue();
        this.commit(typeId);
    }

    pushValue(value: Date | undefined) {
        this.pushValueWithoutAutoAcceptance(value);
        this.pushAutoAcceptance();
    }

    override subscribePushEvents(handlersInterface: DateUiAction.PushEventHandlersInterface) {
        const subscriptionId = super.subscribePushEvents(handlersInterface);
        return this._datePushMultiEvent.subscribeWithId(handlersInterface, subscriptionId);
    }

    override unsubscribePushEvents(subscriptionId: MultiEvent.SubscriptionId) {
        this._datePushMultiEvent.unsubscribe(subscriptionId);
        super.unsubscribePushEvents(subscriptionId);
    }

    protected repushValue() {
        this.pushValueWithoutAutoAcceptance(this._value);
    }

    private notifyValuePush() {
        const handlersInterfaces = this._datePushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.value !== undefined) {
                handlersInterface.value(this.value);
            }
        }
    }

    private setDefinedValue() {
        if (this._value !== undefined) {
            this._definedValue = this._value;
        } else {
            this._definedValue = DateUiAction.undefinedDate;
        }
    }

    private pushValueWithoutAutoAcceptance(value: Date | undefined) {
        this._value = newUndefinableDate(value);
        this.setDefinedValue();
        this.notifyValuePush();
    }
}

export namespace DateUiAction {
    export const undefinedDate = new Date(8640000000000000);

    export type ValuePushEventHander = (this: void, date: Date | undefined) => void;

    export interface PushEventHandlersInterface extends UiAction.PushEventHandlersInterface {
        value?: ValuePushEventHander;
    }
}
