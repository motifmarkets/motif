/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EagerControlsNgModule } from 'controls-ng-api';
import { NgSelectOverlayNgComponent } from '../ng-select-overlay/ng-api';
import { OverlayOriginNgComponent } from '../overlay-origin/ng-api';

@NgModule({
    declarations: [
        NgSelectOverlayNgComponent,
        OverlayOriginNgComponent,
    ],
    imports: [
        CommonModule,
        EagerControlsNgModule,
    ],
    exports: [
        OverlayOriginNgComponent,
    ],
})

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EagerOverlayNgModule {
}
