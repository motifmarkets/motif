import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-advert-web-page',
    templateUrl: './advert-web-page-ng.component.html',
    styleUrls: ['./advert-web-page-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvertWebPageNgComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {}
}
