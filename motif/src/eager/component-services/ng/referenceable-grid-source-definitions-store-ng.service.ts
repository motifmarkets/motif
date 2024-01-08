/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { ReferenceableGridSourceDefinitionsStoreService } from '@motifmarkets/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class ReferenceableGridSourceDefinitionsStoreNgService {
    private _service: ReferenceableGridSourceDefinitionsStoreService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.referenceableGridSourceDefinitionsStoreService;
    }

    get service() { return this._service; }
}
