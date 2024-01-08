/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { IdleService } from '@motifmarkets/motif-core';

@Injectable({
    providedIn: 'root',
})
export class IdleNgService {
    private _service: IdleService;

    constructor() {
        this._service = new IdleService();
    }

    get service() { return this._service; }
}
