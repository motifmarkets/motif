/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable, OnDestroy } from '@angular/core';
import {
    AdiService,
    AppStorageService,
    CapabilitiesService,
    CellPainterFactoryService,
    CommandRegisterService,
    CoreService,
    KeyboardService,
    MotifServicesService,
    NotificationChannelsService,
    ReferenceableDataSourceDefinitionsStoreService,
    ReferenceableDataSourcesService,
    ReferenceableGridLayoutsService,
    ScansService,
    SettingsService,
    SymbolDetailCacheService,
    SymbolsService,
    TableFieldSourceDefinitionCachingFactoryService,
    TextFormatterService
} from '@motifmarkets/motif-core';
import { RevFieldCustomHeadingsService } from '@xilytix/rev-data-source';

@Injectable({
    providedIn: 'root'
})
export class CoreNgService implements OnDestroy {
    private readonly _service: CoreService;

    constructor() {
        this._service = new CoreService();
        this._service.symbolsService.settingsServiceLinked = true;
    }

    get service() { return this._service; }

    get settingsService(): SettingsService { return this._service.settingsService; }
    get motifServicesService(): MotifServicesService { return this._service.motifServicesService; }
    get appStorageService(): AppStorageService { return this._service.appStorageService; }
    get adiService(): AdiService { return this._service.adiService; }
    get capabilitiesService(): CapabilitiesService { return this._service.capabilitiesService; }
    get symbolsService(): SymbolsService { return this._service.symbolsService; }
    get symbolDetailCacheService(): SymbolDetailCacheService { return this._service.symbolDetailCacheService; }
    get notificationChannelsService(): NotificationChannelsService { return this._service.notificationChannelsService; }
    get scansService(): ScansService { return this._service.scansService; }

    get textFormatterService(): TextFormatterService { return this._service.textFormatterService; }
    get revFieldCustomHeadingsService(): RevFieldCustomHeadingsService { return this._service.gridFieldCustomHeadingsService; }
    get tableFieldSourceDefinitionCachingFactoryService(): TableFieldSourceDefinitionCachingFactoryService {
        return this._service.tableFieldSourceDefinitionCachingFactoryService;
    }
    get referenceableGridLayoutsService(): ReferenceableGridLayoutsService { return this._service.referenceableGridLayoutsService; }
    get referenceableDataSourceDefinitionsStoreService(): ReferenceableDataSourceDefinitionsStoreService { return this._service.referenceableDataSourceDefinitionsStoreService; }
    get referenceableDataSourcesService(): ReferenceableDataSourcesService { return this._service.referenceableDataSourcesService; }
    get cellPainterFactoryService(): CellPainterFactoryService { return this._service.cellPainterFactoryService; }
    get commandRegisterService(): CommandRegisterService { return this._service.commandRegisterService; }
    get keyboardService(): KeyboardService { return this._service.keyboardService; }

    ngOnDestroy() {
        this._service.finalise();
    }
}
