/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, InjectionToken, Injector, OnDestroy, ValueProvider, ViewContainerRef } from '@angular/core';
import { LockOpenListItem } from '@motifmarkets/motif-core';
import { CoreInjectionTokens } from 'component-services-ng-api';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';
import { RevDataSourceOrReferenceDefinition } from '@xilytix/rev-data-source';

@Component({
    selector: 'app-save-watchlist-dialog',
    templateUrl: './save-watchlist-dialog-ng.component.html',
    styleUrls: ['./save-watchlist-dialog-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveWatchlistDialogNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    private _closeResolve: (value: RevDataSourceOrReferenceDefinition.SaveAsDefinition | undefined) => void;

    constructor(elRef: ElementRef<HTMLElement>) {
        super(elRef, ++SaveWatchlistDialogNgComponent.typeInstanceCreateCount);
    }

    ngAfterViewInit() {
        // delay1Tick(() => this.initialiseComponents());
    }

    ngOnDestroy() {
        // this._okUiAction.finalise();
        // this._cancelUiAction.finalise();
    }

    open(): SaveWatchlistDialogNgComponent.ClosePromise {
        return new Promise<RevDataSourceOrReferenceDefinition.SaveAsDefinition | undefined>((resolve) => {
            this._closeResolve = resolve;
        });
    }
}

export namespace SaveWatchlistDialogNgComponent {
    export type ClosePromise = Promise<RevDataSourceOrReferenceDefinition.SaveAsDefinition | undefined>;
    export const captionInjectionToken = new InjectionToken<string>('SaveWatchlistDialogNgComponent.Caption');

    export function open(
        container: ViewContainerRef,
        opener: LockOpenListItem.Opener,
        caption: string,
    ): ClosePromise {
        container.clear();

        const openerProvider: ValueProvider = {
            provide: CoreInjectionTokens.lockOpenListItemOpener,
            useValue: opener,
        };
        const captionProvider: ValueProvider = {
            provide: captionInjectionToken,
            useValue: caption,
        }
        const injector = Injector.create({
            providers: [openerProvider, captionProvider],
        });

        const componentRef = container.createComponent(SaveWatchlistDialogNgComponent, { injector });

        const component = componentRef.instance;

        return component.open();
    }
}
