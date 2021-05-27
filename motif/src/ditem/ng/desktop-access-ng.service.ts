/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { DesktopAccessService } from '../desktop-access-service';

@Injectable({
    providedIn: 'root',
})
export class DesktopAccessNgService {
    initialLoadedEvent: DesktopAccessNgService.InitialLoadedEvent;

    private _service: DesktopAccessService;

    get service() { return this._service; }

    setService(value: DesktopAccessService) {
        this._service = value;
        this._service.initialLoadedEvent = () => this.handleServiceInitialLoadedEvent();
    }

    private handleServiceInitialLoadedEvent() {
        this.initialLoadedEvent();
    }
}

export namespace DesktopAccessNgService {
    export type InitialLoadedEvent = (this: void) => void;
}
