/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from 'src/res/internal-api';
import { EnumInfoOutOfOrderError } from './internal-error';

export const enum WebsocketCloseCodeId {
    NormalClosure,
    GoingAway,
    ProtocolError,
    UnsupportedData,
    NoStatusReceived,
    AbnormalClosure,
    InvalidFramePayloadData,
    PolicyViolation,
    MessageTooBig,
    MissingExtension,
    ServerError,
    ServerRestart,
    TryAgainLater,
    BadGateway,
    TlsHandshake,
    Session,
}

export namespace WebsocketCloseCode {
    export type Id = WebsocketCloseCodeId;
    export const nullCode = -1000000001;

    interface Info {
        readonly id: Id;
        readonly code: number;
        readonly displayId: StringId;
    }

    type InfosObject = { [id in keyof typeof WebsocketCloseCodeId]: Info };

    const infosObject: InfosObject = {
        NormalClosure: { id: WebsocketCloseCodeId.NormalClosure,
            code: 1000,
            displayId: StringId.ZenithWebsocketCloseCodeId_NormalClosure,
        },
        GoingAway: { id: WebsocketCloseCodeId.GoingAway,
            code: 1001,
            displayId: StringId.ZenithWebsocketCloseCodeId_GoingAway,
        },
        ProtocolError: { id: WebsocketCloseCodeId.ProtocolError,
            code: 1002,
            displayId: StringId.ZenithWebsocketCloseCodeId_ProtocolError,
        },
        UnsupportedData: { id: WebsocketCloseCodeId.UnsupportedData,
            code: 1003,
            displayId: StringId.ZenithWebsocketCloseCodeId_UnsupportedData,
        },
        NoStatusReceived: { id: WebsocketCloseCodeId.NoStatusReceived,
            code: 1005,
            displayId: StringId.ZenithWebsocketCloseCodeId_NoStatusReceived,
        },
        AbnormalClosure: { id: WebsocketCloseCodeId.AbnormalClosure,
            code: 1006,
            displayId: StringId.ZenithWebsocketCloseCodeId_AbnormalClosure,
        },
        InvalidFramePayloadData: { id: WebsocketCloseCodeId.InvalidFramePayloadData,
            code: 1007,
            displayId: StringId.ZenithWebsocketCloseCodeId_InvalidFramePayloadData,
        },
        PolicyViolation: { id: WebsocketCloseCodeId.PolicyViolation,
            code: 1008,
            displayId: StringId.ZenithWebsocketCloseCodeId_PolicyViolation,
        },
        MessageTooBig: { id: WebsocketCloseCodeId.MessageTooBig,
            code: 1009,
            displayId: StringId.ZenithWebsocketCloseCodeId_MessageTooBig,
        },
        MissingExtension: { id: WebsocketCloseCodeId.MissingExtension,
            code: 1010,
            displayId: StringId.ZenithWebsocketCloseCodeId_MissingExtension,
        },
        ServerError: { id: WebsocketCloseCodeId.ServerError,
            code: 1011,
            displayId: StringId.ZenithWebsocketCloseCodeId_ServerError,
        },
        ServerRestart: { id: WebsocketCloseCodeId.ServerRestart,
            code: 1012,
            displayId: StringId.ZenithWebsocketCloseCodeId_ServerRestart,
        },
        TryAgainLater: { id: WebsocketCloseCodeId.TryAgainLater,
            code: 1013,
            displayId: StringId.ZenithWebsocketCloseCodeId_TryAgainLater,
        },
        BadGateway: { id: WebsocketCloseCodeId.BadGateway,
            code: 1014,
            displayId: StringId.ZenithWebsocketCloseCodeId_BadGateway,
        },
        TlsHandshake: { id: WebsocketCloseCodeId.TlsHandshake,
            code: 1015,
            displayId: StringId.ZenithWebsocketCloseCodeId_TlsHandshake,
        },
        Session: { id: WebsocketCloseCodeId.Session,
            code: 4000,
            displayId: StringId.ZenithWebsocketCloseCodeId_Session,
        },
    } as const;

    export const idCount = Object.keys(infosObject).length;
    const infos = Object.values(infosObject);

    export function initialise() {
        const outOfOrderIdx = infos.findIndex((info, id) => id !== info.id);
        if (outOfOrderIdx >= 0) {
            throw new EnumInfoOutOfOrderError('ZenithWebsocket.CloseCodeId', outOfOrderIdx, idToDisplay(outOfOrderIdx));
        }
    }

    export function tryCodeToId(code: number) {
        for (let i = 0; i < idCount; i++) {
            const info = infos[i];
            if (info.code === code) {
                return i;
            }
        }
        return undefined;
    }

    export function idToDisplayId(id: Id) {
        return infos[id].displayId;
    }

    export function idToDisplay(id: Id) {
        return Strings[idToDisplayId(id)];
    }
}

export namespace WebsocketCloseCodeModule {
    export function initialiseStatic() {
        WebsocketCloseCode.initialise();
    }
}
