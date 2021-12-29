/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommandRegisterService, InternalCommand, StringId, Strings } from '@motifmarkets/motif-core';

export interface InternalDitemCommand extends InternalCommand {
}

export namespace InternalDitemCommand {

    export const enum CommandId {
        ToggleSecurityLinking = InternalCommand.Id.ToggleAccountLinking,
        SetSecurityLinking = InternalCommand.Id.SetSymbolLinking,
        ToggleAccountLinking = InternalCommand.Id.ToggleAccountLinking,
        SetAccountLinking = InternalCommand.Id.SetAccountLinking,
    }

    type InfosObject = { [id in keyof typeof CommandId]: StringId };

    const infosMap: InfosObject = {
        ToggleSecurityLinking: StringId.DitemCommandDisplay_ToggleSecurityLinking,
        SetSecurityLinking: StringId.DitemCommandDisplay_SetSecurityLinking,
        ToggleAccountLinking: StringId.DitemCommandDisplay_ToggleAccountLinking,
        SetAccountLinking: StringId.DitemCommandDisplay_SetAccountLinking,
    } as const;

    export const commandCount = Object.keys(infosMap).length;
    export const commandIdArray = [
        CommandId.ToggleSecurityLinking,
        CommandId.SetSecurityLinking,
        CommandId.ToggleAccountLinking,
        CommandId.SetAccountLinking,
    ];

    export function idToDisplayId(id: CommandId) {
        return infosMap[id];
    }

    export function idToDisplay(id: CommandId) {
        return Strings[idToDisplayId(id)];
    }

    export function createCommand(id: CommandId, commandRegisterService: CommandRegisterService) {
        return commandRegisterService.getOrRegisterInternalCommand(id as unknown as InternalCommand.Id, idToDisplayId(id));
    }
}
