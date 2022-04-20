/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ComponentFactoryResolver,
    OnDestroy,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { AssertInternalError, Badness, delay1Tick } from '@motifmarkets/motif-core';
import { AdaptedRevgrid } from 'content-internal-api';
import { DelayedBadnessNgComponent } from '../../delayed-badness/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { ContentNgService } from '../../ng/content-ng.service';
import { TableNgComponent } from '../../table/ng-api';
import { FeedsFrame } from '../feeds-frame';

@Component({
    selector: 'app-feeds',
    templateUrl: './feeds-ng.component.html',
    styleUrls: ['./feeds-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedsNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy, FeedsFrame.ComponentAccess {
    @ViewChild('delayedBadness', { static: true }) private _delayedBadnessComponent: DelayedBadnessNgComponent;
    @ViewChild('table', { static: true }) private _tableComponent: TableNgComponent;

    public readonly frameGridProperties: AdaptedRevgrid.FrameGridProperties = {
        fixedColumnCount: 0,
        gridRightAligned: false,
    };

    private _frame: FeedsFrame;

    constructor(contentService: ContentNgService) {
        super();

        this._frame = contentService.createFeedsFrame(this);
    }

    ngAfterViewInit() {
        delay1Tick(() => this._frame.initialise(this._tableComponent.frame));
    }

    ngOnDestroy() {
        this._frame.finalise();
    }

    public setBadness(value: Badness) {
        this._delayedBadnessComponent.setBadness(value);
    }

    public hideBadnessWithVisibleDelay(badness: Badness) {
        this._delayedBadnessComponent.hideWithVisibleDelay(badness);
    }
}

export namespace FeedsNgComponent {
    export function create(
        container: ViewContainerRef,
        resolver: ComponentFactoryResolver,
    ) {
        container.clear();
        const factory = resolver.resolveComponentFactory(FeedsNgComponent);
        const componentRef = container.createComponent(factory);
        const instance = componentRef.instance;
        if (!(instance instanceof FeedsNgComponent)) {
            throw new AssertInternalError('FCCI59923112141');
        } else {
            return instance;
        }
    }
}
