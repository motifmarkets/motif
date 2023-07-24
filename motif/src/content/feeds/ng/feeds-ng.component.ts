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
    Inject,
    Injector,
    ValueProvider,
    ViewContainerRef
} from '@angular/core';
import { LockOpenListItem } from '@motifmarkets/motif-core';
import { CoreInjectionTokens } from 'component-services-ng-api';
import { GridSourceNgDirective } from '../../grid-source/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { FeedsFrame } from '../feeds-frame';

@Component({
    selector: 'app-feeds',
    templateUrl: './feeds-ng.component.html',
    styleUrls: ['./feeds-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedsNgComponent extends GridSourceNgDirective {
    private static typeInstanceCreateCount = 0;

    declare frame: FeedsFrame;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        contentNgService: ContentNgService,
        @Inject(CoreInjectionTokens.lockOpenListItemOpener) private readonly _opener: LockOpenListItem.Opener,
    ) {
        super(elRef, ++FeedsNgComponent.typeInstanceCreateCount, cdr, contentNgService);
    }

    protected override createGridSourceFrame(contentNgService: ContentNgService) {
        return contentNgService.createFeedsFrame(this);
    }

    protected override setupGrid() {
        super.setupGrid();
        this.frame.initialise(this._opener, undefined, false);
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

        container.createComponent(FeedsNgComponent, { injector });
    }
}
