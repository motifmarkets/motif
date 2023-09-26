/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { MotifServicesService } from '@motifmarkets/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class MotifServicesNgService {
    private _service: MotifServicesService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.motifServicesService;
    }

    get service() { return this._service; }
}
