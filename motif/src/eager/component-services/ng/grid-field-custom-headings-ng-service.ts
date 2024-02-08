/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { GridFieldCustomHeadingsService } from '@motifmarkets/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root'
})
export class GridFieldCustomHeadingsNgService {
    private _service: GridFieldCustomHeadingsService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.gridFieldCustomHeadingsService;
    }

    get service() { return this._service; }
}
