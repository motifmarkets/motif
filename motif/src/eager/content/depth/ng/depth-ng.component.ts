/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Badness, Integer, numberToPixels } from '@motifmarkets/motif-core';
import { SplitComponent } from 'angular-split';
import { DelayedBadnessNgComponent } from '../../delayed-badness/ng-api';
import { DepthSideNgComponent } from '../../depth-side/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { ContentNgService } from '../../ng/content-ng.service';
import { DepthFrame } from '../depth-frame';

@Component({
    selector: 'app-depth',
    templateUrl: './depth-ng.component.html',
    styleUrls: ['./depth-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepthNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, DepthFrame.ComponentAccess {
    private static typeInstanceCreateCount = 0;

    @ViewChild('delayedBadness') private _delayedBadnessComponent: DelayedBadnessNgComponent;
    @ViewChild(SplitComponent) private _split: SplitComponent;
    @ViewChild('bidSide', { static: true }) private _bidComponent: DepthSideNgComponent;
    @ViewChild('askSide', { static: true }) private _askComponent: DepthSideNgComponent;

    public bidActiveWidth = '120px';
    public bidWidthPercent = 50;
    public askActiveWidth = '120px';
    public askWidthPercent = 50;
    public splitterGutterSize = 3;

    private readonly _frame: DepthFrame;

    constructor(elRef: ElementRef<HTMLElement>, private readonly _cdr: ChangeDetectorRef, contentService: ContentNgService) {
        super(elRef, ++DepthNgComponent.typeInstanceCreateCount);

        this._frame = contentService.createDepthFrame(this);
    }

    public get frame(): DepthFrame { return this._frame; }
    public get bidDepthSideFrame() { return this._bidComponent.frame; }
    public get askDepthSideFrame() { return this._askComponent.frame; }

    ngOnDestroy() {
        this._frame.finalise();
    }

    // Component Access Methods

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
