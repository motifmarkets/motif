/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { NgSelectOverlayNgComponent } from '../../ng-select-overlay/ng-api';
import { OverlayComponentBaseNgDirective } from '../../ng/overlay-component-base-ng.directive';

@Component({
    selector: 'app-overlay-origin',
    templateUrl: './overlay-origin-ng.component.html',
    styleUrls: ['./overlay-origin-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverlayOriginNgComponent extends OverlayComponentBaseNgDirective {
    @ViewChild('ngSelectOverlay', { static: true }) private _ngSelectOverlayComponent: NgSelectOverlayNgComponent;

    constructor() {
        super();
    }

    updateMeasure(fontFamily: string, fontSize: string) {
        this._ngSelectOverlayComponent.updateMeasure(fontFamily, fontSize);
    }
}
