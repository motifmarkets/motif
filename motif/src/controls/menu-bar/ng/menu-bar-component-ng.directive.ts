/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectorRef, Directive } from '@angular/core';
import { MenuBarService } from '../menu-bar-service';
import { MenuBarNgService } from './menu-bar-ng.service';

@Directive()
export abstract class MenuBarComponentNgDirective {
    private _menuBarService: MenuBarService;

    protected get menuBarService() { return this._menuBarService; }

    constructor(private _cdr: ChangeDetectorRef, menuBarNgService: MenuBarNgService) {
        this._menuBarService = menuBarNgService.service;
    }

    protected markForCheck() {
        this._cdr.markForCheck();
    }
}
