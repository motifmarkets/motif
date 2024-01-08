/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Command } from '@motifmarkets/motif-core';
import { Command as CommandApi } from '../../../api/extension-api';

export class CommandImplementation implements CommandApi {
    constructor(private readonly _actual: Command) { }

    get actual() { return this._actual; }

    get name() { return this._actual.name; }
    get defaultDisplayId() { return this._actual.defaultDisplayIndex; }
    get defaultMenuBarItemPosition() { return this._actual.defaultMenuBarItemPosition; }
}

export namespace CommandImplementation {
    export function toApi(actual: Command): CommandApi {
        return new CommandImplementation(actual);
    }

    export function fromApi(commandApi: CommandApi): Command {
        const implementation = commandApi as CommandImplementation;
        return implementation.actual;
    }
}
