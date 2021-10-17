/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, ViewChild } from '@angular/core';
import { MotifGrid } from 'src/content/internal-api';
import { MotifGridNgComponent } from 'src/content/motif-grid/ng-api';
import { Badness } from 'src/sys/internal-api';
import { DelayedBadnessNgComponent } from '../../delayed-badness/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { TradesFrame } from '../trades-frame';

@Component({
    selector: 'app-trades',
    templateUrl: './trades-ng.component.html',
    styleUrls: ['./trades-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TradesNgComponent implements OnDestroy, AfterViewInit, TradesFrame.ComponentAccess {
    @ViewChild('delayedBadness') private _delayedBadnessComponent: DelayedBadnessNgComponent;
    @ViewChild(MotifGridNgComponent, { static: true }) private _gridComponent: MotifGridNgComponent;

    private _frame: TradesFrame;

    constructor(
        contentService: ContentNgService,
    ) {
        this._frame = contentService.createTradesFrame(this);
    }

    ngOnDestroy() {
        // this._onAutoAdjustColumnWidths = undefined;
        this.frame.finalise();
    }

    ngAfterViewInit() {
        this._gridComponent.destroyEventer = () => {
            this.frame.finalise();
            this._gridComponent.destroyGrid();
        };

        const grid = this._gridComponent.createGrid(this._frame.dataStore, TradesNgComponent.frameGridProperties);
        this._frame.setGrid(grid);
    }

    get frame(): TradesFrame { return this._frame; }

    // onColumnWidthChanged(columnIndex: Integer) {
    //     this._frame.adviseColumnWidthChanged(columnIndex);
    // }

   // Component Access members

    get id(): string {
        return '';
        // todo - needs to return a unique id for this component
    }

    // public gridGetRenderedActiveWidth() {
    //     return this._gridAdapter.GetRenderedActiveWidth(false);
    // }

    public setBadness(value: Badness) {
        this._delayedBadnessComponent.setBadness(value);
    }

    public hideBadnessWithVisibleDelay(badness: Badness) {
        this._delayedBadnessComponent.hideWithVisibleDelay(badness);
    }
}

export namespace TradesNgComponent {
    export namespace JsonName {
        export const frame = 'frame';
    }

    export const frameGridProperties: MotifGrid.FrameGridProperties = {
        fixedColumnCount: 0,
        gridRightAligned: false,
    };
}
