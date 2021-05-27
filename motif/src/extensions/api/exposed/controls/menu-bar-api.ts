/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommandUiAction } from '../core/command-ui-action-api';
import { Command } from '../core/extension-api';
import { StringId } from '../resources/extension-api';

/** @public */
export interface CommandMenuItem extends CommandUiAction {
    readonly defaultPosition: MenuBar.MenuItemPosition;
}

/** @public */
export interface ChildMenuItem {
    readonly childMenuName: MenuBar.MenuName;
    readonly defaultPosition: MenuBar.MenuItemPosition;
}

/** @public */
export interface MenuBar {
    beginChanges(): void;
    endChanges(): void;

    createCommandMenuItem(command: Command, overrideDefaultPosition?: MenuBar.MenuItemPosition): CommandMenuItem;
    destroyCommandMenuItem(menuItem: CommandMenuItem): void;

    createChildMenuItem(childMenuName: MenuBar.MenuName, defaultItemPosition: MenuBar.MenuItemPosition,
        displayId?: StringId, accessKeyId?: StringId, embedded?: boolean): ChildMenuItem;
    createRootChildMenuItem(childMenuName: MenuBar.MenuName, rank: number,
        displayId?: StringId, accessKeyId?: StringId): ChildMenuItem;
    createEmbeddedChildMenu(menuName: MenuBar.MenuName, defaultPosition: MenuBar.MenuItemPosition): ChildMenuItem;
    destroyChildMenuItem(menuItem: ChildMenuItem): void;

    destroyAllMenuItems(): void;
}

/** @public */
export namespace MenuBar {
    export type MenuName = string;
    export type MenuItemPosition = Command.MenuBarItemPosition;
}

