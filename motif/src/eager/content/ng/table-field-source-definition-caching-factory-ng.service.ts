/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { TableFieldSourceDefinitionCachingFactoryService } from '@motifmarkets/motif-core';
import { CoreNgService } from '../../component-services/ng/core-ng.service';
import { TableFieldSourceDefinitionFactoryService } from '../table-field-source-definition-factory-service';

@Injectable({
    providedIn: 'root',
})
export class TableFieldSourceDefinitionCachingFactoryNgService {
    private _service: TableFieldSourceDefinitionCachingFactoryService;

    constructor(coreNgService: CoreNgService) {
        const coreService = coreNgService.service;

        const definitionFactoryService = new TableFieldSourceDefinitionFactoryService();

        coreService.setTableFieldSourceDefinitionFactory(definitionFactoryService);
        this._service = coreService.tableFieldSourceDefinitionCachingFactoryService;
    }

    get service() { return this._service; }

    touch() {
        // only used to flag as used to prevent compiler warning
    }
}
