/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { SessionInfoService } from '../session-info-service';

@Injectable({
    providedIn: 'root'
})
export class SessionInfoNgService {
    private _service: SessionInfoService;

    get service() { return this._service; }

    constructor() { }

    setSessionInfo(value: SessionInfoService) {
        this._service = value;
    }
}
