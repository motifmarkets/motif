/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Directive } from '@angular/core';
import { MenuBarService } from '../menu-bar-service';
import { MenuBarComponentNgDirective } from './menu-bar-component-ng.directive';

@Directive()
export abstract class MenuBarMenuComponentNgDirective extends MenuBarComponentNgDirective {
    public MenuItemTypeId = MenuBarService.RenderMenuItemTypeId;
    public menuItems: readonly MenuBarService.RenderMenuItem[] = [];

    protected renderMenu(menu: MenuBarService.RenderMenu) {
        this.menuItems = menu.items;
        this.markForCheck();
    }
}
