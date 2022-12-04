/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { NamedGridSourcesService } from '@motifmarkets/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class NamedGridSourcesNgService {
    private _service: NamedGridSourcesService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.namedGridSourcesService;
    }

    get service() { return this._service; }
}
