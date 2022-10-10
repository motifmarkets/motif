/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable, OnDestroy } from '@angular/core';
import {
    AdiService,
    AppStorageService,
    CommandRegisterService,
    CoreService,
    KeyboardService,
    MotifServicesService,
    ScansService,
    SettingsService,
    SymbolsService
} from '@motifmarkets/motif-core';

@Injectable({
    providedIn: 'root'
})
export class CoreNgService implements OnDestroy {
    private _service: CoreService;

    constructor() {
        this._service = new CoreService();
    }

    get service() { return this._service; }
    get settingsService(): SettingsService { return this._service.settingsService; }
    get motifServicesService(): MotifServicesService { return this._service.motifServicesService; }
    get appStorageService(): AppStorageService { return this._service.appStorageService; }
    get adiService(): AdiService { return this._service.adiService; }
    get symbolsService(): SymbolsService { return this._service.symbolsService; }
    get scansService(): ScansService { return this._service.scansService; }
    get commandRegisterService(): CommandRegisterService { return this._service.commandRegisterService; }
    get keyboardService(): KeyboardService { return this._service.keyboardService; }

    ngOnDestroy() {
        this._service.finalise();
    }
}
