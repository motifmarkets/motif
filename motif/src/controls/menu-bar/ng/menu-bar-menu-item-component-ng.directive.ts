/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectorRef, Directive, HostBinding, Input } from '@angular/core';
import { ColorSettings, CommandUiAction, EnumInfoOutOfOrderError, Integer, MultiEvent, SettingsService } from '@motifmarkets/motif-core';
import { MenuBarService } from '../menu-bar-service';
import { MenuBarNgService } from './menu-bar-ng.service';
import { MenuBarRenderItemComponentNgDirective } from './menu-bar-render-item-component-ng.directive';

@Directive()
export abstract class MenuBarMenuItemComponentNgDirective extends MenuBarRenderItemComponentNgDirective {
    @HostBinding('class') class: MenuBarMenuItemComponentNgDirective.ClassUnion;
    @HostBinding('style.background-color') bkgdColor: string; // set in descendants
    @HostBinding('style.color') foreColor: string; // set in descendants

    @Input() menuItemId: Integer;

    public keyboardActive: boolean;
    public caption: string;
    public accessibleCaption: CommandUiAction.AccessibleCaption;

    private _colorSettings: ColorSettings;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _keyboardActiveChangedSubscriptionId: MultiEvent.SubscriptionId;

    private _stateColorId: MenuBarMenuItemComponentNgDirective.StateColorId;

    constructor(cdr: ChangeDetectorRef, private readonly _settingsService: SettingsService, menuBarNgService: MenuBarNgService) {
        super(cdr, menuBarNgService);
        this._colorSettings = this._settingsService.color;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());
    }

    protected get stateColorId() { return this._stateColorId; }
    protected get colorSettings() { return this._colorSettings; }
    protected abstract get menuItem(): MenuBarService.MenuItem;

    protected initialise() {
        this.keyboardActive = this.menuBarService.keyboardActive;
        this.caption = this.menuItem.caption;
        this._keyboardActiveChangedSubscriptionId = this.menuBarService.subscribeKeyboardActiveChangedEvent(
            () => this.handleKeyboardActiveChangedEvent()
        );
        this.menuItem.stateChangedEvent = () => this.handleMenuItemStateChangedEvent();
        this.menuItem.captionChangedEvent = () => this.handleMenuItemCaptionChangedEvent();
        this.menuItem.accessibleCaptionChangedEvent = () => this.handleMenuItemAccessibleCaptionChangedEvent();
        this.menuItem.flagRendered();
        const stateId = this.menuItem.stateId;
        this.class = MenuBarMenuItemComponentNgDirective.State.idToKeyboardableCssClass(stateId, this.keyboardActive);
        this._stateColorId = MenuBarMenuItemComponentNgDirective.State.idToColorId(stateId);
        this.caption = this.menuItem.caption;
        this.applyColors();
    }

    protected finalise() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
        this.menuBarService.unsubscribeKeyboardActiveChangedEvent(this._keyboardActiveChangedSubscriptionId);
        this.menuItem.stateChangedEvent = undefined;
        this.menuItem.captionChangedEvent = undefined;
        this.menuItem.flagNotRendered();
    }

    private handleKeyboardActiveChangedEvent() {
        this.keyboardActive = this.menuBarService.keyboardActive;
        this.markForCheck();
    }

    private handleSettingsChangedEvent() {
        this.applyColors();
    }

    private handleMenuItemStateChangedEvent() {
        this.updateStateIdKey();
    }

    private handleMenuItemCaptionChangedEvent() {
        this.caption = this.menuItem.caption;
        this.markForCheck();
    }

    private handleMenuItemAccessibleCaptionChangedEvent() {
        this.accessibleCaption = this.menuItem.accessibleCaption;
        this.markForCheck();
    }

    private updateStateIdKey() {
        const stateId = this.menuItem.stateId;
        this.class = MenuBarMenuItemComponentNgDirective.State.idToKeyboardableCssClass(stateId, this.keyboardActive);
        this._stateColorId = MenuBarMenuItemComponentNgDirective.State.idToColorId(stateId);
        this.applyColors();
        this.markForCheck();
    }

    // private calculateStateInfo(): MenuBarMenuItemComponentDirective.StateInfo {
    //     const menuItemStateId = this.menuItem.stateId;
    //     switch (menuItemStateId) {
    //         case MenuBarService.MenuItem.StateId.NotRendered: throw new AssertInternalError('MBMICDCSIKN3232009');
    //         case MenuBarService.MenuItem.StateId.Disabled:
    //             return {
    //                 key: MenuBarMenuItemComponentDirective.disabledKey,
    //                 colorId: MenuBarMenuItemComponentDirective.StateColorId.Disabled
    //             };
    //         case MenuBarService.MenuItem.StateId.Enabled:
    //             return {
    //                 key: MenuBarMenuItemComponentDirective.enabledKey,
    //                 colorId: MenuBarMenuItemComponentDirective.StateColorId.Enabled
    //             };
    //         case MenuBarService.MenuItem.StateId.ParentHighlighted:
    //             return {
    //                 key: MenuBarMenuItemComponentDirective.parentHighlightedKey,
    //                 colorId: MenuBarMenuItemComponentDirective.StateColorId.Highlighed
    //             };
    //         case MenuBarService.MenuItem.StateId.FocusHighlighted:
    //             return this.keyboardActive ?
    //                 {
    //                     key: MenuBarMenuItemComponentDirective.keyboardFocusHighlightedKey,
    //                     colorId: MenuBarMenuItemComponentDirective.StateColorId.Highlighed
    //                 } :
    //                 {
    //                     key: MenuBarMenuItemComponentDirective.focusHighlightedKey,
    //                     colorId: MenuBarMenuItemComponentDirective.StateColorId.Highlighed
    //                 };
    //         default: throw new UnreachableCaseError('MBMICDCSIKU3100984', menuItemStateId);
    //     }
    // }

    protected abstract applyColors(): void;
}

export namespace MenuBarMenuItemComponentNgDirective {
    // export const disabledKey = 'd';
    // export const enabledKey = 'e';
    // export const parentHighlightedKey = 'ph';
    // export const focusHighlightedKey = 'fh';
    // export const keyboardFocusHighlightedKey = 'kfh';

    // export type StateIdKey = 'd' | 'e' | 'ph' | 'fh' | 'kfh';

    export const enum Class {
        disabled = 'disabled',
        enabled = 'enabled',
        parent = 'parent',
        focus = 'focus',
        keyboardFocus = 'keyboardFocus',
    }

    export type ClassUnion = keyof typeof Class;

    export const enum StateColorId {
        Disabled,
        Enabled,
        Highlighed,
    }

    export interface StateInfo {
        readonly key: ClassUnion;
        readonly colorId: StateColorId;
    }

    export namespace State {
        type Id = MenuBarService.MenuItem.StateId;

        interface Info {
            id: Id;
            readonly cssClass: ClassUnion;
            readonly keyboardCssClass: ClassUnion;
            readonly colorId: StateColorId;
        }

        type InfosObject = { [id in keyof typeof MenuBarService.MenuItem.StateId]: Info };

        const infosObject: InfosObject = {
            NotRendered: {
                id: MenuBarService.MenuItem.StateId.NotRendered,
                cssClass: 'disabled',
                keyboardCssClass: 'disabled',
                colorId: StateColorId.Disabled,
            },
            Disabled: {
                id: MenuBarService.MenuItem.StateId.Disabled,
                cssClass: 'disabled',
                keyboardCssClass: 'disabled',
                colorId: StateColorId.Disabled,
            },
            Enabled: {
                id: MenuBarService.MenuItem.StateId.Enabled,
                cssClass: 'enabled',
                keyboardCssClass: 'enabled',
                colorId: StateColorId.Enabled,
            },
            ParentHighlighted: {
                id: MenuBarService.MenuItem.StateId.ParentHighlighted,
                cssClass: 'parent',
                keyboardCssClass: 'parent',
                colorId: StateColorId.Highlighed,
            },
            FocusHighlighted: {
                id: MenuBarService.MenuItem.StateId.FocusHighlighted,
                cssClass: 'focus',
                keyboardCssClass: 'keyboardFocus',
                colorId: StateColorId.Highlighed,
            },
        } as const;

        const infos = Object.values(infosObject);

        export function initialise() {
            const count = infos.length;
            for (let i = 0; i < length; i++) {
                if (i !== infos[i].id) {
                    throw new EnumInfoOutOfOrderError('MenuBarMenuItemComponentDirective.State', i, infos[i].cssClass);
                }
            }
        }

        export function idToCssClass(id: Id) {
            return infos[id].cssClass;
        }

        export function idToKeyboardableCssClass(id: Id, keyboardActive: boolean) {
            return keyboardActive ? infos[id].keyboardCssClass : infos[id].cssClass;
        }

        export function idToColorId(id: Id) {
            return infos[id].colorId;
        }
    }
}

export namespace MenuBarMenuItemComponentDirectiveModule {
    export function initialiseStatic() {
        MenuBarMenuItemComponentNgDirective.State.initialise();
    }
}
