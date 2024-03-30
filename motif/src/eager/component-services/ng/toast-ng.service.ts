/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { ToastService } from '../toast-service';
import { SettingsNgService } from './settings-ng.service';

@Injectable({
    providedIn: 'root'
})
export class ToastNgService {
    private readonly _service: ToastService;

    constructor(
        settingsNgService: SettingsNgService,
    ) {
        this._service = new ToastService(settingsNgService.service);
    }

    get service() { return this._service; }

    popup(text: string) {
        this._service.popup(text);
    }
}
