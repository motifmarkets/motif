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
    SymbolsNgService
} from 'component-services-ng-api';
import { ExtensionsAccessNgService } from 'content-ng-api';
import { MenuBarNgService } from 'controls-ng-api';
import { WorkspaceNgService } from 'src/workspace/ng-api';
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
        commandRegisterNgService: CommandRegisterNgService,
        storageNgService: AppStorageNgService,
        symbolsNgService: SymbolsNgService,
        menuBarNgService: MenuBarNgService,
        workspaceNgService: WorkspaceNgService,
        apiControlComponentNgFactoryService: ApiControlComponentFactoryNgService,
        apiContentComponentNgFactoryService: ApiContentComponentFactoryNgService,
    ) {
        this._service = new ExtensionsService(
            adiNgService.adiService,
            commandRegisterNgService.service,
            storageNgService.appStorage,
            symbolsNgService.symbolsManager,
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
