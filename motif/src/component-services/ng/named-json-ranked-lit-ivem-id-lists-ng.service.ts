/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { NamedJsonRankedLitIvemIdListsService } from '@motifmarkets/motif-core';
import { AppStorageNgService } from './app-storage-ng.service';
import { IdleProcessingNgService } from './idle-processing-ng.service';

@Injectable({
    providedIn: 'root',
})
export class NamedJsonRankedLitIvemIdListsNgService {
    private _service: NamedJsonRankedLitIvemIdListsService;

    constructor(
        appStorageNgService: AppStorageNgService,
        idleProcessingNgService: IdleProcessingNgService,
    ) {
        this._service = new NamedJsonRankedLitIvemIdListsService(appStorageNgService.service, idleProcessingNgService.service);
    }

    get service() { return this._service; }
}
