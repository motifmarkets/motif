import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-scan-properties',
    templateUrl: './scan-properties-ng.component.html',
    styleUrls: ['./scan-properties-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanPropertiesNgComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {}
}
