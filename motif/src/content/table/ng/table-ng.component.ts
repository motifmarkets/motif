/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding,
    Input,
    OnDestroy,
    ViewChild
} from '@angular/core';
import { MotifGrid } from 'src/content/internal-api';
import { MotifGridNgComponent } from 'src/content/ng-api';
import { Badness, numberToPixels } from 'src/sys/internal-api';
import { DelayedBadnessNgComponent } from '../../delayed-badness/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { TableFrame } from '../table-frame';

@Component({
    selector: 'app-table',
    templateUrl: './table-ng.component.html',
    styleUrls: ['./table-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableNgComponent implements OnDestroy, AfterViewInit, TableFrame.ComponentAccess {

    @HostBinding('style.flex-basis') styleFlexBasis = '';
    @Input() frameGridProperties: MotifGrid.FrameGridProperties;

    @ViewChild('delayedBadness', { static: true }) private _delayedBadnessComponent: DelayedBadnessNgComponent;
    @ViewChild(MotifGridNgComponent, { static: true }) private _gridComponent: MotifGridNgComponent;

    private _frame: TableFrame;

    constructor(
        private readonly _cdr: ChangeDetectorRef,
        contentService: ContentNgService,
    ) {
        this._frame = contentService.createTableFrame(this);
        // this._frame.tableOpenChangeEvent = (opened) => this.handleTableOpenChangeEvent(opened);
    }

    ngOnDestroy() {
        this.frame.finalise();
    }

    ngAfterViewInit() {
        this._gridComponent.destroyEventer = () => {
            this.frame.finalise();
            this._gridComponent.destroyGrid();
        };

        const grid = this._gridComponent.createGrid(this._frame, this.frameGridProperties);
        this._frame.setGrid(grid);
    }

    get frame(): TableFrame { return this._frame; }
    get gridRowHeight() { return this._frame.gridRowHeight; }

    // Component Access members

    get id(): string {
        return '';
        // todo - needs to return a unique id for this component
    }

    get gridHorizontalScrollbarMarginedHeight() {
        return this._gridComponent.horizontalScrollbarMarginedHeight;
    }

    getHeaderPlusFixedLineHeight() {
        return this._frame.getHeaderPlusFixedLineHeight();
    }

    setStyleFlexBasis(value: number) {
        const newFlexBasis = numberToPixels(value);
        if (newFlexBasis !== this.styleFlexBasis) {
            this.styleFlexBasis = newFlexBasis;
            this._cdr.markForCheck();
        }
    }

    setBadness(value: Badness) {
        this._delayedBadnessComponent.setBadness(value);
    }

    hideBadnessWithVisibleDelay(badness: Badness) {
        this._delayedBadnessComponent.hideWithVisibleDelay(badness);
    }

    // private handleTableOpenChangeEvent(opened: boolean) {
    //     this.setGridVisible(opened);
    // }
}

export namespace TableNgComponent {
    export namespace JsonName {
        export const frame = 'frame';
    }
}

