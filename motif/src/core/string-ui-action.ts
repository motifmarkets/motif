/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MultiEvent } from 'sys-internal-api';
import { UiAction } from './ui-action';

export class StringUiAction extends UiAction {

    private _value: string | undefined;
    private _definedValue: string = StringUiAction.undefinedString;

    private _stringPushMultiEvent = new MultiEvent<StringUiAction.PushEventHandlersInterface>();

    get valueUndefined() { return this._value === undefined; }

    get value() { return this._value; }
    get definedValue() { return this._definedValue; }

    commitValue(value: string | undefined, typeId: UiAction.CommitTypeId) {
        this._value = value;
        this.setDefinedValue();
        this.commit(typeId);
    }

    pushValue(value: string | undefined) {
        this.pushValueWithoutAutoAcceptance(value);
        this.pushAutoAcceptance();
    }

    override subscribePushEvents(handlersInterface: StringUiAction.PushEventHandlersInterface) {
        const subscriptionId = super.subscribePushEvents(handlersInterface);
        return this._stringPushMultiEvent.subscribeWithId(handlersInterface, subscriptionId);
    }

    override unsubscribePushEvents(subscriptionId: MultiEvent.SubscriptionId) {
        this._stringPushMultiEvent.unsubscribe(subscriptionId);
        super.unsubscribePushEvents(subscriptionId);
    }

    protected repushValue() {
        this.pushValueWithoutAutoAcceptance(this._value);
    }

    private notifyValuePush() {
        const handlersInterfaces = this._stringPushMultiEvent.copyHandlers();
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
            this._definedValue = StringUiAction.undefinedString;
        }
    }

    private pushValueWithoutAutoAcceptance(value: string | undefined) {
        this._value = value;
        this.setDefinedValue();
        this.notifyValuePush();
    }
}

export namespace StringUiAction {
    export const undefinedString = '';
    export type ValuePushEventHander = (this: void, value: string | undefined) => void;

    export interface PushEventHandlersInterface extends UiAction.PushEventHandlersInterface {
        value?: ValuePushEventHander;
    }
}
