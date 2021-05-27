/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, EnumInfoOutOfOrderError } from 'src/sys/internal-api';

export const enum InstrumentMovementColorSetId {
    American,
    European,
    Asian1,
    Asian2,
}

export namespace InstrumentMovementColorSet {
    export type Id = InstrumentMovementColorSetId;

    class Info {
        constructor(
            public id: Id,
            public jsonValue: string,
            public display: string,
        ) { }
    }

    type InfoObjects = { [id in keyof typeof InstrumentMovementColorSetId]: Info };

    const infoObjects: InfoObjects = {
        American: {
            id: InstrumentMovementColorSetId.American,
            jsonValue: 'American',
            display: 'American',
        },
        European: {
            id: InstrumentMovementColorSetId.European,
            jsonValue: 'European',
            display: 'European',
        },
        Asian1: {
            id: InstrumentMovementColorSetId.Asian1,
            jsonValue: 'Asian1',
            display: 'Asian1',
        },
        Asian2: {
            id: InstrumentMovementColorSetId.Asian2,
            jsonValue: 'Asian2',
            display: 'Asian2',
        },
    };

    export const idCount = Object.keys(infoObjects).length;
    const infos = Object.values(infoObjects);

    export function staticConstructor() {
        const outOfOrderIdx = infos.findIndex((info: Info, index: number) => info.id !== index);
        if (outOfOrderIdx >= 0) {
            throw new EnumInfoOutOfOrderError('ColorScheme.Id', outOfOrderIdx, infos[outOfOrderIdx].jsonValue);
        }
    }

    export function idToJsonValue(id: Id): string {
        return infos[id].jsonValue;
    }

    export function jsonValueToId(jsonValue: string): Id {
        const index = infos.findIndex(info => info.jsonValue === jsonValue);
        if (index >= 0) {
            return infos[index].id;
        } else {
            throw new AssertInternalError('PTIMCSJVTI8884855488');
        }
    }

    export function tryJsonToId(jsonValue: string): Id | undefined {
        const index = infos.findIndex(info => info.jsonValue === jsonValue);
        return index >= 0 ? infos[index].id : undefined;
    }

    export function idToDisplay(id: Id): string {
        return infos[id].display;
    }

    export function getAll(): Id[] {
        return infos.map(info => info.id);
    }
}

export namespace PulseTypesModule {
    export function initialiseStatic(): void {
        InstrumentMovementColorSet.staticConstructor();
    }
}
