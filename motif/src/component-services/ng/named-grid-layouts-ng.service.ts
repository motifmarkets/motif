/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { NamedGridLayoutsService } from '@motifmarkets/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class NamedGridLayoutsNgService {
    private _service: NamedGridLayoutsService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.namedGridLayoutsService;
    }

    get service() { return this._service; }
}
