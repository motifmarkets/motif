/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { SessionInfoService } from '@motifmarkets/motif-core';

@Injectable({
    providedIn: 'root'
})
export class SessionInfoNgService {
    private _service: SessionInfoService;

    constructor() { }

    get service() { return this._service; }

    setSessionInfo(value: SessionInfoService) {
        this._service = value;
    }
}
