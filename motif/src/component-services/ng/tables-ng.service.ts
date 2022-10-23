/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { TablesService } from '@motifmarkets/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class TablesNgService {
    private _service: TablesService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.tablesService;
    }

    get service() { return this._service; }
}
