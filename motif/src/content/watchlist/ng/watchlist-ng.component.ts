import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { GridSourceNgDirective } from '../../grid-source/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { WatchlistFrame } from '../watchlist-frame';

@Component({
    selector: 'app-watchlist',
    templateUrl: './watchlist-ng.component.html',
    styleUrls: ['./watchlist-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WatchlistNgComponent extends GridSourceNgDirective {
    private static typeInstanceCreateCount = 0;

    declare frame: WatchlistFrame;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        contentNgService: ContentNgService,
    ) {
        super(elRef, ++WatchlistNgComponent.typeInstanceCreateCount, cdr, contentNgService);
    }

    protected override createGridSourceFrame(contentNgService: ContentNgService, hostElement: HTMLElement) {
        return  contentNgService.createWatchlistFrame(this, hostElement);
    }
}
