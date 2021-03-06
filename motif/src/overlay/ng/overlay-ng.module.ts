/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ControlsNgModule } from 'controls-ng-api';
import { NgSelectOverlayNgComponent } from '../ng-select-overlay/ng-api';
import { OverlayOriginNgComponent } from '../overlay-origin/ng-api';

@NgModule({
    declarations: [
        NgSelectOverlayNgComponent,
        OverlayOriginNgComponent,
    ],
    imports: [
        CommonModule,
        ControlsNgModule,
    ],
    exports: [
        OverlayOriginNgComponent,
    ],
})

export class OverlayNgModule {
    constructor() {
        // StaticInitialise.initialise();
    }
}
