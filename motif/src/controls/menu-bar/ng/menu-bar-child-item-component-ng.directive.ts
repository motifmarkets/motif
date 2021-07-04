/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Directive, HostListener } from '@angular/core';
import { AssertInternalError } from 'src/sys/internal-api';
import { MenuBarService } from '../menu-bar-service';
import { MenuBarMenuItemComponentNgDirective } from './menu-bar-menu-item-component-ng.directive';

@Directive()
export abstract class MenuBarChildItemComponentNgDirective extends MenuBarMenuItemComponentNgDirective {
    public value: boolean | undefined;

    private _menuItem: MenuBarService.ChildMenuItem;

    protected get menuItem() { return this._menuItem; }

    @HostListener('mouseleave', []) handleMouseExitEvent() {
        this._menuItem.onMouseLeave();
    }

    protected override initialise() {
        const menuItem = this.menuBarService.getMenuItem(this.menuItemId);
        if (menuItem === undefined) {
            // It is possible (but very unlikely) that menuItem is deleted in the short interval initiating Menu and rendering
            this._menuItem = this.menuBarService.missingChildMenuItem;
        } else {
            if (!MenuBarService.MenuItem.isChildMenu(menuItem)) {
                throw new AssertInternalError('CHMBRICNOI4222295');
            } else {
                this._menuItem = menuItem;
            }
        }

        super.initialise();
    }
}
