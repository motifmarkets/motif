/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { TableFieldSourceDefinitionRegistryService } from '@motifmarkets/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class TableFieldSourceDefinitionRegistryNgService {
    private _service: TableFieldSourceDefinitionRegistryService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.tableFieldSourceDefinitionRegistryService;
    }

    get service() { return this._service; }
}
