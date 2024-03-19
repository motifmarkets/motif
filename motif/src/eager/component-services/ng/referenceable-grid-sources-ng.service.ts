/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { TypedReferenceableGridSourcesService } from '@motifmarkets/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class ReferenceableGridSourcesNgService {
    private _service: TypedReferenceableGridSourcesService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.referenceableGridSourcesService;
    }

    get service() { return this._service; }
}
