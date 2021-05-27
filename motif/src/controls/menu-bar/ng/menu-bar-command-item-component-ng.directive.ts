/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Directive, HostBinding, HostListener } from '@angular/core';
import { AssertInternalError } from 'src/sys/internal-api';
import { MenuBarService } from '../menu-bar-service';
import { MenuBarMenuItemComponentNgDirective } from './menu-bar-menu-item-component-ng.directive';

@Directive()
export abstract class MenuBarCommandItemComponentNgDirective extends MenuBarMenuItemComponentNgDirective {
    @HostBinding('title') title: string;
    public value: boolean | undefined;

    private _menuItem: MenuBarService.CommandMenuItem;

    protected get menuItem() { return this._menuItem; }

    @HostListener('click', ['$event']) handleClickEvent(event: MouseEvent) {
        this._menuItem.onMouseClick(event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);
    }

    @HostListener('mouseenter', []) handleMouseEnterEvent() {
        this.menuItem.onMouseEnter();
    }

    @HostListener('mouseleave', []) handleMouseExitEvent() {
        this.menuItem.onMouseLeave();
    }

    finalise() {
        this._menuItem.titleChangedEvent = undefined;
        this._menuItem.valueChangedEvent = undefined;

        super.finalise();
    }

    protected initialise() {
        const menuItem = this.menuBarService.getMenuItem(this.menuItemId);
        if (menuItem === undefined) {
            // It is possible (but very unlikely) that menuItem is deleted in the short interval initiating Menu and rendering
            this._menuItem = this.menuBarService.missingCommandMenuItem;
        } else {
            if (!MenuBarService.MenuItem.isCommand(menuItem)) {
                throw new AssertInternalError('MBCICDI1222295');
            } else {
                this._menuItem = menuItem;
                this._menuItem.titleChangedEvent = () => this.handleTitleChangedEvent();
                this._menuItem.valueChangedEvent = () => this.handleValueChangedEvent();
                this.accessibleCaption = this._menuItem.accessibleCaption;
                this.updateTitle();
                this.value = this._menuItem.value;
            }
        }

        super.initialise();
    }

    private handleTitleChangedEvent() {
        this.updateTitle();
    }

    private handleValueChangedEvent() {
        this.value = this._menuItem.value;
        this.markForCheck();
    }

    private updateTitle() {
        const title = this._menuItem.title === undefined ? '' : this._menuItem.title;
        if (title !== this.title) {
            this.title = title;
            this.markForCheck();
        }
    }
}
