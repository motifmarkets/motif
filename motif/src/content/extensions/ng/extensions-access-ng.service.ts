/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { ExtensionsAccessService } from '../extensions-access-service';

@Injectable({
    providedIn: 'root'
})
export class ExtensionsAccessNgService {
    private _service: ExtensionsAccessService;

    get service() { return this._service; }

    setService(value: ExtensionsAccessService) {
        this._service = value;
    }
}
