/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { ScansService } from '@motifmarkets/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root'
})
export class ScansNgService {
    private _service: ScansService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.scansService;
    }

    get service() { return this._service; }
}
