/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { StaticInitialise } from '../static-initialise';

@NgModule({
    declarations: [
    ],
    imports: [
        CommonModule,
    ],
    exports: [
    ],
})

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EagerExtensionsNgModule {
    constructor() {
        StaticInitialise.initialise();
    }
}
