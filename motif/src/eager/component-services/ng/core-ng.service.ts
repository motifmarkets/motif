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
    GridFieldCustomHeadingsService,
    KeyboardService,
    MotifServicesService,
    NotificationChannelsService,
    ReferenceableGridLayoutsService,
    ReferenceableGridSourceDefinitionsStoreService,
    ScansService,
    SettingsService,
    SymbolDetailCacheService,
    SymbolsService,
    TableFieldSourceDefinitionCachedFactoryService,
    TableRecordSourceDefinitionFactoryService,
    TextFormatterService,
    TypedReferenceableGridSourcesService
} from '@motifmarkets/motif-core';

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
    get gridFieldCustomHeadingsService(): GridFieldCustomHeadingsService { return this._service.gridFieldCustomHeadingsService; }
    get tableFieldSourceDefinitionCachedFactoryService(): TableFieldSourceDefinitionCachedFactoryService {
        return this._service.tableFieldSourceDefinitionCachedFactoryService;
    }
    get tableRecordSourceDefinitionFactoryService(): TableRecordSourceDefinitionFactoryService {
        return this._service.tableRecordSourceDefinitionFactoryService;
    }
    get referenceableGridLayoutsService(): ReferenceableGridLayoutsService { return this._service.referenceableGridLayoutsService; }
    get referenceableGridSourceDefinitionsStoreService(): ReferenceableGridSourceDefinitionsStoreService { return this._service.referenceableGridSourceDefinitionsStoreService; }
    get referenceableGridSourcesService(): TypedReferenceableGridSourcesService { return this._service.referenceableGridSourcesService; }
    get cellPainterFactoryService(): CellPainterFactoryService { return this._service.cellPainterFactoryService; }
    get commandRegisterService(): CommandRegisterService { return this._service.commandRegisterService; }
    get keyboardService(): KeyboardService { return this._service.keyboardService; }

    ngOnDestroy() {
        this._service.finalise();
    }
}
