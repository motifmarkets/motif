/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommandRegisterService, InternalCommand } from 'core-internal-api';
import { StringId, Strings } from 'res-internal-api';

export interface InternalDitemCommand extends InternalCommand {
}

export namespace InternalDitemCommand {

    const enum CommandName {
        ToggleSecurityLinking = InternalCommand.Name.ToggleAccountLinking,
        SetSecurityLinking = InternalCommand.Name.SetSymbolLinking,
        ToggleAccountLinking = InternalCommand.Name.ToggleAccountLinking,
        SetAccountLinking = InternalCommand.Name.SetAccountLinking,
    }

    export type CommandNameUnion = keyof typeof CommandName;

    type InfosObject = { [name in CommandNameUnion]: StringId };

    const infosMap: InfosObject = {
        ToggleSecurityLinking: StringId.DitemCommandDisplay_ToggleSecurityLinking,
        SetSecurityLinking: StringId.DitemCommandDisplay_SetSecurityLinking,
        ToggleAccountLinking: StringId.DitemCommandDisplay_ToggleAccountLinking,
        SetAccountLinking: StringId.DitemCommandDisplay_SetAccountLinking,
    } as const;

    export const commandCount = Object.keys(infosMap).length;
    export const commandNameArray = Object.keys(infosMap);

    export function nameToDisplayId(name: CommandNameUnion) {
        return infosMap[name];
    }

    export function idToDisplay(name: CommandNameUnion) {
        return Strings[nameToDisplayId(name)];
    }

    export function createCommand(name: CommandNameUnion, commandRegisterService: CommandRegisterService) {
        return commandRegisterService.getOrRegisterInternalCommand(name as InternalCommand.Name, nameToDisplayId(name));
    }
}
