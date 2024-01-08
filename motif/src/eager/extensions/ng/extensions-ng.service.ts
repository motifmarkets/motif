/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable, OnDestroy } from '@angular/core';
import {
    AdiNgService,
    AppStorageNgService,
    CommandRegisterNgService,
    SettingsNgService,
    SymbolsNgService
} from 'component-services-ng-api';
import { ExtensionsAccessNgService } from 'content-ng-api';
import { MenuBarNgService } from 'controls-ng-api';
import { WorkspaceNgService } from 'workspace-ng-api';
import { ExtensionsService } from '../extensions-service';
import { ApiContentComponentFactoryNgService } from './api-content-component-factory-ng.service';
import { ApiControlComponentFactoryNgService } from './api-control-component-factory-ng.service';

@Injectable({
    providedIn: 'root',
})
export class ExtensionsNgService implements OnDestroy {
    private _service: ExtensionsService;

    constructor(
        extensionsAccessNgService: ExtensionsAccessNgService,
        adiNgService: AdiNgService,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        storageNgService: AppStorageNgService,
        symbolsNgService: SymbolsNgService,
        menuBarNgService: MenuBarNgService,
        workspaceNgService: WorkspaceNgService,
        apiControlComponentNgFactoryService: ApiControlComponentFactoryNgService,
        apiContentComponentNgFactoryService: ApiContentComponentFactoryNgService,
    ) {
        this._service = new ExtensionsService(
            adiNgService.service,
            settingsNgService.service,
            commandRegisterNgService.service,
            storageNgService.service,
            symbolsNgService.service,
            menuBarNgService.service,
            workspaceNgService.service,
            apiControlComponentNgFactoryService, // only passes interface
            apiContentComponentNgFactoryService, // only passes interface
        );
        extensionsAccessNgService.setService(this._service);
        commandRegisterNgService.service.setInternalExtensionHandle(this._service.internalHandle);
    }

    get service() { return this._service; }

    ngOnDestroy() {
        this._service.destroy();
    }
}
