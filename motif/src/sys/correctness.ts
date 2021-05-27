/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EnumInfoOutOfOrderError, UnreachableCaseError } from './internal-error';

export const enum CorrectnessId {
    Good,
    Usable,
    Suspect,
    Error,
}

export namespace Correctness {
    interface Info {
        readonly id: CorrectnessId;
        readonly usable: boolean;
    }

    type InfosObject = { [id in keyof typeof CorrectnessId]: Info };

    const infosObject: InfosObject = {
        Good: { id: CorrectnessId.Good,
            usable: true,
        },
        Usable: { id: CorrectnessId.Usable,
            usable: true,
        },
        Suspect: { id: CorrectnessId.Suspect,
            usable: false,
        },
        Error: { id: CorrectnessId.Error,
            usable: false,
        }
    } as const;

    export const idCount = Object.keys(infosObject).length;
    const infos = Object.values(infosObject);

    export function initialise() {
        for (let id = 0; id < idCount; id++) {
            if (id !== infos[id].id) {
                throw new EnumInfoOutOfOrderError('CorrectnessId', id, id.toString());
            }
        }
    }

    export function idIsUsable(id: CorrectnessId) {
        return infos[id].usable;
    }

    export function idIsUnusable(id: CorrectnessId) {
        return !infos[id].usable;
    }

    export function idIsIncubated(id: CorrectnessId) {
        return id !== CorrectnessId.Suspect;
    }

    export function merge2Ids(id1: CorrectnessId, id2: CorrectnessId): CorrectnessId {
        switch (id1) {
            case CorrectnessId.Good:
                return id2;
            case CorrectnessId.Usable:
                return (id2 === CorrectnessId.Good || id2 === CorrectnessId.Usable) ? CorrectnessId.Usable : id2;
            case CorrectnessId.Suspect:
                return (id2 !== CorrectnessId.Error) ? CorrectnessId.Suspect : CorrectnessId.Error;
            case CorrectnessId.Error:
                return CorrectnessId.Error;
            default:
                throw new UnreachableCaseError('CM2I90092957346', id1);
        }
    }

    export function merge3Ids(id1: CorrectnessId, id2: CorrectnessId, id3: CorrectnessId): CorrectnessId {
        switch (id1) {
            case CorrectnessId.Good:
                switch (id2) {
                    case CorrectnessId.Good:
                        return id3;
                    case CorrectnessId.Usable:
                        return (id3 === CorrectnessId.Good || id3 === CorrectnessId.Usable) ? CorrectnessId.Usable : id3;
                    case CorrectnessId.Suspect:
                        return (id3 !== CorrectnessId.Error) ? CorrectnessId.Suspect : CorrectnessId.Error;
                    case CorrectnessId.Error:
                        return CorrectnessId.Error;
                    default:
                        throw new UnreachableCaseError('CM3IGDG30999885', id2);
                }
            case CorrectnessId.Usable:
                switch (id2) {
                    case CorrectnessId.Good:
                    case CorrectnessId.Usable:
                        return (id3 === CorrectnessId.Good || id3 === CorrectnessId.Usable) ? CorrectnessId.Usable : id3;
                    case CorrectnessId.Suspect:
                        return (id3 !== CorrectnessId.Error) ? CorrectnessId.Suspect : CorrectnessId.Error;
                    case CorrectnessId.Error:
                        return CorrectnessId.Error;
                    default:
                        throw new UnreachableCaseError('CM3ISDU323332395', id2);
                }
            case CorrectnessId.Suspect:
                switch (id2) {
                    case CorrectnessId.Good:
                    case CorrectnessId.Usable:
                    case CorrectnessId.Suspect:
                        return (id3 !== CorrectnessId.Error) ? CorrectnessId.Suspect : CorrectnessId.Error;
                    case CorrectnessId.Error:
                        return CorrectnessId.Error;
                    default:
                        throw new UnreachableCaseError('CM3ISDS3395345325', id2);
                }
            case CorrectnessId.Error:
                return CorrectnessId.Error;
            default:
                throw new UnreachableCaseError('CM3I1DU49900999082', id1);
        }
    }
}

export namespace CorrectnessModule {
    export function initialiseStatic(): void {
        Correctness.initialise();
    }
}
