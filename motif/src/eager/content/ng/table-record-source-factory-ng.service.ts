/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { CoreNgService } from '../../component-services/ng/core-ng.service';
import { TableRecordSourceFactoryService } from '../table-record-source-factory-service';

@Injectable({
    providedIn: 'root',
})
export class TableRecordSourceFactoryNgService {
    private _service: TableRecordSourceFactoryService;

    constructor(coreNgService: CoreNgService) {
        const coreService = coreNgService.service;

        this._service = new TableRecordSourceFactoryService(
            coreService.adiService,
            coreService.symbolDetailCacheService,
            coreService.rankedLitIvemIdListFactoryService,
            coreService.watchmakerService,
            coreService.notificationChannelsService,
            coreService.scansService,
            coreService.textFormatterService,
            coreService.tableRecordSourceDefinitionFactoryService,
        );

        coreService.setTableRecordSourceFactory(this._service);
    }

    get service() { return this._service; }

    touch() {
        // only used to flag as used to prevent compiler warning
    }
}
