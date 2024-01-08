/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { AdiService } from '@motifmarkets/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class AdiNgService {
    private _service: AdiService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.adiService;
    }

    get service() { return this._service; }
}
