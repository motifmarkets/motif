/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, ViewChild } from '@angular/core';
import { Badness, DayTradesGridRecordStore } from '@motifmarkets/motif-core';
import { AdaptedRevgrid } from 'content-internal-api';
import { RecordGridNgComponent } from '../../adapted-revgrid/ng-api';
import { DelayedBadnessNgComponent } from '../../delayed-badness/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { ContentNgService } from '../../ng/content-ng.service';
import { TradesFrame } from '../trades-frame';

@Component({
    selector: 'app-trades',
    templateUrl: './trades-ng.component.html',
    styleUrls: ['./trades-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TradesNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit, TradesFrame.ComponentAccess {
    @ViewChild('delayedBadness') private _delayedBadnessComponent: DelayedBadnessNgComponent;
    @ViewChild(RecordGridNgComponent, { static: true }) private _gridComponent: RecordGridNgComponent;

    private readonly _frame: TradesFrame;

    constructor(
        contentService: ContentNgService,
    ) {
        super();

        this._frame = contentService.createTradesFrame(this);
    }

    get frame(): TradesFrame { return this._frame; }
    get id(): string { return this.componentInstanceId; }


    ngOnDestroy() {
        // this._onAutoAdjustColumnWidths = undefined;
        this.frame.finalise();
    }

    ngAfterViewInit() {
        this._gridComponent.destroyEventer = () => {
            this.frame.finalise();
            this._gridComponent.destroyGrid();
        };
    }

    // onColumnWidthChanged(columnIndex: Integer) {
    //     this._frame.adviseColumnWidthChanged(columnIndex);
    // }

    // public gridGetRenderedActiveWidth() {
    //     return this._gridAdapter.GetRenderedActiveWidth(false);
    // }

    public createGrid(recordStore: DayTradesGridRecordStore) {
        return this._gridComponent.createGrid(recordStore, TradesNgComponent.frameGridProperties);
    }

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

    export const frameGridProperties: AdaptedRevgrid.FrameGridSettings = {
        fixedColumnCount: 0,
        gridRightAligned: false,
    };
}
