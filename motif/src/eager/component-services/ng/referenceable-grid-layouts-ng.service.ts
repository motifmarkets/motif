/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { ReferenceableGridLayoutsService } from '@motifmarkets/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class ReferenceableGridLayoutsNgService {
    private _service: ReferenceableGridLayoutsService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.referenceableGridLayoutsService;
    }

    get service() { return this._service; }
}
