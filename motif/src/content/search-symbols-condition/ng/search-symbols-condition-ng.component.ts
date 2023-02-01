/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-search-symbols-condition-ng',
    templateUrl: './search-symbols-condition-ng.component.html',
    styleUrls: ['./search-symbols-condition-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchSymbolsConditionNgComponent extends ContentComponentBaseNgDirective {
}
