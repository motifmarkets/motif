/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable, OnDestroy } from '@angular/core';
import { DesktopFrame } from 'src/desktop/internal-api';
import { DesktopAccessNgService } from 'src/ditem/ng-api';
import { WorkspaceService } from '../workspace-service';
import { WorkspaceNgModule } from './workspace-ng.module';

@Injectable({
    providedIn: WorkspaceNgModule
})
export class WorkspaceNgService implements OnDestroy {
    private _service: WorkspaceService;

    get service() { return this._service; }

    constructor(private readonly _desktopAccessNgService: DesktopAccessNgService) {
        this._service = new WorkspaceService();
        this._desktopAccessNgService.initialLoadedEvent = () => this.handleDesktopAccessNgServiceInitialLoadedEvent();
    }

    ngOnDestroy() {
        // this._ditemService.dispose();
    }

    private handleDesktopAccessNgServiceInitialLoadedEvent() {
        const desktopFrame = this._desktopAccessNgService.service as DesktopFrame;
        this._service.setLocalDesktopFrame(desktopFrame);
    }
}
