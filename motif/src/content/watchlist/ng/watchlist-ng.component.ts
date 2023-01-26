import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { GridSourceNgComponent } from '../../ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { WatchlistFrame } from '../watchlist-frame';

@Component({
    selector: 'app-watchlist',
    templateUrl: '../../grid-source/ng/grid-source-ng.component.html',
    styleUrls: ['../../grid-source/ng/grid-source-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WatchlistNgComponent extends GridSourceNgComponent {
    readonly watchlistFrame: WatchlistFrame;

    constructor(
        cdr: ChangeDetectorRef,
        contentNgService: ContentNgService,
    ) {
        super(cdr, contentNgService);

        this.watchlistFrame = contentNgService.createWatchlistFrame(this);
    }
    protected override createGridSourceFrame() {
        return this.watchlistFrame;
    }
}
