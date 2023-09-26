/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { DesktopFrame } from 'desktop-internal-api';
import { DesktopAccessNgService } from 'ditem-ng-api';
import { WorkspaceService } from '../workspace-service';
import { EagerWorkspaceNgModule } from './eager-workspace-ng.module';

@Injectable({
    providedIn: EagerWorkspaceNgModule
})
export class WorkspaceNgService {
    private _service: WorkspaceService;

    constructor(private readonly _desktopAccessNgService: DesktopAccessNgService) {
        this._service = new WorkspaceService();
        this._desktopAccessNgService.initialLoadedEvent = () => this.handleDesktopAccessNgServiceInitialLoadedEvent();
    }

    get service() { return this._service; }

    private handleDesktopAccessNgServiceInitialLoadedEvent() {
        const desktopFrame = this._desktopAccessNgService.service as DesktopFrame;
        this._service.setLocalDesktopFrame(desktopFrame);
    }
}
