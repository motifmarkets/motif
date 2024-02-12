/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { CoreNgService } from '../../component-services/ng/core-ng.service';
import { TableFieldSourceDefinitionFactoryService } from '../table-field-source-definition-factory-service';
import { TableFieldSourceDefinitionCachedFactoryService } from '@motifmarkets/motif-core';

@Injectable({
    providedIn: 'root',
})
export class TableFieldSourceDefinitionCachedFactoryNgService {
    private _service: TableFieldSourceDefinitionCachedFactoryService;

    constructor(coreNgService: CoreNgService) {
        const coreService = coreNgService.service;

        const definitionFactoryService = new TableFieldSourceDefinitionFactoryService();

        coreService.setTableFieldSourceDefinitionFactory(definitionFactoryService);
        this._service = coreService.tableFieldSourceDefinitionCachedFactoryService;
    }

    get service() { return this._service; }

    touch() {
        // only used to flag as used to prevent compiler warning
    }
}
