import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-bottom-advert-strip',
    templateUrl: './bottom-advert-strip-ng.component.html',
    styleUrls: ['./bottom-advert-strip-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomAdvertStripNgComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {}
}
