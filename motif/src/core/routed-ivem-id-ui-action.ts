/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BestMarketOrderRoute, ExchangeId, IvemId, RoutedIvemId } from 'src/adi/internal-api';
import { MultiEvent } from 'src/sys/internal-api';
import { SymbolsService } from './symbols-service';
import { UiAction } from './ui-action';

export class RoutedIvemIdUiAction extends UiAction {

    private _value: RoutedIvemId | undefined;
    private _definedValue: RoutedIvemId = RoutedIvemIdUiAction.undefinedRoutedIvemId;
    private _parseDetails: SymbolsService.RoutedIvemIdParseDetails;

    private _routedIvemIdPushMultiEvent = new MultiEvent<RoutedIvemIdUiAction.PushEventHandlersInterface>();

    get valueUndefined() { return this._value === undefined; }

    get value() { return this._value; }
    get definedValue() { return this._definedValue; }
    get parseDetails() { return this._parseDetails; }

    commitValue(parseDetails: SymbolsService.RoutedIvemIdParseDetails, typeId: UiAction.CommitTypeId) {
        this._parseDetails = parseDetails;
        this._value = parseDetails.routedIvemId; // owns value
        this.setDefinedValue();
        this.commit(typeId);
    }

    pushValue(value: RoutedIvemId | undefined, selectAll: boolean = true) {
        this.pushValueWithoutAutoAcceptance(value, selectAll);
        this.pushAutoAcceptance();
    }

    override subscribePushEvents(handlersInterface: RoutedIvemIdUiAction.PushEventHandlersInterface) {
        const subscriptionId = super.subscribePushEvents(handlersInterface);
        return this._routedIvemIdPushMultiEvent.subscribeWithId(handlersInterface, subscriptionId);
    }

    override unsubscribePushEvents(subscriptionId: MultiEvent.SubscriptionId) {
        this._routedIvemIdPushMultiEvent.unsubscribe(subscriptionId);
        super.unsubscribePushEvents(subscriptionId);
    }

    protected repushValue() {
        this.pushValueWithoutAutoAcceptance(this._value, true);
    }

    private notifyValuePush(selectAll: boolean) {
        const handlersInterfaces = this._routedIvemIdPushMultiEvent.copyHandlers();
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
            this._definedValue = RoutedIvemIdUiAction.undefinedRoutedIvemId;
        }
    }

    private pushValueWithoutAutoAcceptance(value: RoutedIvemId | undefined, selectAll: boolean) {
        this._value = value === undefined ? undefined : value.createCopy();
        this.setDefinedValue();
        this.notifyValuePush(selectAll);
    }
}

export namespace RoutedIvemIdUiAction {
    export const undefinedRoutedIvemId = new RoutedIvemId(
        new IvemId('', ExchangeId.Calastone), new BestMarketOrderRoute()
    ); // should never be used

    export type ValuePushEventHander = (this: void, value: RoutedIvemId | undefined, selectAll: boolean) => void;

    export interface PushEventHandlersInterface extends UiAction.PushEventHandlersInterface {
        value?: ValuePushEventHander;
    }
}
