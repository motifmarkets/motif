/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-extensions-search',
    templateUrl: './extensions-search-ng.component.html',
    styleUrls: ['./extensions-search-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtensionsSearchNgComponent extends ContentComponentBaseNgDirective implements OnInit {
    constructor() {
        super();
    }

    ngOnInit(): void {}
}
