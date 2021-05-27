/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { MultiEvent } from 'src/sys/internal-api';

@Injectable({
    providedIn: 'root'
})
export class NgSelectOverlayNgService {
    dropDownPanelWidthEvent: NgSelectOverlayNgService.SelectDropDownPanelWidthEvent;
    firstColumnWidthEvent: NgSelectOverlayNgService.SelectFirstColumnWidthEvent;

    private _measureCanvasContext: CanvasRenderingContext2D;
    private _measureBoldCanvasContext: CanvasRenderingContext2D;

    private _measureCanvasContextsMultiEvent = new MultiEvent<NgSelectOverlayNgService.MeasureCanvasContextsEvent>();

    get measureCanvasContext() { return this._measureCanvasContext; }
    get measureBoldCanvasContext() { return this._measureBoldCanvasContext; }

    setDropDownPanelWidth(width: string) {
        this.dropDownPanelWidthEvent(width);
    }

    setFirstColumnWidth(width: string) {
        this.firstColumnWidthEvent(width);
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
    export type SelectDropDownPanelWidthEvent = (this: void, width: string) => void;
    export type SelectFirstColumnWidthEvent = (this: void, width: string) => void;
    export type MeasureCanvasContextsEvent = (this: void) => void;
}
