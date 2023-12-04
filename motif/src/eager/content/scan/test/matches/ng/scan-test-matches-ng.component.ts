import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject } from '@angular/core';
import { AssertInternalError, LockOpenListItem } from '@motifmarkets/motif-core';
import { CoreInjectionTokens } from 'component-services-ng-api';
import { DelayedBadnessGridSourceNgDirective } from '../../../../delayed-badness-grid-source/ng-api';
import { ContentNgService } from '../../../../ng/content-ng.service';
import { ScanTestMatchesFrame } from '../scan-test-matches-frame';

@Component({
    selector: 'app-scan-test-matches',
    templateUrl: './scan-test-matches-ng.component.html',
    styleUrls: ['./scan-test-matches-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanTestMatchesNgComponent extends DelayedBadnessGridSourceNgDirective {
    private static typeInstanceCreateCount = 0;

    readonly declare frame: ScanTestMatchesFrame;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        contentNgService: ContentNgService,
        @Inject(CoreInjectionTokens.lockOpenListItemOpener) private readonly _opener: LockOpenListItem.Opener,
    ) {
        const frame = contentNgService.createScanTestMatchesFrame();
        super(elRef, ++ScanTestMatchesNgComponent.typeInstanceCreateCount, cdr, frame);
    }

    protected override processAfterViewInit() {
        super.processAfterViewInit();
        const initialisePromise = this.frame.initialiseGrid(this._opener, undefined, false);
        AssertInternalError.throwErrorIfPromiseRejected(initialisePromise, 'STMNCPR50139');
    }
}
