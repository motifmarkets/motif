/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-layout',
    templateUrl: './layout-ng.component.html',
    styleUrls: ['./layout-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutNgComponent implements OnInit {

    constructor() { }

    ngOnInit() {
    }

    loadButtonClick(): void {
        // this.desktopService.loadLayout();
    }

    saveButtonClick(): void {
        // this.desktopService.saveLayout();
    }

    resetButtonClick(): void {
        // this.desktopService.resetLayout();
    }

}
