/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { NamedGridSourceDefinitionsService } from '@motifmarkets/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class NamedGridSourceDefinitionsNgService {
    private _service: NamedGridSourceDefinitionsService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.namedGridSourceDefinitionsService;
    }

    get service() { return this._service; }
}
