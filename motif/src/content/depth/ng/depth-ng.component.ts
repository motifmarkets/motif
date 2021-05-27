/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { SplitComponent } from 'angular-split';
import { assert, assigned, Badness, Integer, numberToPixels } from 'src/sys/internal-api';
import { DelayedBadnessNgComponent } from '../../delayed-badness/ng-api';
import { DepthSideNgComponent } from '../../depth-side/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { DepthFrame } from '../depth-frame';

@Component({
    selector: 'app-depth',
    templateUrl: './depth-ng.component.html',
    styleUrls: ['./depth-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepthNgComponent implements OnDestroy, AfterViewInit, DepthFrame.ComponentAccess {
    @ViewChild('delayedBadness') private _delayedBadnessComponent: DelayedBadnessNgComponent;
    @ViewChild(SplitComponent) private _split: SplitComponent;
    @ViewChild('bidSide', { static: true }) private _bidComponent: DepthSideNgComponent;
    @ViewChild('askSide', { static: true }) private _askComponent: DepthSideNgComponent;

    public bidActiveWidth = '120px';
    public bidWidthPercent = 50;
    public askActiveWidth = '120px';
    public askWidthPercent = 50;
    public splitterGutterSize = 3;

    private _frame: DepthFrame;

    constructor(private _cdr: ChangeDetectorRef, private _contentService: ContentNgService) {
        this._frame = this._contentService.createDepthFrame(this);
    }

    public get frame(): DepthFrame { return this._frame; }

    ngOnDestroy() {
        this.frame.finalise();
    }

    ngAfterViewInit() {
        assert(assigned(this._bidComponent), 'ID:3717143307');
        assert(assigned(this._askComponent), 'ID:3817143310');

        this.frame.bindChildFrames(this._bidComponent.frame, this._askComponent.frame);
    }

    // Component Access Methods

    public getBidAskSeparatorWidth() {
        return this.splitterGutterSize;
    }

    public setBidActiveWidth(pixels: Integer) {
        this.bidActiveWidth = numberToPixels(pixels);
        this._cdr.markForCheck();
    }

    public setAskActiveWidth(pixels: Integer) {
        this.askActiveWidth = numberToPixels(pixels);
        this._cdr.markForCheck();
    }

    public getSplitAreaSizes() {
        return this._split.getVisibleAreaSizes();
    }

    public setBadness(value: Badness) {
        this._delayedBadnessComponent.setBadness(value);
    }

    public hideBadnessWithVisibleDelay(badness: Badness) {
        this._delayedBadnessComponent.hideWithVisibleDelay(badness);
    }

    public setActiveWidths(bidActiveWidth: number, askActiveWidth: number) {
        this.bidActiveWidth = numberToPixels(bidActiveWidth);
        this.askActiveWidth = numberToPixels(askActiveWidth);
        this._cdr.markForCheck();
    }
}
