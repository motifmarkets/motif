/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExchangeEnvironment, LitIvemId, MarketInfo } from 'src/adi/internal-api';
import { MultiEvent } from 'src/sys/internal-api';
import { SymbolsService } from './symbols-service';
import { UiAction } from './ui-action';

export class LitIvemIdUiAction extends UiAction {
    private _value: LitIvemId | undefined;
    private _definedValue: LitIvemId = LitIvemIdUiAction.undefinedLitIvemId;
    private _parseDetails: SymbolsService.LitIvemIdParseDetails;

    private _litIvemIdPushMultiEvent = new MultiEvent<LitIvemIdUiAction.PushEventHandlersInterface>();

    get valueUndefined() { return this._value === undefined; }

    get value() { return this._value; }
    get definedValue() { return this._definedValue; }
    get parseDetails() { return this._parseDetails; }

    commitValue(parseDetails: SymbolsService.LitIvemIdParseDetails, typeId: UiAction.CommitTypeId) {
        this._parseDetails = parseDetails;
        this._value = parseDetails.litIvemId; // owns value
        this.setDefinedValue();
        this.commit(typeId);
    }

    pushValue(value: LitIvemId | undefined, selectAll: boolean = true) {
        this.pushValueWithoutAutoAcceptance(value, selectAll);
        this.pushAutoAcceptance();
    }

    override subscribePushEvents(handlersInterface: LitIvemIdUiAction.PushEventHandlersInterface) {
        const subscriptionId = super.subscribePushEvents(handlersInterface);
        return this._litIvemIdPushMultiEvent.subscribeWithId(handlersInterface, subscriptionId);
    }

    override unsubscribePushEvents(subscriptionId: MultiEvent.SubscriptionId) {
        this._litIvemIdPushMultiEvent.unsubscribe(subscriptionId);
        super.unsubscribePushEvents(subscriptionId);
    }

    protected repushValue() {
        this.pushValueWithoutAutoAcceptance(this._value, true);
    }

    private notifyValuePush(selectAll: boolean) {
        const handlersInterfaces = this._litIvemIdPushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.value !== undefined) {
                handlersInterface.value(this.value, selectAll);
            }
        }
    }

    private setDefinedValue() {
        if (this._value !== undefined) {
            this._definedValue = this._value;
        } else {
            this._definedValue = LitIvemIdUiAction.undefinedLitIvemId;
        }
    }

    private pushValueWithoutAutoAcceptance(value: LitIvemId | undefined, selectAll: boolean) {
        this._value = value === undefined ? undefined : value.createCopy();
        this.setDefinedValue();
        this.notifyValuePush(selectAll);
    }
}

export namespace LitIvemIdUiAction {
    export const undefinedLitIvemId = new LitIvemId('', MarketInfo.nullId, ExchangeEnvironment.nullId); // should never be used

    export type ValuePushEventHander = (this: void, value: LitIvemId | undefined, selectAll: boolean) => void;

    export interface PushEventHandlersInterface extends UiAction.PushEventHandlersInterface {
        value?: ValuePushEventHander;
    }
}
