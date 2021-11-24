/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MultiEvent } from 'sys-internal-api';
import { UiAction } from './ui-action';

export abstract class ArrayUiAction<T> extends UiAction {

    private _value: readonly T[] | undefined;
    private _definedValue: readonly T[] = ArrayUiAction.undefinedArray;
    private _filter: readonly T[] | undefined;

    private _arrayPushMultiEvent = new MultiEvent<ArrayUiAction.PushEventHandlersInterface<T>>();

    get valueUndefined() { return this._value === undefined; }

    get value() { return this._value; }
    get definedValue() { return this._definedValue; }
    get filter() { return this._filter; }

    commitValue(value: readonly T[] | undefined, typeId: UiAction.CommitTypeId) {
        this._value = value;
        this.setDefinedValue();
        this.commit(typeId);
    }

    pushValue(value: readonly T[] | undefined) {
        this.pushValueWithoutAutoAcceptance(value);
        this.pushAutoAcceptance();
    }

    pushFilter(value: readonly T[] | undefined) {
        this._filter = value;
        this.notifyFilterPush();
    }

    override subscribePushEvents(handlersInterface: ArrayUiAction.PushEventHandlersInterface<T>) {
        const subscriptionId = super.subscribePushEvents(handlersInterface);
        return this._arrayPushMultiEvent.subscribeWithId(handlersInterface, subscriptionId);
    }

    override unsubscribePushEvents(subscriptionId: MultiEvent.SubscriptionId) {
        this._arrayPushMultiEvent.unsubscribe(subscriptionId);
        super.unsubscribePushEvents(subscriptionId);
    }

    protected notifyElementPush(element: T, caption: string, title: string) {
        const handlersInterfaces = this._arrayPushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.element !== undefined) {
                handlersInterface.element(element, caption, title);
            }
        }
    }

    protected notifyElementsPush(filter: T[] | undefined | null) {
        if (filter !== null) {
            if (filter === undefined) {
                this._filter = undefined;
            } else {
                this._filter = filter.slice();
            }
        }

        const handlersInterfaces = this._arrayPushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.elements !== undefined) {
                handlersInterface.elements();
            }
        }
    }

    protected repushValue() {
        this.pushValueWithoutAutoAcceptance(this._value);
    }

    private notifyValuePush() {
        const handlersInterfaces = this._arrayPushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.value !== undefined) {
                handlersInterface.value(this.value);
            }
        }
    }

    private notifyFilterPush() {
        const handlersInterfaces = this._arrayPushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.filter !== undefined) {
                handlersInterface.filter(this._filter);
            }
        }
    }

    private setDefinedValue() {
        if (this._value !== undefined) {
            this._definedValue = this._value;
        } else {
            this._definedValue = ArrayUiAction.undefinedArray;
        }
    }

    private pushValueWithoutAutoAcceptance(value: readonly T[] | undefined) {
        this._value = value;
        this.setDefinedValue();
        this.notifyValuePush();
    }

    abstract getElementProperties(element: T): ArrayUiAction.ElementProperties<T> | undefined;
    abstract getElementPropertiesArray(): ArrayUiAction.ElementProperties<T>[];
}

export namespace ArrayUiAction {
    export const undefinedArray = [];

    export interface ElementProperties<T> {
        element: T;
        caption: string;
        title: string;
    }

    export type ElementPushEventHandler<T> = (this: void, element: T, caption: string, title: string) => void;
    export type ElementsPushEventHandler = (this: void) => void;
    export type ValuePushEventHandler<T> = (this: void, value: readonly T[] | undefined) => void;
    export type FilterPushEventHandler<T> = (this: void, value: readonly T[] | undefined) => void;

    export interface PushEventHandlersInterface<T> extends UiAction.PushEventHandlersInterface {
        element?: ElementPushEventHandler<T>;
        elements?: ElementsPushEventHandler;
        value?: ValuePushEventHandler<T>;
        filter?: FilterPushEventHandler<T>;
    }
}
