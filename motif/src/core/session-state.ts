/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from 'src/res/internal-api';
import { EnumInfoOutOfOrderError } from 'src/sys/internal-api';

export const enum SessionStateId {
    NotStarted,
    Starting,
    Online,
    Offline,
    Finalising,
    Finalised,
}

export namespace SessionState {
    export type Id = SessionStateId;

    interface Info {
        readonly id: Id;
        readonly displayId: StringId;
    }

    type InfosObject = { [id in keyof typeof SessionStateId]: Info };

    const infosObject: InfosObject = {
        NotStarted: {
            id: SessionStateId.NotStarted,
            displayId: StringId.SessionManagerStateDisplay_NotStarted,
        },
        Starting: {
            id: SessionStateId.Starting,
            displayId: StringId.SessionManagerStateDisplay_Starting,
        },
        Online: {
            id: SessionStateId.Online,
            displayId: StringId.SessionManagerStateDisplay_Online,
        },
        Offline: {
            id: SessionStateId.Offline,
            displayId: StringId.SessionManagerStateDisplay_Offline,
        },
        Finalising: {
            id: SessionStateId.Finalising,
            displayId: StringId.SessionManagerStateDisplay_Finalising,
        },
        Finalised: {
            id: SessionStateId.Finalised,
            displayId: StringId.SessionManagerStateDisplay_Finalised,
        },
    };

    export const idCount = Object.keys(infosObject).length;

    const infos = Object.values(infosObject);

    export function initialise() {
        for (let i = 0; i < infos.length; i++) {
            if (infos[i].id !== i) {
                throw new EnumInfoOutOfOrderError('SessionManager.StateId', i, Strings[infos[i].displayId]);
            }
        }
    }

    export function idToDisplayId(id: Id): StringId {
        return infos[id].displayId;
    }

    export function idToDisplay(id: Id): string {
        return Strings[idToDisplayId(id)];
    }
}
