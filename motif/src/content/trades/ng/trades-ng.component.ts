/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Badness } from '@motifmarkets/motif-core';
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
    private static typeInstanceCreateCount = 0;

    @ViewChild('delayedBadness') private _delayedBadnessComponent: DelayedBadnessNgComponent;
    @ViewChild('gridHost', { static: true }) private _gridHost: ElementRef<HTMLElement>;

    private readonly _frame: TradesFrame;

    constructor(elRef: ElementRef<HTMLElement>, contentService: ContentNgService) {
        super(elRef, ++TradesNgComponent.typeInstanceCreateCount);

        this._frame = contentService.createTradesFrame(this);
    }

    get frame(): TradesFrame { return this._frame; }
    get id(): string { return this.typeInstanceId; }

    ngOnDestroy() {
        // this._onAutoAdjustColumnWidths = undefined;
        this.frame.finalise();
    }

    ngAfterViewInit(): void {
        this._frame.setupGrid(this._gridHost.nativeElement);
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
}
