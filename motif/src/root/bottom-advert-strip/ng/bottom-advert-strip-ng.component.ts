import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { AdvertTickerNgComponent, BannerAdvertNgComponent } from 'src/content/advert/ng-api';

@Component({
    selector: 'app-bottom-advert-strip',
    templateUrl: './bottom-advert-strip-ng.component.html',
    styleUrls: ['./bottom-advert-strip-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomAdvertStripNgComponent {
    @ViewChild('advertTicker', { static: true }) private _advertTickerComponent: AdvertTickerNgComponent;
    @ViewChild('bannerAdvert', { static: true }) private _bannerAdvertComponent: BannerAdvertNgComponent;

    constructor() {}
}
