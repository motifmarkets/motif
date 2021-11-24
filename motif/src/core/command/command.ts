/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExtStringId } from 'res-internal-api';
import { ExtensionHandle, Handle, Integer, MapKey } from 'sys-internal-api';

export interface Command {
    readonly extensionHandle: ExtensionHandle;
    readonly name: string;
    readonly registrationHandle: Handle;
    readonly defaultDisplayIndex: ExtStringId.Index;
    readonly defaultMenuBarItemPosition?: Command.MenuBarItemPosition;
}

export namespace Command {
    export type MenuBarMenuName = string;
    export type MenuBarMenuPath = readonly MenuBarMenuName[];

    export interface MenuBarItemPosition {
        readonly menuPath: MenuBarMenuPath;
        readonly rank: Integer;
    }

    const mapKeyPartsDelimiter = ':';

    export function generateMapKey(extensionHandle: ExtensionHandle, name: string): MapKey {
        return extensionHandle.toString(10) + mapKeyPartsDelimiter + name;
    }
}
