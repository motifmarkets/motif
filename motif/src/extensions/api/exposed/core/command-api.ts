/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId } from '../resources/extension-api';

/** @public */
export interface Command {
    readonly name: string;
    readonly defaultDisplayId: StringId;
    readonly defaultMenuBarItemPosition?: Command.MenuBarItemPosition;
}

/** @public */
export namespace Command {
    export type MenuBarMenuName = string;
    export type MenuBarMenuPath = readonly MenuBarMenuName[];

    export interface MenuBarItemPosition {
        readonly menuPath: MenuBarMenuPath;
        readonly rank: number;
    }
}

