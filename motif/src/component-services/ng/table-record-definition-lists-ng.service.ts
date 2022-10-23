/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { TableRecordDefinitionListsService } from '@motifmarkets/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class TableRecordDefinitionListsNgService {
    private _service: TableRecordDefinitionListsService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.tableRecordDefinitionListsService;
    }

    get service() { return this._service; }
}
