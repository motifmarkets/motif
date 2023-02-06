/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, ViewContainerRef } from '@angular/core';
import { GridSourceOrNamedReferenceDefinition, Result } from '@motifmarkets/motif-core';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-open-watchlist-dialog',
    templateUrl: './open-watchlist-dialog-ng.component.html',
    styleUrls: ['./open-watchlist-dialog-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenWatchlistDialogNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    private _closeResolve: (value: Result<GridSourceOrNamedReferenceDefinition>) => void;

    constructor() {
        super();
    }

    ngAfterViewInit() {
        // delay1Tick(() => this.initialiseComponents());
    }

    ngOnDestroy() {
        // this._okUiAction.finalise();
        // this._cancelUiAction.finalise();
    }

    open(): OpenWatchlistDialogNgComponent.ClosePromise {
        return new Promise<Result<GridSourceOrNamedReferenceDefinition>>((resolve) => {
            this._closeResolve = resolve;
        });
    }
}

export namespace OpenWatchlistDialogNgComponent {
    export type ClosePromise = Promise<Result<GridSourceOrNamedReferenceDefinition>>;

    export function open(
        container: ViewContainerRef,
    ): ClosePromise {
        container.clear();
        const componentRef = container.createComponent(OpenWatchlistDialogNgComponent);

        const component = componentRef.instance;

        return component.open();
    }
}
