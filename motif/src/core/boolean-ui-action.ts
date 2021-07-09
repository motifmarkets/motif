/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MultiEvent } from 'src/sys/internal-api';
import { UiAction } from './ui-action';

export class BooleanUiAction extends UiAction {

    private _value: boolean | undefined = undefined;
    private _definedValue: boolean = BooleanUiAction.undefinedBoolean;

    private _booleanPushMultiEvent = new MultiEvent<BooleanUiAction.PushEventHandlersInterface>();

    get valueUndefined() { return this._value === undefined; }

    get value() { return this._value; }
    get definedValue() { return this._definedValue; }

    commitValue(value: boolean | undefined, typeId: UiAction.CommitTypeId) {
        this._value = value;
        this.setDefinedValue();
        this.commit(typeId);
    }

    pushValue(value: boolean | undefined) {
        this.pushValueWithoutAutoAcceptance(value);
        this.pushAutoAcceptance();
    }

    override subscribePushEvents(handlersInterface: BooleanUiAction.PushEventHandlersInterface) {
        const subscriptionId = super.subscribePushEvents(handlersInterface);
        return this._booleanPushMultiEvent.subscribeWithId(handlersInterface, subscriptionId);
    }

    override unsubscribePushEvents(subscriptionId: MultiEvent.SubscriptionId) {
        this._booleanPushMultiEvent.unsubscribe(subscriptionId);
        super.unsubscribePushEvents(subscriptionId);
    }

    protected repushValue() {
        this.pushValueWithoutAutoAcceptance(this._value);
    }

    private notifyValuePush() {
        const handlersInterfaces = this._booleanPushMultiEvent.copyHandlers();
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
            this._definedValue = BooleanUiAction.undefinedBoolean;
        }
    }

    private pushValueWithoutAutoAcceptance(value: boolean | undefined) {
        this._value = value;
        this.setDefinedValue();
        this.notifyValuePush();
    }
}

export namespace BooleanUiAction {
    export const undefinedBoolean = false; // not much else that can be used here

    export type ValuePushEventHander = (this: void, value: boolean | undefined) => void;

    export interface PushEventHandlersInterface extends UiAction.PushEventHandlersInterface {
        value?: ValuePushEventHander;
    }
}
