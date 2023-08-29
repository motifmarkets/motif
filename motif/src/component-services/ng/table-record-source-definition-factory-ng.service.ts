/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { TableRecordSourceDefinitionFactoryService } from '@motifmarkets/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class TableRecordSourceDefinitionFactoryNgService {
    private _service: TableRecordSourceDefinitionFactoryService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.tableRecordSourceDefinitionFactoryService;
    }

    get service() { return this._service; }
}
