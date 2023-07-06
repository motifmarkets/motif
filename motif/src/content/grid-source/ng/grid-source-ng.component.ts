/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    OnDestroy,
    ViewChild
} from '@angular/core';
import { Badness, numberToPixels } from '@motifmarkets/motif-core';
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
export abstract class GridSourceNgComponent
    extends ContentComponentBaseNgDirective
    implements OnDestroy, GridSourceFrame.ComponentAccess {

    @HostBinding('style.flex-basis') styleFlexBasis = '';

    @ViewChild('delayedBadness', { static: true }) private _delayedBadnessComponent: DelayedBadnessNgComponent;
    @ViewChild(RecordGridNgComponent, { static: true }) private _recordGridComponent: RecordGridNgComponent;

    readonly frame: GridSourceFrame;

    constructor(
        contentNgService: ContentNgService,
        private readonly _cdr: ChangeDetectorRef,
        elRef: ElementRef<HTMLElement>,
    ) {
        super();

        this.frame = this.createGridSourceFrame(contentNgService, elRef.nativeElement);
    }

    get gridRowHeight() { return this.frame.gridRowHeight; }
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

    // Component Access members

    getHeaderPlusFixedLineHeight() {
        return this.frame.calculateHeaderPlusFixedRowsHeight();
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

    protected abstract createGridSourceFrame(contentNgService: ContentNgService, hostElement: HTMLElement): GridSourceFrame;
}

export namespace GridSourceNgComponent {
    export namespace JsonName {
        export const frame = 'frame';
    }
}
