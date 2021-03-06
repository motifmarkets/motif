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
    SettingsService,
    SymbolsService,
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
    get appStorageService(): AppStorageService { return this._service.applicationStateStorage; }
    get adi(): AdiService { return this._service.adi; }
    get symbolsManager(): SymbolsService { return this._service.symbolsManager; }
    get commandRegisterService(): CommandRegisterService { return this._service.commandRegisterService; }
    get keyboardService(): KeyboardService { return this._service.keyboardService; }

    ngOnDestroy() {
        this._service.finalise();
    }
}
