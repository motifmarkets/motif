/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { AssertInternalError, Badness } from '@motifmarkets/motif-core';
import { DelayedBadnessNgComponent } from '../../delayed-badness/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { ContentNgService } from '../../ng/content-ng.service';
import { MarketsFrame } from '../markets-frame';

@Component({
    selector: 'app-markets',
    templateUrl: './markets-ng.component.html',
    styleUrls: ['./markets-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketsNgComponent extends ContentComponentBaseNgDirective implements MarketsFrame.ComponentAccess, OnInit, OnDestroy {
    @ViewChild('delayedBadness', { static: true }) private _delayedBadnessComponent: DelayedBadnessNgComponent;

    public displayRecords: MarketsFrame.DisplayRecord[];

    private _frame: MarketsFrame;

    constructor(private _cdr: ChangeDetectorRef, contentService: ContentNgService) {
        super();

        this._frame = contentService.createMarketsFrame(this);
        this.displayRecords = this._frame.displayRecords;
    }

    ngOnInit() {
        this._frame.initialise();
    }

    ngOnDestroy() {
        this._frame.finalise();
    }

    public notifyDisplayRecordsChanged() {
        this.displayRecords = this._frame.displayRecords;
        this._cdr.markForCheck();
    }

    public setBadness(value: Badness) {
        this._delayedBadnessComponent.setBadness(value);
    }

    public hideBadnessWithVisibleDelay(badness: Badness) {
        this._delayedBadnessComponent.hideWithVisibleDelay(badness);
    }
}

export namespace MarketsNgComponent {
    export function create(container: ViewContainerRef) {
        container.clear();
        const componentRef = container.createComponent(MarketsNgComponent);
        const instance = componentRef.instance;
        if (!(instance instanceof MarketsNgComponent)) {
            throw new AssertInternalError('MCCI129953235');
        } else {
            return instance;
        }
    }
}
