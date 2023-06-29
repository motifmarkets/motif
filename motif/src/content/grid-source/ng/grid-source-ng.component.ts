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
import { Badness, numberToPixels } from '@motifmarkets/motif-core';
import { AdaptedRevgrid } from 'content-internal-api';
import { RecordGridNgComponent } from '../../adapted-revgrid/ng-api';
import { DelayedBadnessNgComponent } from '../../delayed-badness/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { ContentNgService } from '../../ng/content-ng.service';
import { GridSourceFrame } from '../grid-source-frame';

@Component({
    selector: 'app-grid-source',
    templateUrl: './grid-source-ng.component.html',
    styleUrls: ['./grid-source-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridSourceNgComponent
    extends ContentComponentBaseNgDirective
    implements OnDestroy, AfterViewInit, GridSourceFrame.ComponentAccess {

    @HostBinding('style.flex-basis') styleFlexBasis = '';
    @Input() frameGridProperties: AdaptedRevgrid.FrameGridSettings;

    @ViewChild('delayedBadness', { static: true }) private _delayedBadnessComponent: DelayedBadnessNgComponent;
    @ViewChild(RecordGridNgComponent, { static: true }) private _recordGridComponent: RecordGridNgComponent;

    private readonly _frame: GridSourceFrame;

    constructor(
        private readonly _cdr: ChangeDetectorRef,
        contentNgService: ContentNgService,
    ) {
        super();

        this._frame = this.createGridSourceFrame(contentNgService);
    }

    get frame(): GridSourceFrame { return this._frame; }
    get gridRowHeight() { return this._frame.gridRowHeight; }
    get recordGridComponent() { return this._recordGridComponent; }
    get recordGrid() { return this._recordGridComponent.recordGrid; }

    // Component Access members

    get id(): string {
        return this.componentInstanceId;
    }

    get gridHorizontalScrollbarMarginedHeight() {
        return this._recordGridComponent.horizontalScrollbarMarginedHeight;
    }

    ngOnDestroy() {
        this.frame.finalise();
    }

    ngAfterViewInit() {
        this._recordGridComponent.destroyEventer = () => {
            this.frame.finalise();
            this._recordGridComponent.destroyGrid();
        };

        const grid = this._recordGridComponent.createGrid(this._frame.recordStore, this.frameGridProperties);
        this._frame.setGrid(grid);
    }

    // Component Access members

    getHeaderPlusFixedLineHeight() {
        return this._frame.calculateHeaderPlusFixedRowsHeight();
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

    protected createGridSourceFrame(contentNgService: ContentNgService) {
        return contentNgService.createGridSourceFrame(this);
    }
}

export namespace GridSourceNgComponent {
    export namespace JsonName {
        export const frame = 'frame';
    }
}
