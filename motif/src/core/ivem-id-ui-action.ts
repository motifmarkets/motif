/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExchangeId, IvemId } from 'src/adi/internal-api';
import { MultiEvent } from 'src/sys/internal-api';
import { SymbolsService } from './symbols-service';
import { UiAction } from './ui-action';

export class IvemIdUiAction extends UiAction {
    private _value: IvemId | undefined;
    private _definedValue: IvemId = IvemIdUiAction.undefinedIvemId;
    private _parseDetails: SymbolsService.IvemIdParseDetails;

    private _ivemIdPushMultiEvent = new MultiEvent<IvemIdUiAction.PushEventHandlersInterface>();

    get valueUndefined() { return this._value === undefined; }

    get value() { return this._value; }
    get definedValue() { return this._definedValue; }
    get parseDetails() { return this._parseDetails; }

    commitValue(parseDetails: SymbolsService.IvemIdParseDetails, typeId: UiAction.CommitTypeId) {
        this._parseDetails = parseDetails;
        this._value = parseDetails.ivemId; // owns value
        this.setDefinedValue();
        this.commit(typeId);
    }

    pushValue(value: IvemId | undefined, selectAll: boolean = true) {
        this.pushValueWithoutAutoAcceptance(value, selectAll);
        this.pushAutoAcceptance();
    }

    subscribePushEvents(handlersInterface: IvemIdUiAction.PushEventHandlersInterface) {
        const subscriptionId = super.subscribePushEvents(handlersInterface);
        return this._ivemIdPushMultiEvent.subscribeWithId(handlersInterface, subscriptionId);
    }

    unsubscribePushEvents(subscriptionId: MultiEvent.SubscriptionId) {
        this._ivemIdPushMultiEvent.unsubscribe(subscriptionId);
        super.unsubscribePushEvents(subscriptionId);
    }

    protected repushValue() {
        this.pushValueWithoutAutoAcceptance(this._value, true);
    }

    private notifyValuePush(selectAll: boolean) {
        const handlersInterfaces = this._ivemIdPushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.value !== undefined) {
                handlersInterface.value(this.value, this.edited);
            }
        }
    }

    private setDefinedValue() {
        if (this._value !== undefined) {
            this._definedValue = this._value;
        } else {
            this._definedValue = IvemIdUiAction.undefinedIvemId;
        }
    }

    private pushValueWithoutAutoAcceptance(value: IvemId | undefined, selectAll: boolean) {
        this._value = value === undefined ? undefined : value.createCopy();
        this.setDefinedValue();
        this.notifyValuePush(selectAll);
    }
}

export namespace IvemIdUiAction {
    export const undefinedIvemId = new IvemId('', ExchangeId.Calastone); // should never be used

    export type ValuePushEventHander = (this: void, value: IvemId | undefined, selectAll: boolean) => void;

    export interface PushEventHandlersInterface extends UiAction.PushEventHandlersInterface {
        value?: ValuePushEventHander;
    }
}
