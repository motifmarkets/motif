/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { RevFieldCustomHeadingsService } from '@xilytix/rev-data-source';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root'
})
export class GridFieldCustomHeadingsNgService {
    private _service: RevFieldCustomHeadingsService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.revFieldCustomHeadingsService;
    }

    get service() { return this._service; }
}
