/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { AdaptedRevgrid } from 'content-internal-api';
import { RevRecordStore } from 'revgrid';
import { RecordGridNgComponent } from '../../adapted-revgrid/record-grid/ng/record-grid-ng.component';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { ContentNgService } from '../../ng/content-ng.service';
import { DepthSideFrame } from '../depth-side-frame';

@Component({
    selector: 'app-depth-side',
    templateUrl: './depth-side-ng.component.html',
    styleUrls: ['./depth-side-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepthSideNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, DepthSideFrame.ComponentAccess {
    @Input() frameGridProperties: AdaptedRevgrid.FrameGridProperties;
    @ViewChild(RecordGridNgComponent, { static: true }) private _gridComponent: RecordGridNgComponent;

    private readonly _frame: DepthSideFrame;

    constructor(private _contentService: ContentNgService) {
        super();

        this._frame = this._contentService.createDepthSideFrame(this);
    }

    get frame(): DepthSideFrame { return this._frame; }
    get id(): string { return this.componentInstanceId; }

    ngOnDestroy() {
        this._frame.finalise();
    }

    // onColumnWidthChanged(columnIndex: Integer) {
    //     this._frame.adviseColumnWidthChanged(columnIndex);
    // }

    // onGridRendered(event: GridCustomEvent) {
    //     this._frame.adviseGridRendered();
    // }

    // Component Access members

    createGrid(dataStore: RevRecordStore) {
        this._gridComponent.destroyEventer = () => {
            this.frame.finalise();
            this._gridComponent.destroyGrid();
        };

        return this._gridComponent.createGrid(dataStore, this.frameGridProperties);
    }
}
