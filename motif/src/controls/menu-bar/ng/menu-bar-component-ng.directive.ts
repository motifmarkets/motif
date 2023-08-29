/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectorRef, Directive, ElementRef } from '@angular/core';
import { Integer } from '@motifmarkets/motif-core';
import { ComponentBaseNgDirective } from '../../../component/ng-api';
import { MenuBarService } from '../menu-bar-service';
import { MenuBarNgService } from './menu-bar-ng.service';

@Directive()
export abstract class MenuBarComponentNgDirective extends ComponentBaseNgDirective {
    private _menuBarService: MenuBarService;

    constructor(
        elRef: ElementRef<HTMLElement>,
        typeInstanceCreateId: Integer,
        private _cdr: ChangeDetectorRef,
        menuBarNgService: MenuBarNgService
    ) {
        super(elRef, typeInstanceCreateId);
        this._menuBarService = menuBarNgService.service;
    }

    protected get menuBarService() { return this._menuBarService; }

    protected markForCheck() {
        this._cdr.markForCheck();
    }
}
