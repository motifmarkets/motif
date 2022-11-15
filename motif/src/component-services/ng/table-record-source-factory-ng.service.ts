/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { TableRecordSourceFactoryService } from '@motifmarkets/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class TableRecordSourceFactoryNgService {
    private _service: TableRecordSourceFactoryService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.tableRecordSourceFactoryService;
    }

    get service() { return this._service; }
}
