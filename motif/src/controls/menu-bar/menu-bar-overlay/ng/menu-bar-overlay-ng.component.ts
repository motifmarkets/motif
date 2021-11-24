/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactory,
    ComponentFactoryResolver,
    Injector,

    StaticProvider,
    ViewChild,
    ViewContainerRef,
    ViewRef
} from '@angular/core';
import { AssertInternalError, Line } from 'sys-internal-api';
import { MenuBarOverlayMenuNgComponent } from '../../menu-bar-overlay-menu/ng-api';
import { MenuBarService } from '../../menu-bar-service';
import { MenuBarNgService } from '../../ng/menu-bar-ng.service';

@Component({
    selector: 'app-menu-bar-overlay',
    templateUrl: './menu-bar-overlay-ng.component.html',
    styleUrls: ['./menu-bar-overlay-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuBarOverlayNgComponent {
    @ViewChild('menusContainer', {read: ViewContainerRef}) private _menusContainerRef: ViewContainerRef;

    private readonly _menuBarService: MenuBarService;
    private readonly _menuFactory: ComponentFactory<MenuBarOverlayMenuNgComponent>;
    private readonly _activeMenus: MenuBarOverlayComponent.Menu[] = [];

    constructor(private _cdr: ChangeDetectorRef, componentFactoryResolver: ComponentFactoryResolver, menuBarNgService: MenuBarNgService) {
        this._menuBarService = menuBarNgService.service;
        this._menuBarService.addOverlayChildMenuEvent = (menu, parentItemContactDocumentLine) =>
            this.handleAddOverlayChildMenuEvent(menu, parentItemContactDocumentLine);
        this._menuBarService.deleteOverlayChildMenuEvent = (menu) => this.handleDeleteOverlayChildMenuEvent(menu);
        this._menuBarService.clearOverlayChildMenusEvent = () => this.handleClearOverlayChildMenusEvent();

        this._menuFactory = componentFactoryResolver.resolveComponentFactory(MenuBarOverlayMenuNgComponent);
    }

    private handleAddOverlayChildMenuEvent(childMenu: MenuBarService.ChildMenu, parentItemContactDocumentLine: Line) {
        const childMenuProvider: StaticProvider = {
            provide: MenuBarOverlayMenuNgComponent.ChildMenuInjectionToken,
            useValue: childMenu,
        };
        const parentItemContactDocumentLineProvider: StaticProvider = {
            provide: MenuBarOverlayMenuNgComponent.ParentItemContactDocumentLineInjectionToken,
            useValue: parentItemContactDocumentLine,
        };
        const injector = Injector.create({
            providers: [childMenuProvider, parentItemContactDocumentLineProvider],
        });
        const componentRef = this._menuFactory.create(injector);
        const viewRef = componentRef.hostView;
        this._menusContainerRef.insert(viewRef);
        this._activeMenus.push({
            childMenu,
            viewRef,
        });
        this._cdr.markForCheck();
    }

    private handleDeleteOverlayChildMenuEvent(childMenu: MenuBarService.ChildMenu) {
        const activeMenuIdx = this._activeMenus.findIndex((activeMenu) => activeMenu.childMenu === childMenu);
        if (activeMenuIdx < 0) {
            throw new AssertInternalError('MBOCHDOCME877452');
        } else {
            const activeMenu = this._activeMenus[activeMenuIdx];
            const viewRefIdx = this._menusContainerRef.indexOf(activeMenu.viewRef);
            this._menusContainerRef.remove(viewRefIdx);
            this._activeMenus.splice(activeMenuIdx, 1);
            this._cdr.markForCheck();
        }
    }

    private handleClearOverlayChildMenusEvent() {
        this._menusContainerRef.clear();
        this._cdr.markForCheck();
    }
}

export namespace MenuBarOverlayComponent {
    export interface Menu {
        readonly childMenu: MenuBarService.ChildMenu;
        readonly viewRef: ViewRef;
    }
}
