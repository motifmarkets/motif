/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { SharedGridSourcesService } from '@motifmarkets/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class SharedGridSourcesNgService {
    private _service: SharedGridSourcesService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.sharedGridSourcesService;
    }

    get service() { return this._service; }
}
