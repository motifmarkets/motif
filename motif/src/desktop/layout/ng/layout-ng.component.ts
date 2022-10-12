/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ComponentBaseNgDirective } from 'component-ng-api';

@Component({
    selector: 'app-layout',
    templateUrl: './layout-ng.component.html',
    styleUrls: ['./layout-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutNgComponent extends ComponentBaseNgDirective implements OnInit {

    constructor() {
        super();
    }

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
