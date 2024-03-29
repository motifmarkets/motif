/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EagerControlsNgModule } from 'controls-ng-api';
import { DesktopNgComponent } from '../desktop/ng-api';
import { EnvironmentDisplayNgComponent } from '../environment-display/ng-api';
import { GoldenLayoutHostNgComponent } from '../golden-layout-host/ng-api';
import { LayoutNgComponent } from '../layout/ng-api';
import { StaticInitialise } from '../static-initialise';

@NgModule({
    declarations: [
        DesktopNgComponent,
        EnvironmentDisplayNgComponent,
        LayoutNgComponent,
        GoldenLayoutHostNgComponent,
    ],
    imports: [
        CommonModule,
        EagerControlsNgModule,
    ],
    exports: [
        DesktopNgComponent,
    ],
})

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EagerDesktopNgModule {
    constructor() {
        StaticInitialise.initialise();
    }
}
