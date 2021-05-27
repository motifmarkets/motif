/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from 'src/res/internal-api';
import { EnumInfoOutOfOrderError, Integer } from 'src/sys/internal-api';

export interface TradingState {
    name: string;
    allowIds: TradingState.AllowIds;
    reasonId: TradingState.ReasonId;
}
export type TradingStates = readonly TradingState[];

export namespace TradingState {
    export const enum AllowId {
        OrderPlace,   // Orders may be placed
        OrderAmend,   // Orders may be amended.
        OrderCancel,  // Orders may be cancelled.
        OrderMove,    // Orders may be moved.
        Match,        // Orders will be automatically matched and Trades occur.
        ReportCancel, // Trades may be reported or cancelled.
    }
    export type AllowIds = readonly TradingState.AllowId[];

    export const enum ReasonId {
        Unknown,     // The reason is unknown.
        Normal,      // State is a normal part of the order life-cycle.
        Suspend,     // This state represents a suspension.
        TradingHalt, // This state represents a temporary trading halt.
        NewsRelease, // This state represents a pending news release.
    }

    export namespace Allow {
        export type Id = AllowId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly displayId: StringId;
        }

        type InfosObject = { [id in keyof typeof AllowId]: Info };

        const infosObject: InfosObject = {
            OrderPlace: {
                id: AllowId.OrderPlace,
                name: 'OrderPlace',
                displayId: StringId.TradingStateAllowDisplay_OrderPlace,
            },
            OrderAmend: {
                id: AllowId.OrderAmend,
                name: 'OrderAmend',
                displayId: StringId.TradingStateAllowDisplay_OrderAmend,
            },
            OrderCancel: {
                id: AllowId.OrderCancel,
                name: 'OrderCancel',
                displayId: StringId.TradingStateAllowDisplay_OrderCancel,
            },
            OrderMove: {
                id: AllowId.OrderMove,
                name: 'OrderMove',
                displayId: StringId.TradingStateAllowDisplay_OrderMove,
            },
            Match: {
                id: AllowId.Match,
                name: 'Match',
                displayId: StringId.TradingStateAllowDisplay_Match,
            },
            ReportCancel: {
                id: AllowId.ReportCancel,
                name: 'ReportCancel',
                displayId: StringId.TradingStateAllowDisplay_ReportCancel,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;

        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('TradingState.AllowId', outOfOrderIdx, infos[outOfOrderIdx].name);
            }
        }

        export function idToDisplayId(id: Id): StringId {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id): string {
            return Strings[idToDisplayId(id)];
        }
    }

    export namespace Reason {
        export type Id = ReasonId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly displayId: StringId;
        }

        type InfosObject = { [id in keyof typeof ReasonId]: Info };

        const infosObject: InfosObject = {
            Unknown: {
                id: ReasonId.Unknown,
                name: 'Unknown',
                displayId: StringId.TradingStateReasonDisplay_Unknown,
            },
            Normal: {
                id: ReasonId.Normal,
                name: 'Normal',
                displayId: StringId.TradingStateReasonDisplay_Normal,
            },
            Suspend: {
                id: ReasonId.Suspend,
                name: 'Suspend',
                displayId: StringId.TradingStateReasonDisplay_Suspend,
            },
            TradingHalt: {
                id: ReasonId.TradingHalt,
                name: 'TradingHalt',
                displayId: StringId.TradingStateReasonDisplay_TradingHalt,
            },
            NewsRelease: {
                id: ReasonId.NewsRelease,
                name: 'NewsRelease',
                displayId: StringId.TradingStateReasonDisplay_NewsRelease,
            },
        };

        export const idCount = Object.keys(infosObject).length;

        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('TradingStateReasonId', outOfOrderIdx, infos[outOfOrderIdx].name);
            }
        }

        export function idToDisplayId(id: Id): StringId {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id): string {
            return Strings[idToDisplayId(id)];
        }
    }
}

export namespace TradingStates {
    export function find(states: TradingStates, name: string) {
        for (let i = 0; i < states.length; i++) {
            const status = states[i];
            if (status.name === name) {
                return status;
            }
        }

        return undefined;
    }
}

export namespace TradingStateModule {
    export function initialiseStatic() {
        TradingState.Allow.initialise();
        TradingState.Reason.initialise();
    }
}
