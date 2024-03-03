/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable, OnDestroy } from '@angular/core';
import { ToastService } from '../toast-service';

@Injectable({
    providedIn: 'root'
})
export class ToastNgService implements OnDestroy {
    private readonly _service: ToastService;

    constructor() {
        this._service = new ToastService();
    }

    get service() { return this._service; }

    ngOnDestroy() {
        this._service.finalise();
    }

    popup(text: string) {
        this._service.popup(text);
    }
}
