/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable, NgZone } from '@angular/core';
import { IdleService } from '@motifmarkets/motif-core';

@Injectable({
    providedIn: 'root',
})
export class IdleNgService {
    private _service: IdleService;

    constructor(ngZone: NgZone) {
        this._service = new IdleService();
        this._service.callbackExecuteEventer = (idleCallbackClosure) => {
            ngZone.runGuarded(idleCallbackClosure);
        }
    }

    get service() { return this._service; }
}
