import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-banner-advert',
    templateUrl: './banner-advert-ng.component.html',
    styleUrls: ['./banner-advert-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BannerAdvertNgComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {}
}
