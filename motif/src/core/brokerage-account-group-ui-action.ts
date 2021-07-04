/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AllBrokerageAccountGroup, BrokerageAccountGroup } from 'src/adi/internal-api';
import { MultiEvent } from 'src/sys/internal-api';
import { UiAction } from './ui-action';

export class BrokerageAccountGroupUiAction extends UiAction {
    private _value: BrokerageAccountGroup | undefined;
    private _definedValue: BrokerageAccountGroup = BrokerageAccountGroupUiAction.undefinedBrokergeAccountGroup;
    private _options = BrokerageAccountGroupUiAction.defaultOptions;

    private _brokerageAccountIdPushMultiEvent = new MultiEvent<BrokerageAccountGroupUiAction.PushEventHandlersInterface>();

    get valueUndefined() { return this._value === undefined; }

    get value() { return this._value; }
    get definedValue() { return this._definedValue; }
    get options() { return this._options; }

    commitValue(value: BrokerageAccountGroup | undefined, typeId: UiAction.CommitTypeId) {
        this._value = value;
        this.setDefinedValue();
        this.commit(typeId);
    }

    pushValue(value: BrokerageAccountGroup | undefined) {
        this.pushValueWithoutAutoAcceptance(value);
        this.pushAutoAcceptance();
    }

    pushOptions(options: BrokerageAccountGroupUiAction.Options) {
        this._options = options;
        this.notifyOptionsPush();
    }

    override subscribePushEvents(handlersInterface: BrokerageAccountGroupUiAction.PushEventHandlersInterface) {
        const subscriptionId = super.subscribePushEvents(handlersInterface);
        return this._brokerageAccountIdPushMultiEvent.subscribeWithId(handlersInterface, subscriptionId);
    }

    override unsubscribePushEvents(subscriptionId: MultiEvent.SubscriptionId) {
        this._brokerageAccountIdPushMultiEvent.unsubscribe(subscriptionId);
        super.unsubscribePushEvents(subscriptionId);
    }

    protected repushValue() {
        this.pushValueWithoutAutoAcceptance(this._value);
    }

    private notifyValuePush() {
        const handlersInterfaces = this._brokerageAccountIdPushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.value !== undefined) {
                handlersInterface.value(this.value);
            }
        }
    }

    private notifyOptionsPush() {
        const handlersInterfaces = this._brokerageAccountIdPushMultiEvent.copyHandlers();
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
            this._definedValue = BrokerageAccountGroupUiAction.undefinedBrokergeAccountGroup;
        }
    }

    private pushValueWithoutAutoAcceptance(value: BrokerageAccountGroup | undefined) {
        this._value = value;
        this.setDefinedValue();
        this.notifyValuePush();
    }
}

export namespace BrokerageAccountGroupUiAction {
    export interface Options {
        allAllowed: boolean;
    }

    export const undefinedBrokergeAccountGroup: AllBrokerageAccountGroup = BrokerageAccountGroup.createAll();

    export type ValuePushEventHander = (this: void, value: BrokerageAccountGroup | undefined) => void;
    export type OptionsPushEventHandler = (this: void, options: Options) => void;

    export interface PushEventHandlersInterface extends UiAction.PushEventHandlersInterface {
        value?: ValuePushEventHander;
        options?: OptionsPushEventHandler;
    }

    export const defaultOptions: Options = {
        allAllowed: false,
    };
}
