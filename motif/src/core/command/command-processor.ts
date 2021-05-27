/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer } from 'src/sys/internal-api';
import { Command } from './command';
import { CommandContext } from './command-context';
import { CommandParameters } from './command-parameters';

export abstract class CommandProcessor {
    abstract get commandCount(): Integer;
    abstract getBarExecutableCommands(): readonly Command[];
    abstract createCommandContext(command: Command): CommandContext;
    abstract executeCommand(commandName: string, parameters: CommandParameters): void;
}

export namespace CommandProcessor {
    export class NullCommandProcessor {
        readonly commandCount: 0;
        getBarExecutableCommands() {
            return [];
        }

        createCommandContext(command: Command) {
            return {};
        }

        executeCommand(commandName: string, parameters: CommandParameters) {

        }
    }

    export const nullCommandProcessor = new NullCommandProcessor();
}
