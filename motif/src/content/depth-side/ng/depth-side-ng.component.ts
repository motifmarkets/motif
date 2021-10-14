/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { RevRecordStore } from 'revgrid';
import { MotifGrid } from 'src/content/internal-api';
import { MotifGridNgComponent } from 'src/content/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { DepthSideFrame } from '../depth-side-frame';

@Component({
    selector: 'app-depth-side',
    templateUrl: './depth-side-ng.component.html',
    styleUrls: ['./depth-side-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepthSideNgComponent implements OnDestroy, DepthSideFrame.ComponentAccess {
    @Input() frameGridProperties: MotifGrid.FrameGridProperties;
    @ViewChild(MotifGridNgComponent, { static: true }) private _gridComponent: MotifGridNgComponent;

    private _frame: DepthSideFrame;

    constructor(private _contentService: ContentNgService) {
        this._frame = this._contentService.createDepthSideFrame(this);
    }

    ngOnDestroy() {
        this.frame.finalise();
    }

    get frame(): DepthSideFrame { return this._frame; }

    // onColumnWidthChanged(columnIndex: Integer) {
    //     this._frame.adviseColumnWidthChanged(columnIndex);
    // }

    // onGridRendered(event: GridCustomEvent) {
    //     this._frame.adviseGridRendered();
    // }

    // Component Access members

    get id(): string {
        return '';
        // todo - needs to return a unique id for this component
    }

    createGrid(dataStore: RevRecordStore) {
        this._gridComponent.destroyEventer = () => {
            this.frame.finalise();
            this._gridComponent.destroyGrid();
        };

        return this._gridComponent.createGrid(dataStore, this.frameGridProperties);
    }
}
