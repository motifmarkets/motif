/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { UserAlertService } from 'sys-internal-api';

@Injectable({
    providedIn: 'root'
})
export class UserAlertNgService {
    private _service: UserAlertService;

    constructor() {
        this._service = new UserAlertService();
    }

    get service() { return this._service; }
}
