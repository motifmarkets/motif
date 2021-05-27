/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer, MultiEvent } from 'src/sys/internal-api';
import { UiAction } from './ui-action';

export abstract class EnumUiAction extends UiAction {

    private _value: Integer | undefined;
    private _definedValue: Integer = EnumUiAction.undefinedElement;
    private _filter: readonly Integer[] | undefined;

    private _enumPushMultiEvent = new MultiEvent<EnumUiAction.PushEventHandlersInterface>();

    get valueUndefined() { return this._value === undefined; }

    get value() { return this._value; }
    get definedValue() { return this._definedValue; }
    get filter() { return this._filter; }

    commitValue(value: Integer | undefined, typeId: UiAction.CommitTypeId) {
        this._value = value;
        this.setDefinedValue();
        this.commit(typeId);
    }

    pushValue(value: Integer | undefined) {
        this.pushValueWithoutAutoAcceptance(value);
        this.pushAutoAcceptance();
    }

    pushFilter(value: readonly Integer[] | undefined) {
        this._filter = value;
        this.notifyFilterPush();
    }

    subscribePushEvents(handlersInterface: EnumUiAction.PushEventHandlersInterface) {
        const subscriptionId = super.subscribePushEvents(handlersInterface);
        return this._enumPushMultiEvent.subscribeWithId(handlersInterface, subscriptionId);
    }

    unsubscribePushEvents(subscriptionId: MultiEvent.SubscriptionId) {
        this._enumPushMultiEvent.unsubscribe(subscriptionId);
        super.unsubscribePushEvents(subscriptionId);
    }

    protected repushValue() {
        this.pushValueWithoutAutoAcceptance(this._value);
    }

    protected notifyElementPush(element: Integer, caption: string, title: string) {
        const handlersInterfaces = this._enumPushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.element !== undefined) {
                handlersInterface.element(element, caption, title);
            }
        }
    }

    protected notifyElementsPush(filter: Integer[] | undefined | null) {
        if (filter !== null) {
            if (filter === undefined) {
                this._filter = undefined;
            } else {
                this._filter = filter.slice();
            }
        }

        const handlersInterfaces = this._enumPushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.elements !== undefined) {
                handlersInterface.elements();
            }
        }
    }

    private notifyValuePush() {
        const handlersInterfaces = this._enumPushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.value !== undefined) {
                handlersInterface.value(this.value);
            }
        }
    }

    private notifyFilterPush() {
        const handlersInterfaces = this._enumPushMultiEvent.copyHandlers();
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
            this._definedValue = EnumUiAction.undefinedElement;
        }
    }

    private pushValueWithoutAutoAcceptance(value: Integer | undefined) {
        this._value = value;
        this.setDefinedValue();
        this.notifyValuePush();
    }

    abstract getElementProperties(element: Integer): EnumUiAction.ElementProperties | undefined;
    abstract getElementPropertiesArray(): EnumUiAction.ElementProperties[];
}

export namespace EnumUiAction {
    export const undefinedElement = -99999;

    export interface ElementProperties {
        element: Integer;
        caption: string;
        title: string;
    }

    export type ElementPushEventHandler = (this: void, element: Integer, caption: string, title: string) => void;
    export type ElementsPushEventHandler = (this: void) => void;
    export type ValuePushEventHandler = (this: void, value: Integer | undefined) => void;
    export type FilterPushEventHandler = (this: void, value: readonly Integer[] | undefined) => void;

    export interface PushEventHandlersInterface extends UiAction.PushEventHandlersInterface {
        element?: ElementPushEventHandler;
        elements?: ElementsPushEventHandler;
        value?: ValuePushEventHandler;
        filter?: FilterPushEventHandler;
    }
}
