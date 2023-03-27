/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectorRef, Directive, InjectionToken } from '@angular/core';
import {
    AmendOrderMessageConvert,
    AmendOrderRequestDataDefinition,
    CancelOrderMessageConvert,
    CancelOrderRequestDataDefinition,
    DataChannel,
    DataChannelId,
    MoveOrderMessageConvert,
    MoveOrderRequestDataDefinition,
    OrderPad,
    OrderRequestDataDefinition,
    PlaceOrderMessageConvert,
    PlaceOrderRequestDataDefinition,
    UnexpectedCaseError
} from '@motifmarkets/motif-core';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';

@Directive()
export class ReviewOrderRequestComponentNgDirective extends ContentComponentBaseNgDirective {
    public zenithMessageTitle = '';

    private _zenithMessageActive = false;
    private _zenithMessageText: string | undefined;

    constructor(private readonly _cdr: ChangeDetectorRef,
        private readonly _orderPad: OrderPad,
        private readonly _dataDefinition: OrderRequestDataDefinition
    ) {
        super();
    }

    public get zenithMessageActive() { return this._zenithMessageActive; }
    public get zenithMessageText() {
        if (this._zenithMessageText === undefined) {
            this._zenithMessageText = this.generateZenithMessageText();
        }
        return this._zenithMessageText;
    }

    get orderPad() { return this._orderPad; }
    get dataDefinition() { return this._dataDefinition; }

    setZenithMessageActive(value: boolean) {
        if (value !== this._zenithMessageActive) {
            this._zenithMessageActive = value;
            this.markForCheck();
        }
    }

    protected markForCheck() {
        this._cdr.markForCheck();
    }

    private generateZenithMessageText() {
        switch (this._dataDefinition.channelId) {
            case DataChannelId.PlaceOrderRequest: {
                const definition = this._dataDefinition as PlaceOrderRequestDataDefinition;
                const message = PlaceOrderMessageConvert.createPublishMessage(definition);
                return JSON.stringify(message, undefined, 2);
            }
            case DataChannelId.AmendOrderRequest: {
                const definition = this._dataDefinition as AmendOrderRequestDataDefinition;
                const message = AmendOrderMessageConvert.createPublishMessage(definition);
                return JSON.stringify(message, undefined, 2);
            }
            case DataChannelId.MoveOrderRequest: {
                const definition = this._dataDefinition as MoveOrderRequestDataDefinition;
                const message = MoveOrderMessageConvert.createPublishMessage(definition);
                return JSON.stringify(message, undefined, 2);
            }
            case DataChannelId.CancelOrderRequest: {
                const definition = this._dataDefinition as CancelOrderRequestDataDefinition;
                const message = CancelOrderMessageConvert.createPublishMessage(definition);
                return JSON.stringify(message, undefined, 2);
            }
            default:
                throw new UnexpectedCaseError('RORCDGZMT099999273', DataChannel.idToName(this._dataDefinition.channelId));
        }
    }
}

export namespace ReviewOrderRequestComponentNgDirective {
    const orderPadTokenName = 'orderPad';
    export const orderPadInjectionToken = new InjectionToken<OrderPad>(orderPadTokenName);
    const definitionTokenName = 'definition';
    export const definitionInjectionToken = new InjectionToken<OrderRequestDataDefinition>(definitionTokenName);
}
