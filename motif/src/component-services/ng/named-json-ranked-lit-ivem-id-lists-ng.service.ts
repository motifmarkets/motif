/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { NamedJsonRankedLitIvemIdListsService } from '@motifmarkets/motif-core';

@Injectable({
    providedIn: 'root',
})
export class NamedJsonRankedLitIvemIdListsNgService {
    private _service: NamedJsonRankedLitIvemIdListsService;

    constructor() {
        this._service = new NamedJsonRankedLitIvemIdListsService();
    }

    get service() { return this._service; }
}
