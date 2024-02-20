/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { NotificationChannelsService } from '@motifmarkets/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root'
})
export class NotificationChannelsNgService {
    private _service: NotificationChannelsService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.notificationChannelsService;
    }

    get service() { return this._service; }
}
