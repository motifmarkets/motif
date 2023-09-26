/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommandRegisterService, ExtensionHandle } from '@motifmarkets/motif-core';
import { Command as CommandApi, CommandSvc as CommandSvcApi, StringId as StringIdApi } from '../../../api/extension-api';
import { CommandImplementation } from '../../exposed/internal-api';

export class CommandSvcImplementation implements CommandSvcApi {
    constructor(
        private readonly _extensionHandle: ExtensionHandle,
        private readonly _commandRegisterService: CommandRegisterService
    ) { }

    getCommand(name: string) {
        const internalCommand = this._commandRegisterService.getCommand(this._extensionHandle, name);
        return internalCommand === undefined ? undefined : CommandImplementation.toApi(internalCommand);
    }

    getOrRegisterCommand(name: string, defaultDisplayId: StringIdApi, menuBarItemPosition?: CommandApi.MenuBarItemPosition) {
        const internalCommand = this._commandRegisterService.getOrRegisterCommand(this._extensionHandle, name,
            defaultDisplayId, menuBarItemPosition);
        return CommandImplementation.toApi(internalCommand);
    }
}
