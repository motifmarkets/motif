/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    inject, Injector,
    OnDestroy,
    ValueProvider,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { AssertInternalError, Badness, delay1Tick, LockOpenListItem } from '@motifmarkets/motif-core';
import { AdaptedRevgrid } from 'content-internal-api';
import { CoreInjectionTokens } from '../../../component-services/ng-api';
import { DelayedBadnessNgComponent } from '../../delayed-badness/ng-api';
import { GridSourceNgComponent } from '../../grid-source/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { ContentNgService } from '../../ng/content-ng.service';
import { FeedsFrame } from '../feeds-frame';

@Component({
    selector: 'app-feeds',
    templateUrl: './feeds-ng.component.html',
    styleUrls: ['./feeds-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedsNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy, FeedsFrame.ComponentAccess {
    @ViewChild('delayedBadness', { static: true }) private _delayedBadnessComponent: DelayedBadnessNgComponent;
    @ViewChild('table', { static: true }) private _tableComponent: GridSourceNgComponent;

    public readonly frameGridProperties: AdaptedRevgrid.FrameGridSettings = {
        fixedColumnCount: 0,
        gridRightAligned: false,
    };

    private _frame: FeedsFrame;

    constructor(
        contentNgService: ContentNgService,
    ) {
        super();

        const opener: LockOpenListItem.Opener = inject(CoreInjectionTokens.lockOpenListItemOpener);
        this._frame = contentNgService.createFeedsFrame(this, opener);
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
    export function create(container: ViewContainerRef, opener: LockOpenListItem.Opener) {
        container.clear();

        const openerProvider: ValueProvider = {
            provide: CoreInjectionTokens.lockOpenListItemOpener,
            useValue: opener,
        };
        const injector = Injector.create({
            providers: [openerProvider],
        });

        const componentRef = container.createComponent(FeedsNgComponent, { injector });

        const instance = componentRef.instance;
        if (!(instance instanceof FeedsNgComponent)) {
            throw new AssertInternalError('FCCI59923112141');
        } else {
            return instance;
        }
    }
}
