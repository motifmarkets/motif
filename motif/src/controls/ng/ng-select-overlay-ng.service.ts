/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { MultiEvent } from 'sys-internal-api';

@Injectable({
    providedIn: 'root'
})
export class NgSelectOverlayNgService {
    dropDownOpenEvent: NgSelectOverlayNgService.DropDownOpenEvent;
    dropDownPanelClientWidthEvent: NgSelectOverlayNgService.SelectDropDownPanelClientWidthEvent;
    firstColumnWidthEvent: NgSelectOverlayNgService.SelectFirstColumnWidthEvent;

    private _measureCanvasContext: CanvasRenderingContext2D;
    private _measureBoldCanvasContext: CanvasRenderingContext2D;

    private _measureCanvasContextsMultiEvent = new MultiEvent<NgSelectOverlayNgService.MeasureCanvasContextsEvent>();

    get measureCanvasContext() { return this._measureCanvasContext; }
    get measureBoldCanvasContext() { return this._measureBoldCanvasContext; }

    notifyDropDownOpen() {
        this.dropDownOpenEvent();
    }

    setDropDownPanelClientWidth(clientWidth: number, widenOnly: boolean) {
        this.dropDownPanelClientWidthEvent(clientWidth, widenOnly);
    }

    setFirstColumnWidth(width: number, widenOnly: boolean) {
        this.firstColumnWidthEvent(width, widenOnly);
    }

    setMeasureCanvasContexts(context: CanvasRenderingContext2D, boldContext: CanvasRenderingContext2D) {
        this._measureCanvasContext = context;
        this._measureBoldCanvasContext = boldContext;
        this.notifyMeasureCanvasContextsEvent();
    }

    subscribeMeasureCanvasContextsEvent(handler: NgSelectOverlayNgService.MeasureCanvasContextsEvent) {
        return this._measureCanvasContextsMultiEvent.subscribe(handler);
    }

    unsubscribeMeasureCanvasContextsEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._measureCanvasContextsMultiEvent.unsubscribe(subscriptionId);
    }

    private notifyMeasureCanvasContextsEvent() {
        const handlers = this._measureCanvasContextsMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler();
        }
    }
}

export namespace NgSelectOverlayNgService {
    export type DropDownOpenEvent = (this: void) => void;
    export type SelectDropDownPanelClientWidthEvent = (this: void, clientWidth: number, widenOnly: boolean) => void;
    export type SelectFirstColumnWidthEvent = (this: void, width: number, widenOnly: boolean) => void;
    export type MeasureCanvasContextsEvent = (this: void) => void;
}
