/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { AppStorageService } from 'src/core/internal-api';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class AppStorageNgService {
    private _appStorage: AppStorageService;

    constructor(coreNgService: CoreNgService) {
        this._appStorage = coreNgService.appStorageService;
    }

    get appStorage() { return this._appStorage; }
}
