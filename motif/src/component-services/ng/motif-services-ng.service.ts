/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { MotifServicesService } from 'src/core/internal-api';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class MotifServicesNgService {
    private _service: MotifServicesService;

    get service() { return this._service; }

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.motifServicesService;
    }
}
