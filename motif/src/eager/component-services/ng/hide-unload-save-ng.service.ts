/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable, OnDestroy } from '@angular/core';
import { HideUnloadSaveService } from '../hide-unload-save-service';
import { UserAlertNgService } from './user-alert-ng.service';

@Injectable({
    providedIn: 'root',
})
export class HideUnloadSaveNgService implements OnDestroy {
    private readonly _service: HideUnloadSaveService;

    constructor(userAlertNgService: UserAlertNgService) {
        this._service = new HideUnloadSaveService(userAlertNgService.service);
    }

    get service() { return this._service; }

    ngOnDestroy() {
        this._service.finalise();
    }
}
