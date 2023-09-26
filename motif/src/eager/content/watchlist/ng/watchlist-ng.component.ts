import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { numberToPixels } from '@motifmarkets/motif-core';
import { DelayedBadnessGridSourceNgDirective } from '../../delayed-badness-grid-source/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { WatchlistFrame } from '../watchlist-frame';

@Component({
    selector: 'app-watchlist',
    templateUrl: './watchlist-ng.component.html',
    styleUrls: ['./watchlist-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WatchlistNgComponent extends DelayedBadnessGridSourceNgDirective {
    private static typeInstanceCreateCount = 0;

    declare frame: WatchlistFrame;

    public gridHostFlexBasis = '';

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        contentNgService: ContentNgService,
    ) {
        const frame = contentNgService.createWatchlistFrame();
        super(elRef, ++WatchlistNgComponent.typeInstanceCreateCount, cdr, frame);
    }

    protected override processAfterViewInit() {
        super.processAfterViewInit();
        this.frame.setGridHostFlexBasisEventer = (value) => {
            const newFlexBasis = numberToPixels(value);
            if (newFlexBasis !== this.gridHostFlexBasis) {
                this.gridHostFlexBasis = newFlexBasis;
                this._cdr.markForCheck();
            }
        }
    }
}
