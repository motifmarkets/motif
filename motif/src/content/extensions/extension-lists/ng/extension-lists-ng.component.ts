/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-extension-lists',
    templateUrl: './extension-lists-ng.component.html',
    styleUrls: ['./extension-lists-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtensionListsNgComponent extends ContentComponentBaseNgDirective {
}
