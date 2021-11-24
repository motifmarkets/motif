/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { AdiService } from 'adi-internal-api';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class AdiNgService {
    private _adiService: AdiService;

    constructor(coreNgService: CoreNgService) {
        this._adiService = coreNgService.adi;
    }

    get adiService() { return this._adiService; }
}
