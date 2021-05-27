/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Command, StringId } from '../../exposed/extension-api';

/** @public */
export interface CommandSvc {
    getCommand(name: string): Command | undefined;
    getOrRegisterCommand(name: string, defaultDisplayId: StringId, menuBarItemPosition?: Command.MenuBarItemPosition): Command;
}
