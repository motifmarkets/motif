/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { UserAlertService } from 'src/sys/internal-api';

@Injectable({
    providedIn: 'root'
})
export class UserAlertNgService {
    private _service: UserAlertService;

    get service() { return this._service; }

    constructor() {
        this._service = new UserAlertService();
    }
}
