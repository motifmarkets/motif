import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-advert-web-page',
    templateUrl: './advert-web-page-ng.component.html',
    styleUrls: ['./advert-web-page-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvertWebPageNgComponent {
    public safeResourceUrl: SafeResourceUrl;

    constructor(private readonly _cdr: ChangeDetectorRef) {}

    loadPage(safeResourceUrl: SafeResourceUrl) {
        this.safeResourceUrl = safeResourceUrl;
        this._cdr.markForCheck();
    }
}
