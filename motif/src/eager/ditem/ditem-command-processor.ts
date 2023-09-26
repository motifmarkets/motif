/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Command,
    CommandRegisterService
} from '@motifmarkets/motif-core';
import { InternalDitemCommand } from './ditem-command';
import { DitemCommandContext } from './ditem-command-context';

export class DitemCommandProcessor {
    private _commandRegister: readonly InternalDitemCommand[];
    private _commandContext: DitemCommandContext;

    constructor(private _commandRegisterService: CommandRegisterService) {

        const commandIds = InternalDitemCommand.commandIdArray;
        const commandIdCount = commandIds.length;
        const register = new Array<InternalDitemCommand>(commandIdCount);
        for (let i = 0; i < commandIdCount; i++) {
            const id = commandIds[i];
            register[i] = InternalDitemCommand.createCommand(id, this._commandRegisterService);
        }
        this._commandRegister = register;
    }

    get commandCount() { return this._commandRegister.length; }

    getBarExecutableCommands() {
        const maxCount = this._commandRegister.length;
        const barExecutableCommands = new Array<Command>(maxCount);
        const count = 0;
        for (const command of this._commandRegister) {
            // if (this.isCommandBarExecutable(command)) {
            //     barExecutableCommands[count++] = command;
            // }
        }
        barExecutableCommands.length = count;
        return barExecutableCommands;
    }

    // executeCommand(commandId: InternalDitemCommand.CommandId, parameters: CommandParameters) {
    //     switch (commandId) {
    //         case InternalDitemCommand.CommandId.ToggleSecurityLinking:
    //             this.executeToggleSecurityLinkingCommand();
    //             break;
    //         case InternalDitemCommand.CommandId.SetSecurityLinking:
    //             this.executeSetSecurityLinkingCommand(parameters as SetSecurityLinkingDitemCommandParameters);
    //             break;
    //         case InternalDitemCommand.CommandId.ToggleAccountLinking:
    //             this.executeToggleAccountLinkingCommand();
    //             break;
    //         case InternalDitemCommand.CommandId.SetAccountLinking:
    //             this.executeSetAccountLinkingCommand(parameters as SetAccountLinkingDitemCommandParameters);
    //             break;
    //         default:
    //             throw new UnreachableCaseError('HCCPEC141488475', commandId);
    //     }
    // }

    // createCommandContext(command: Command) {
    //     return this._commandContext;
    // }

    // private isCommandBarExecutable(command: InternalDitemCommand) {
    //     const name = command.name as InternalDitemCommand.CommandNameUnion;
    //     switch (name) {
    //         case 'ToggleSecurityLinking':
    //         case 'SetSecurityLinking':
    //             return this._commandContext.litIvemIdLinkable;
    //         case 'ToggleAccountLinking':
    //         case 'SetAccountLinking':
    //             return this._commandContext.brokerageAccountGroupLinkable;
    //         default:
    //             throw new UnreachableCaseError('DCPEC9141488475', name);
    //     }
    // }

    // private executeToggleSecurityLinkingCommand() {
    //     const currentLinked = this._commandContext.litIvemIdLinked;
    //     if (currentLinked) {
    //         this._commandContext.litIvemIdLinked = false;
    //     } else {
    //         if (!this._commandContext.litIvemIdLinkable) {
    //             throw new AssertInternalError('DCPETSLC11195044');
    //         } else {
    //             this._commandContext.litIvemIdLinked = true;
    //         }
    //     }
    // }

    // private executeSetSecurityLinkingCommand(parameters: SetSecurityLinkingDitemCommandParameters) {
    //     const newLinked = parameters.linked;
    //     if (!newLinked) {
    //         this._commandContext.litIvemIdLinked = false;
    //     } else {
    //         if (!this._commandContext.litIvemIdLinkable) {
    //             throw new AssertInternalError('DCPESSLC11195044');
    //         } else {
    //             this._commandContext.litIvemIdLinked = true;
    //         }
    //     }
    // }

    // private executeToggleAccountLinkingCommand() {
    //     const currentLinked = this._commandContext.brokerageAccountGroupLinked;
    //     if (currentLinked) {
    //         this._commandContext.brokerageAccountGroupLinked = false;
    //     } else {
    //         if (!this._commandContext.brokerageAccountGroupLinkable) {
    //             throw new AssertInternalError('DCPETALC11195044');
    //         } else {
    //             this._commandContext.brokerageAccountGroupLinked = true;
    //         }
    //     }
    // }

    // private executeSetAccountLinkingCommand(parameters: SetAccountLinkingDitemCommandParameters) {
    //     const newLinked = parameters.linked;
    //     if (!newLinked) {
    //         this._commandContext.brokerageAccountGroupLinked = false;
    //     } else {
    //         if (!this._commandContext.brokerageAccountGroupLinkable) {
    //             throw new AssertInternalError('DCPESALC11195044');
    //         } else {
    //             this._commandContext.brokerageAccountGroupLinked = true;
    //         }
    //     }
    // }
}
