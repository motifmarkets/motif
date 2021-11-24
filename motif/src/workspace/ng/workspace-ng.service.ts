/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable, OnDestroy } from '@angular/core';
import { DesktopAccessNgService } from 'ditem-ng-api';
import { DesktopFrame } from 'src/desktop/internal-api';
import { WorkspaceService } from '../workspace-service';
import { WorkspaceNgModule } from './workspace-ng.module';

@Injectable({
    providedIn: WorkspaceNgModule
})
export class WorkspaceNgService implements OnDestroy {
    private _service: WorkspaceService;

    constructor(private readonly _desktopAccessNgService: DesktopAccessNgService) {
        this._service = new WorkspaceService();
        this._desktopAccessNgService.initialLoadedEvent = () => this.handleDesktopAccessNgServiceInitialLoadedEvent();
    }

    get service() { return this._service; }

    ngOnDestroy() {
        // this._ditemService.dispose();
    }

    private handleDesktopAccessNgServiceInitialLoadedEvent() {
        const desktopFrame = this._desktopAccessNgService.service as DesktopFrame;
        this._service.setLocalDesktopFrame(desktopFrame);
    }
}
