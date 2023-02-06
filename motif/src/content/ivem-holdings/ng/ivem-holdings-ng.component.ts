/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-ivem-holdings',
    templateUrl: './ivem-holdings-ng.component.html',
    styleUrls: ['./ivem-holdings-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IvemHoldingsNgComponent extends ContentComponentBaseNgDirective {
}
