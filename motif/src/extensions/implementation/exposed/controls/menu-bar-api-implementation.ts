/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommandRegisterService, CommandUiAction as RealCommandUiAction, ExtensionHandle, ExtStringId } from '@motifmarkets/motif-core';
import { MenuBarService } from 'controls-internal-api';
import {
    ApiError as ApiErrorApi,
    ChildMenuItem as ChildMenuItemApi,
    Command as CommandApi,
    CommandMenuItem as CommandMenuItemApi,
    MenuBar as MenuBarApi,
    StringId as StringIdApi
} from '../../../api/extension-api';
import { CommandUiActionImplementation } from '../core/internal-api';
import { ApiErrorImplementation } from '../sys/internal-api';

class CommandMenuItemImplementation extends CommandUiActionImplementation implements CommandMenuItemApi {
    constructor(private readonly _menuItem: MenuBarService.CommandMenuItem) {
        super(_menuItem.uiAction);
    }

    get defaultPosition() { return this._menuItem.defaultPosition; }
    get actualMenuItem() { return this._menuItem; }
}

class ChildMenuItemImplementation implements ChildMenuItemApi {
    constructor(private readonly _actualMenuItem: MenuBarService.ChildMenuItem) { }

    get childMenuName() { return this._actualMenuItem.childMenu.name; }
    get defaultPosition() { return this._actualMenuItem.defaultPosition; }
    get actualMenuItem() { return this._actualMenuItem; }
}

export class MenuBarImplementation implements MenuBarApi {
    private _commandMenuItems: CommandMenuItemImplementation[] = [];
    private _childMenuItems: ChildMenuItemImplementation[] = [];

    constructor(private _extensionHandle: ExtensionHandle,
        private _menuBarService: MenuBarService,
        private _commandRegisterService: CommandRegisterService,
    ) { }

    destroy() {
        this.destroyAllMenuItems();
    }

    beginChanges() {
        this._menuBarService.beginChanges();
    }

    endChanges() {
        this._menuBarService.endChanges();
    }

    createCommandMenuItem(commandApi: CommandApi, overrideDefaultPosition?: MenuBarApi.MenuItemPosition): CommandMenuItemApi {
        const command = this._commandRegisterService.getOrRegisterCommand(this._extensionHandle, commandApi.name,
            commandApi.defaultDisplayId, commandApi.defaultMenuBarItemPosition);
        const commandUiAction = new RealCommandUiAction(command);
        const menuItem = this._menuBarService.connectMenuItem(commandUiAction, overrideDefaultPosition);
        const menuItemImplementation = new CommandMenuItemImplementation(menuItem);
        this._commandMenuItems.push(menuItemImplementation);
        return menuItemImplementation;
    }

    destroyCommandMenuItem(menuItem: CommandMenuItemApi) {
        const idx = this._commandMenuItems.findIndex((item) => item === menuItem);
        if (idx < 0) {
            throw new ApiErrorImplementation(ApiErrorApi.CodeEnum.DestroyCommandMenuItemNotExist, menuItem.command.name);
        } else {
            this.destroyCommandMenuItemAtIndex(idx, menuItem);
        }
    }

    createChildMenuItem(childMenuName: MenuBarApi.MenuName, defaultItemPosition: MenuBarApi.MenuItemPosition,
        displayId?: StringIdApi, accessKeyId?: StringIdApi, embedded?: boolean
    ): ChildMenuItemApi {
        const displayExtId = ExtStringId.createUndefinableIndex(this._extensionHandle, displayId);
        const accessKeyExtId = ExtStringId.createUndefinableIndex(this._extensionHandle, accessKeyId);

        const realChildMenuItem = this._menuBarService.positionChildMenuItem(childMenuName, defaultItemPosition,
            displayExtId, accessKeyExtId, embedded);

        const childMenuItem = new ChildMenuItemImplementation(realChildMenuItem);
        this._childMenuItems.push(childMenuItem);
        return childMenuItem;
    }

    destroyChildMenuItem(menuItem: ChildMenuItemApi) {
        const idx = this._childMenuItems.findIndex((item) => item === menuItem);
        if (idx < 0) {
            throw new ApiErrorImplementation(ApiErrorApi.CodeEnum.DestroyChildMenuItemNotExist, menuItem.childMenuName);
        } else {
            this.destroyChildMenuItemAtIndex(idx, menuItem);
        }
    }

    createRootChildMenuItem(childMenuName: MenuBarApi.MenuName, rank: number, displayId?: StringIdApi, accessKeyId?: StringIdApi) {
        return this.createChildMenuItem(childMenuName, { menuPath: MenuBarService.Menu.Path.root, rank }, displayId, accessKeyId, false);
    }

    createEmbeddedChildMenu(menuName: MenuBarApi.MenuName, defaultPosition: MenuBarApi.MenuItemPosition) {
        return this.createChildMenuItem(menuName, defaultPosition, undefined, undefined, true);
    }

    destroyAllMenuItems() {
        this.destroyAllCommandMenuItems();
        this.destroyAllChildMenuItems();
    }

    private destroyAllCommandMenuItems() {
        const count = this._commandMenuItems.length;

        for (let i = count - 1; i >= 0; i--) {
            const menuItem = this._commandMenuItems[i];
            this.destroyCommandMenuItemAtIndex(i, menuItem);
        }
    }

    private destroyCommandMenuItemAtIndex(idx: number, menuItem: CommandMenuItemApi) {
        this._commandMenuItems.splice(idx, 1);
        const implementation = menuItem as CommandMenuItemImplementation;
        const actualMenuItem = implementation.actualMenuItem;
        this._menuBarService.deregisterCommandMenuItem(actualMenuItem.command, actualMenuItem.defaultPosition);
        implementation.destroy();
    }

    private destroyAllChildMenuItems() {
        const count = this._childMenuItems.length;

        for (let i = count - 1; i >= 0; i--) {
            const menuItem = this._childMenuItems[i];
            this.destroyChildMenuItemAtIndex(i, menuItem);
        }
    }

    private destroyChildMenuItemAtIndex(idx: number, menuItem: ChildMenuItemApi) {
        this._childMenuItems.splice(idx, 1);
        const implementation = menuItem as ChildMenuItemImplementation;
        const actualMenuItem = implementation.actualMenuItem;
        this._menuBarService.deregisterChildMenuItem(actualMenuItem.childMenu.name, actualMenuItem.defaultPosition);
    }
}
