/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer, MultiEvent } from 'src/sys/internal-api';
import { UiAction } from './ui-action';

export class NumberUiAction extends UiAction {

    private _value: number | undefined;
    private _definedValue: number = NumberUiAction.undefinedNumber;
    private _options = NumberUiAction.defaultOptions;

    private _numberPushMultiEvent = new MultiEvent<NumberUiAction.PushEventHandlersInterface>();

    get valueUndefined() { return this._value === undefined; }

    get value() { return this._value; }
    get definedValue() { return this._definedValue; }
    get options() { return this._options; }

    commitValue(value: number | undefined, typeId: UiAction.CommitTypeId) {
        this._value = value;
        this.setDefinedValue();
        this.commit(typeId);
    }

    pushValue(value: number | undefined) {
        this.pushValueWithoutAutoAcceptance(value);
        this.pushAutoAcceptance();
    }

    pushOptions(options: NumberUiAction.Options) {
        this._options = options;
        this.notifyOptionsPush();
    }

    subscribePushEvents(handlersInterface: NumberUiAction.PushEventHandlersInterface) {
        const subscriptionId = super.subscribePushEvents(handlersInterface);
        return this._numberPushMultiEvent.subscribeWithId(handlersInterface, subscriptionId);
    }

    unsubscribePushEvents(subscriptionId: MultiEvent.SubscriptionId) {
        this._numberPushMultiEvent.unsubscribe(subscriptionId);
        super.unsubscribePushEvents(subscriptionId);
    }

    protected repushValue() {
        this.pushValueWithoutAutoAcceptance(this._value);
    }

    private notifyValuePush() {
        const handlersInterfaces = this._numberPushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.value !== undefined) {
                handlersInterface.value(this.value);
            }
        }
    }

    private notifyOptionsPush() {
        const handlersInterfaces = this._numberPushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.options !== undefined) {
                handlersInterface.options(this.options);
            }
        }
    }

    private setDefinedValue() {
        if (this._value !== undefined) {
            this._definedValue = this._value;
        } else {
            this._definedValue = NumberUiAction.undefinedNumber;
        }
    }

    private pushValueWithoutAutoAcceptance(value: number | undefined) {
        this._value = value;
        this.setDefinedValue();
        this.notifyValuePush();
    }
}

export namespace NumberUiAction {
    export const undefinedNumber = Number.MIN_SAFE_INTEGER;
    export interface Options {
        integer?: boolean;
        max?: number;
        min?: number;
        step?: number;
        useGrouping?: boolean;
        minimumFractionDigits?: Integer;
        maximumFractionDigits?: Integer;
    }

    export type ValuePushEventHander = (this: void, value: number | undefined) => void;
    export type OptionsPushEventHandler = (this: void, options: Options) => void;

    export interface PushEventHandlersInterface extends UiAction.PushEventHandlersInterface {
        value?: ValuePushEventHander;
        options?: OptionsPushEventHandler;
    }

    export const defaultOptions: Options = {
        integer: false,
        max: undefined,
        min: undefined,
        step: undefined,
        useGrouping: undefined,
        minimumFractionDigits: undefined,
        maximumFractionDigits: undefined,
    };
}
