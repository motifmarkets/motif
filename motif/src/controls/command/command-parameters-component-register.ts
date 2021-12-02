/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Type } from '@angular/core';
import { Command, MapKey } from '@motifmarkets/motif-core';
import { CommandParametersComponentNgDirective } from './ng/ng-api';

export namespace CommandParametersComponentRegister {
    const map = new Map<MapKey, Type<CommandParametersComponentNgDirective>>();

    export function registerComponentType(commandMapKey: MapKey, directive: Type<CommandParametersComponentNgDirective>) {
        map.set(commandMapKey, directive);
    }

    export function getComponentType(command: Command) {
        const mapKey = Command.generateMapKey(command.extensionHandle, command.name);
        return map.get(mapKey);
    }
}
