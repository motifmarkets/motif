/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, ViewContainerRef } from '@angular/core';
import { GridSourceOrNamedReferenceDefinition, Result } from '@motifmarkets/motif-core';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-save-watchlist-dialog',
    templateUrl: './save-watchlist-dialog-ng.component.html',
    styleUrls: ['./save-watchlist-dialog-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveWatchlistDialogNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    private _closeResolve: (value: Result<GridSourceOrNamedReferenceDefinition.SaveAsDefinition>) => void;

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

    open(): SaveWatchlistDialogNgComponent.ClosePromise {
        return new Promise<Result<GridSourceOrNamedReferenceDefinition.SaveAsDefinition>>((resolve) => {
            this._closeResolve = resolve;
        });
    }
}

export namespace SaveWatchlistDialogNgComponent {
    export type ClosePromise = Promise<Result<GridSourceOrNamedReferenceDefinition.SaveAsDefinition>>;

    export function open(
        container: ViewContainerRef,
    ): ClosePromise {
        container.clear();
        const componentRef = container.createComponent(SaveWatchlistDialogNgComponent);

        const component = componentRef.instance;

        return component.open();
    }
}
