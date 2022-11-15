/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { NamedGridLayoutDefinitionsService } from '@motifmarkets/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class NamedGridLayoutDefinitionsNgService {
    private _service: NamedGridLayoutDefinitionsService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.namedGridLayoutDefinitionsService;
    }

    get service() { return this._service; }
}
