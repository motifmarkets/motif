/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable, OnDestroy } from '@angular/core';
import { CoreNgService, SessionInfoNgService } from 'component-services-ng-api';
import { DitemService } from '../ditem-service';
import { DesktopAccessNgService } from './desktop-access-ng.service';
import { DitemNgModule } from './ditem-ng.module';

@Injectable({
    providedIn: DitemNgModule
})
export class DitemNgService implements OnDestroy {
    private _service: DitemService;

    constructor(coreNgService: CoreNgService,
        destopAccessNgService: DesktopAccessNgService,
        sessionInfoNgService: SessionInfoNgService
    ) {
        const coreService = coreNgService.service;
        const desktopAccessService = destopAccessNgService.service;
        const sessionInfoService = sessionInfoNgService.service;
        this._service = new DitemService(coreService, desktopAccessService, sessionInfoService);
    }

    get service() { return this._service; }

    ngOnDestroy() {
        // this._ditemService.dispose();
    }
}
