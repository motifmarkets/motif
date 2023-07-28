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
    OnDestroy,
    ViewChild
} from '@angular/core';
import { Integer } from '@motifmarkets/motif-core';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { GridSourceFrame } from '../grid-source-frame';

@Directive()
export abstract class GridSourceNgDirective extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    @ViewChild('gridHost', { static: true }) protected _gridHost: ElementRef<HTMLElement>;

    constructor(
        elRef: ElementRef<HTMLElement>,
        typeInstanceCreateId: Integer,
        protected readonly _cdr: ChangeDetectorRef,
        readonly frame: GridSourceFrame,
    ) {
        super(elRef, typeInstanceCreateId);
    }

    get gridRowHeight() { return this.frame.gridRowHeight; }

    // Component Access members

    ngOnDestroy() {
        this.frame.finalise();
    }

    ngAfterViewInit(): void {
        this.processAfterViewInit();
    }

    getHeaderPlusFixedLineHeight() {
        return this.frame.calculateHeaderPlusFixedRowsHeight();
    }

    protected processAfterViewInit() {
        this.frame.setupGrid(this._gridHost.nativeElement);
    }
}

export namespace GridSourceNgDirective {
    export namespace JsonName {
        export const frame = 'frame';
    }
}
