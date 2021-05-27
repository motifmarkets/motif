/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { SettingsService } from 'src/core/internal-api';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root'
})
export class SettingsNgService {
    private _service: SettingsService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.settingsService;
    }

    get settingsService() { return this._service; }
}
