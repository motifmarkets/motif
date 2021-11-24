/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    Inject,
    InjectionToken,
    OnDestroy
} from '@angular/core';
import { SettingsNgService } from 'component-services-ng-api';
import {
    ColorScheme,
    ColorSettings,
    SettingsService
} from 'core-internal-api';
import { Line, MultiEvent, numberToPixels } from 'sys-internal-api';
import { MenuBarService } from '../../menu-bar-service';
import { MenuBarMenuComponentNgDirective } from '../../ng/menu-bar-menu-component-ng.directive';
import { MenuBarNgService } from '../../ng/menu-bar-ng.service';

@Component({
    selector: 'app-menu-bar-overlay-menu',
    templateUrl: './menu-bar-overlay-menu-ng.component.html',
    styleUrls: ['./menu-bar-overlay-menu-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuBarOverlayMenuNgComponent extends MenuBarMenuComponentNgDirective implements OnDestroy {
    @HostBinding('style.left') left: string;
    @HostBinding('style.top') top: string;
    @HostBinding('style.background-color') bkgdColor: string;
    @HostBinding('style.border-color') borderColor: string;

    private readonly _settingsService: SettingsService;
    private readonly _colorSettings: ColorSettings;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        cdr: ChangeDetectorRef,
        private readonly _elRef: ElementRef<HTMLElement>,
        @Inject(MenuBarOverlayMenuNgComponent.ChildMenuInjectionToken)
        private readonly _menu: MenuBarService.ChildMenu,
        @Inject(
            MenuBarOverlayMenuNgComponent.ParentItemContactDocumentLineInjectionToken
        )
        parentItemContactDocumentLineInjectionTokenMenu: Line,
        settingsNgService: SettingsNgService,
        menuBarNgService: MenuBarNgService
    ) {
        super(cdr, menuBarNgService);

        this._settingsService = settingsNgService.settingsService;
        this._colorSettings = this._settingsService.color;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(
            () => this.handleSettingsChangedEvent()
        );

        this.left = numberToPixels(
            parentItemContactDocumentLineInjectionTokenMenu.beginX
        );
        this.top = numberToPixels(
            parentItemContactDocumentLineInjectionTokenMenu.beginY
        );

        this.applyColors();

        this._menu.renderEvent = (childMenu) => this.renderMenu(childMenu);
        this._menu.getIsMouseOverEvent = (mouseClientX, mouseClientY) =>
            this.handleGetIsMouseOverEvent(mouseClientX, mouseClientY);
        this._menu.flagRendered();
    }

    protected get menu() {
        return this._menu;
    }

    ngOnDestroy() {
        this.menu.renderEvent = undefined;
        this.menu.getIsMouseOverEvent = undefined;
        this._menu.flagNotRendered();
        this._settingsService.unsubscribeSettingsChangedEvent(
            this._settingsChangedSubscriptionId
        );
    }

    protected applyColors() {
        this.bkgdColor = this._colorSettings.getBkgd(
            ColorScheme.ItemId.MenuBar_OverlayMenu
        );
        this.borderColor = this._colorSettings.getFore(
            ColorScheme.ItemId.MenuBar_OverlayMenu
        );
    }

    private handleSettingsChangedEvent() {
        this.applyColors();
    }

    private handleGetIsMouseOverEvent(
        mouseClientX: number,
        mouseClientY: number
    ) {
        const domRect = this._elRef.nativeElement.getBoundingClientRect();
        return (
            mouseClientX >= domRect.left &&
            mouseClientX < domRect.right &&
            mouseClientY >= domRect.top &&
            mouseClientY < domRect.bottom
        );
    }
}

export namespace MenuBarOverlayMenuNgComponent {
    const childMenuTokenName = 'childMenu';
    export const ChildMenuInjectionToken = new InjectionToken<MenuBarService.ChildMenu>(
        childMenuTokenName
    );
    const parentItemContactDocumentLineTokenName =
        'parentItemContactDocumentLine';
    export const ParentItemContactDocumentLineInjectionToken = new InjectionToken<Line>(
        parentItemContactDocumentLineTokenName
    );
}
