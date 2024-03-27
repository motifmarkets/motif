/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { RevReferenceableDataSourceDefinitionsStoreService } from '@motifmarkets/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class ReferenceableDataSourceDefinitionsStoreNgService {
    private _service: RevReferenceableDataSourceDefinitionsStoreService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.referenceableDataSourceDefinitionsStoreService;
    }

    get service() { return this._service; }
}
