/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MultiEvent } from 'sys-internal-api';
import { UiAction } from '../ui-action';
import { Command } from './command';
import { CommandProcessor } from './command-processor';
import { CommandRegisterService } from './command-register-service';

export class ProcessorCommandUiAction extends UiAction {
    latestItemsWantedEvent: ProcessorCommandUiAction.LatestItemsWantedEventHandler | undefined;

    private readonly _undefinedItem: ProcessorCommandUiAction.Item;

    private _items: readonly ProcessorCommandUiAction.Item[] = [];
    private _value: ProcessorCommandUiAction.Item | undefined;
    private _definedValue: ProcessorCommandUiAction.Item;

    private _commandPushMultiEvent = new MultiEvent<ProcessorCommandUiAction.PushEventHandlersInterface>();

    constructor(private _commandRegisterService: CommandRegisterService) {
        super();
        this._undefinedItem = {
            command: _commandRegisterService.nullCommand,
            processor: CommandProcessor.nullCommandProcessor,
        } as const;
        this._definedValue = this._undefinedItem;
    }

    get valueUndefined() { return this._value === undefined; }

    get value() { return this._value; }
    get definedValue() { return this._definedValue; }
    get items() { return this._items; }

    isValueDefined() {
        return this._value !== undefined && !CommandRegisterService.isNullCommand(this._value.command);
    }

    commitValue(value: ProcessorCommandUiAction.Item | undefined, typeId: UiAction.CommitTypeId) {
        this._value = value;
        this.setDefinedValue();
        this.commit(typeId);
    }

    pushItems(itemsArray: readonly ProcessorCommandUiAction.Item[]) {
        this._items = itemsArray.slice();
        this.notifyItemsPush();
    }

    pushValue(value: ProcessorCommandUiAction.Item | undefined) {
        this.pushValueWithoutAutoAcceptance(value);
        this.pushAutoAcceptance();
    }

    notifyLatestItemsWanted() {
        if (this.latestItemsWantedEvent !== undefined) {
            this.latestItemsWantedEvent();
        }
    }

    override subscribePushEvents(handlersInterface: ProcessorCommandUiAction.PushEventHandlersInterface) {
        const subscriptionId = super.subscribePushEvents(handlersInterface);
        return this._commandPushMultiEvent.subscribeWithId(handlersInterface, subscriptionId);
    }

    override unsubscribePushEvents(subscriptionId: MultiEvent.SubscriptionId) {
        this._commandPushMultiEvent.unsubscribe(subscriptionId);
        super.unsubscribePushEvents(subscriptionId);
    }

    protected repushValue() {
        this.pushValueWithoutAutoAcceptance(this._value);
    }

    private notifyItemsPush() {
        const handlersInterfaces = this._commandPushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.items !== undefined) {
                handlersInterface.items();
            }
        }
    }

    private notifyValuePush() {
        const handlersInterfaces = this._commandPushMultiEvent.copyHandlers();
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
            this._definedValue = this._undefinedItem;
        }
    }

    private pushValueWithoutAutoAcceptance(value: ProcessorCommandUiAction.Item | undefined) {
        this._value = value;
        this.setDefinedValue();
        this.notifyValuePush();
    }
}

export namespace ProcessorCommandUiAction {
    export interface Item {
        readonly command: Command;
        readonly processor: CommandProcessor;
    }

    export type LatestItemsWantedEventHandler = (this: void) => void;

    export type ItemsPushEventHandler = (this: void) => void;
    export type ValuePushEventHandler = (this: void, value: ProcessorCommandUiAction.Item | undefined) => void;

    export interface PushEventHandlersInterface extends UiAction.PushEventHandlersInterface {
        items?: ItemsPushEventHandler;
        value?: ValuePushEventHandler;
    }
}
