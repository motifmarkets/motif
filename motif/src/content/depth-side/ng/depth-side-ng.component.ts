/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy } from '@angular/core';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { ContentNgService } from '../../ng/content-ng.service';
import { DepthSideFrame } from '../depth-side-frame';

@Component({
    selector: 'app-depth-side',
    templateUrl: './depth-side-ng.component.html',
    styleUrls: ['./depth-side-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepthSideNgComponent extends ContentComponentBaseNgDirective implements OnDestroy {
    private readonly _frame: DepthSideFrame;

    constructor(elRef: ElementRef<HTMLElement>, private _contentService: ContentNgService) {
        super();

        this._frame = this._contentService.createDepthSideFrame(elRef.nativeElement);
    }

    get frame(): DepthSideFrame { return this._frame; }

    ngOnDestroy() {
        this._frame.finalise();
    }
}
