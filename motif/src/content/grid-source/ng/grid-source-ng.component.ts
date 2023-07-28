/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AfterViewInit,
    ChangeDetectorRef,
    Directive,
    ElementRef,
    HostBinding,
    OnDestroy,
    ViewChild
} from '@angular/core';
import { Integer, numberToPixels } from '@motifmarkets/motif-core';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { ContentNgService } from '../../ng/content-ng.service';
import { GridSourceFrame } from '../grid-source-frame';

@Directive()
export abstract class GridSourceNgDirective extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit, GridSourceFrame.ComponentAccess {
    @HostBinding('style.flex-basis') styleFlexBasis = '';
    @ViewChild('gridHost', { static: true }) protected _gridHost: ElementRef<HTMLElement>;

    readonly frame: GridSourceFrame;

    constructor(
        elRef: ElementRef<HTMLElement>,
        typeInstanceCreateId: Integer,
        private readonly _cdr: ChangeDetectorRef,
        contentNgService: ContentNgService,
    ) {
        super(elRef, typeInstanceCreateId);

        this.frame = this.createGridSourceFrame(contentNgService);
    }

    get gridRowHeight() { return this.frame.gridRowHeight; }

    // Component Access members

    ngOnDestroy() {
        this.frame.finalise();
    }

    ngAfterViewInit(): void {
        this.processAfterViewInit();
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

    protected processAfterViewInit() {
        this.frame.setupGrid(this._gridHost.nativeElement);
    }

    protected abstract createGridSourceFrame(contentNgService: ContentNgService): GridSourceFrame;
}

export namespace GridSourceNgDirective {
    export namespace JsonName {
        export const frame = 'frame';
    }
}
