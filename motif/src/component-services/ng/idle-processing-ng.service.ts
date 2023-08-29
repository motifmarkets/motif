/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { IdleProcessingService } from '@motifmarkets/motif-core';

@Injectable({
    providedIn: 'root',
})
export class IdleProcessingNgService {
    private _service: IdleProcessingService;

    constructor() {
        this._service = new IdleProcessingService();
    }

    get service() { return this._service; }
}
