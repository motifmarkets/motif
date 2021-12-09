/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    Command,
    CommandParameters,
    CommandProcessor,
    CommandRegisterService,
    UnreachableCaseError,
} from '@motifmarkets/motif-core';
import { InternalDitemCommand } from './ditem-command';
import { DitemCommandContext } from './ditem-command-context';
import { SetAccountLinkingDitemCommandParameters, SetSecurityLinkingDitemCommandParameters } from './ditem-command-parameters';

export class DitemCommandProcessor extends CommandProcessor {
    private _commandRegister: readonly InternalDitemCommand[];

    constructor(private _commandContext: DitemCommandContext, private _commandRegisterService: CommandRegisterService) {
        super();

        const commandNames = InternalDitemCommand.commandNameArray;
        const nameCount = commandNames.length;
        const register = new Array<InternalDitemCommand>(nameCount);
        for (let i = 0; i < nameCount; i++) {
            const name = commandNames[i] as InternalDitemCommand.CommandNameUnion;
            register[i] = InternalDitemCommand.createCommand(name, this._commandRegisterService);
        }
        this._commandRegister = register;
    }

    get commandCount() { return this._commandRegister.length; }

    getBarExecutableCommands() {
        const maxCount = this._commandRegister.length;
        const barExecutableCommands = new Array<Command>(maxCount);
        let count = 0;
        for (const command of this._commandRegister) {
            if (this.isCommandBarExecutable(command)) {
                barExecutableCommands[count++] = command;
            }
        }
        barExecutableCommands.length = count;
        return barExecutableCommands;
    }

    executeCommand(name: InternalDitemCommand.CommandNameUnion, parameters: CommandParameters) {
        switch (name) {
            case 'ToggleSecurityLinking':
                this.executeToggleSecurityLinkingCommand();
                break;
            case 'SetSecurityLinking':
                this.executeSetSecurityLinkingCommand(parameters as SetSecurityLinkingDitemCommandParameters);
                break;
            case 'ToggleAccountLinking':
                this.executeToggleAccountLinkingCommand();
                break;
            case 'SetAccountLinking':
                this.executeSetAccountLinkingCommand(parameters as SetAccountLinkingDitemCommandParameters);
                break;
            default:
                throw new UnreachableCaseError('HCCPEC141488475', name);
        }
    }

    createCommandContext(command: Command) {
        return this._commandContext;
    }

    private isCommandBarExecutable(command: InternalDitemCommand) {
        const name = command.name as InternalDitemCommand.CommandNameUnion;
        switch (name) {
            case 'ToggleSecurityLinking':
            case 'SetSecurityLinking':
                return this._commandContext.litIvemIdLinkable;
            case 'ToggleAccountLinking':
            case 'SetAccountLinking':
                return this._commandContext.brokerageAccountGroupLinkable;
            default:
                throw new UnreachableCaseError('DCPEC9141488475', name);
        }
    }

    private executeToggleSecurityLinkingCommand() {
        const currentLinked = this._commandContext.litIvemIdLinked;
        if (currentLinked) {
            this._commandContext.litIvemIdLinked = false;
        } else {
            if (!this._commandContext.litIvemIdLinkable) {
                throw new AssertInternalError('DCPETSLC11195044');
            } else {
                this._commandContext.litIvemIdLinked = true;
            }
        }
    }

    private executeSetSecurityLinkingCommand(parameters: SetSecurityLinkingDitemCommandParameters) {
        const newLinked = parameters.linked;
        if (!newLinked) {
            this._commandContext.litIvemIdLinked = false;
        } else {
            if (!this._commandContext.litIvemIdLinkable) {
                throw new AssertInternalError('DCPESSLC11195044');
            } else {
                this._commandContext.litIvemIdLinked = true;
            }
        }
    }

    private executeToggleAccountLinkingCommand() {
        const currentLinked = this._commandContext.brokerageAccountGroupLinked;
        if (currentLinked) {
            this._commandContext.brokerageAccountGroupLinked = false;
        } else {
            if (!this._commandContext.brokerageAccountGroupLinkable) {
                throw new AssertInternalError('DCPETALC11195044');
            } else {
                this._commandContext.brokerageAccountGroupLinked = true;
            }
        }
    }

    private executeSetAccountLinkingCommand(parameters: SetAccountLinkingDitemCommandParameters) {
        const newLinked = parameters.linked;
        if (!newLinked) {
            this._commandContext.brokerageAccountGroupLinked = false;
        } else {
            if (!this._commandContext.brokerageAccountGroupLinkable) {
                throw new AssertInternalError('DCPESALC11195044');
            } else {
                this._commandContext.brokerageAccountGroupLinked = true;
            }
        }
    }
}
