/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { MenuBarNgService } from '../../../ng/menu-bar-ng.service';
import { MenuBarRenderItemComponentNgDirective } from '../../../ng/menu-bar-render-item-component-ng.directive';

@Component({
    selector: 'app-menu-bar-root-divider-item',
    templateUrl: './menu-bar-root-divider-item-ng.component.html',
    styleUrls: ['./menu-bar-root-divider-item-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuBarRootDividerItemNgComponent extends MenuBarRenderItemComponentNgDirective {
    constructor(cdr: ChangeDetectorRef, menuBarNgService: MenuBarNgService) {
        super(cdr, menuBarNgService);
    }
}
