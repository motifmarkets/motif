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
    CommandRegisterService,
    CoreService,
    KeyboardService,
    MotifServicesService,
    NamedGridLayoutDefinitionsService,
    NamedGridSourceDefinitionsService,
    ScansService,
    SettingsService,
    SymbolDetailCacheService,
    SymbolsService,
    TableRecordSourceFactoryService,
    TextFormatterService
} from '@motifmarkets/motif-core';

@Injectable({
    providedIn: 'root'
})
export class CoreNgService implements OnDestroy {
    private readonly _service: CoreService;

    constructor() {
        this._service = new CoreService();
    }

    get service() { return this._service; }

    get settingsService(): SettingsService { return this._service.settingsService; }
    get motifServicesService(): MotifServicesService { return this._service.motifServicesService; }
    get appStorageService(): AppStorageService { return this._service.appStorageService; }
    get adiService(): AdiService { return this._service.adiService; }
    get capabilitiesService(): CapabilitiesService { return this._service.capabilitiesService; }
    get symbolsService(): SymbolsService { return this._service.symbolsService; }
    get symbolDetailCacheService(): SymbolDetailCacheService { return this._service.symbolDetailCacheService; }
    get scansService(): ScansService { return this._service.scansService; }
    get textFormatterService(): TextFormatterService { return this._service.textFormatterService; }
    get tableRecordSourceFactoryService(): TableRecordSourceFactoryService { return this._service.tableRecordSourceFactoryService; }
    get namedGridLayoutDefinitionsService(): NamedGridLayoutDefinitionsService { return this._service.namedGridLayoutDefinitionsService; }
    get namedGridSourceDefinitionsService(): NamedGridSourceDefinitionsService { return this._service.namedGridSourceDefinitionsService; }
    get commandRegisterService(): CommandRegisterService { return this._service.commandRegisterService; }
    get keyboardService(): KeyboardService { return this._service.keyboardService; }

    ngOnDestroy() {
        this._service.finalise();
    }
}
