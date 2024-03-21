/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { TableRecordSourceDefinitionFactoryService } from '../table-record-source-definition-factory-service';
import { CoreNgService } from 'component-services-ng-api';
import { TableFieldSourceDefinitionCachingFactoryNgService } from './table-field-source-definition-caching-factory-ng.service';

@Injectable({
    providedIn: 'root',
})
export class TableRecordSourceDefinitionFactoryNgService {
    private _service: TableRecordSourceDefinitionFactoryService;

    constructor(
        coreNgService: CoreNgService,
        tableFieldSourceDefinitionCachingFactoryNgService: TableFieldSourceDefinitionCachingFactoryNgService,
    ) {
        const coreService = coreNgService.service;

        this._service = new TableRecordSourceDefinitionFactoryService(
            coreService.rankedLitIvemIdListDefinitionFactoryService,
            coreService.gridFieldCustomHeadingsService,
            tableFieldSourceDefinitionCachingFactoryNgService.service, // Do NOT get directly from core service.  Make sure dependent on TableFieldSourceDefinitionCachingFactory
        );
    }

    get service() { return this._service; }
}
