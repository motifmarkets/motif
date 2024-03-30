/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { CoreNgService } from '../../component-services/ng/core-ng.service';
import { TableRecordSourceFactoryService } from '../table-record-source-factory-service';
import { TableFieldSourceDefinitionCachingFactoryNgService } from './table-field-source-definition-caching-factory-ng.service';

@Injectable({
    providedIn: 'root',
})
export class TableRecordSourceFactoryNgService {
    private _service: TableRecordSourceFactoryService;

    constructor(
        coreNgService: CoreNgService,
        tableFieldSourceDefinitionCachingFactoryNgService: TableFieldSourceDefinitionCachingFactoryNgService,
    ) {
        const coreService = coreNgService.service;
        const tableFieldSourceDefinitionCachingFactoryService = tableFieldSourceDefinitionCachingFactoryNgService.service;

        this._service = new TableRecordSourceFactoryService(
            coreService.adiService,
            coreService.symbolDetailCacheService,
            coreService.rankedLitIvemIdListFactoryService,
            coreService.watchmakerService,
            coreService.notificationChannelsService,
            coreService.scansService,
            coreService.textFormatterService,
            coreService.gridFieldCustomHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService, // Do NOT get directly from core service.  Make sure dependent on TableFieldSourceDefinitionCachingFactory
        );

        coreService.setTableRecordSourceFactory(this._service, tableFieldSourceDefinitionCachingFactoryService.definitionFactory);
    }

    get service() { return this._service; }

    touch() {
        // only used to flag as used to prevent compiler warning
    }
}
