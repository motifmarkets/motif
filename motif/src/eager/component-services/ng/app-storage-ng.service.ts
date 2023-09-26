/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { AppStorageService } from '@motifmarkets/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class AppStorageNgService {
    private _service: AppStorageService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.appStorageService;
    }

    get service() { return this._service; }
}
