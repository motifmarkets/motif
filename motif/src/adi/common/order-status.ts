/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from 'res-internal-api';
import { EnumInfoOutOfOrderError, Integer } from 'sys-internal-api';
import { ExchangeEnvironmentId, ExchangeId } from './data-types';

export interface OrderStatus {
    code: string;
    exchangeId: ExchangeId | undefined;
    environmentId: ExchangeEnvironmentId | undefined;
    allowIds: OrderStatus.AllowIds;
    reasonIds: OrderStatus.ReasonIds;
}
export type OrderStatuses = readonly OrderStatus[];

export namespace OrderStatus {
    export const enum AllowId {
        Trade,  // The order can potentially match in this state.
        Amend,  // The order can be amended.
        Cancel, // The order can be cancelled.
        Move, // The order can be moved
    }
    export type AllowIds = readonly OrderStatus.AllowId[];

    // Orders can be in various states. Zenith provides reasons for orders to be in their current state.
    export const enum ReasonId {
        Unknown,   // The reason is unknown.
        Normal,    // State is a normal part of the order life-cycle.
        Manual,    // State was initiated manually.
        Abnormal,  // State is abnormal indicating a fault or other issue.
        Waiting,   // State is due to a temporary wait.
        Completed, // State represents a completed order.
    }
    export type ReasonIds = readonly OrderStatus.ReasonId[];

    export namespace Allow {
        export type Id = AllowId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly displayId: StringId;
        }

        type InfosObject = { [id in keyof typeof AllowId]: Info };

        const infosObject: InfosObject = {
            Trade: {
                id: AllowId.Trade,
                name: 'Trade',
                displayId: StringId.OrderStatusAllowDisplay_Trade,
            },
            Amend: {
                id: AllowId.Amend,
                name: 'Amend',
                displayId: StringId.OrderStatusAllowDisplay_Amend,
            },
            Cancel: {
                id: AllowId.Cancel,
                name: 'Cancel',
                displayId: StringId.OrderStatusAllowDisplay_Cancel,
            },
            Move: {
                id: AllowId.Move,
                name: 'Move',
                displayId: StringId.OrderStatusAllowDisplay_Move,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;

        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('OrderStatus.AllowId', outOfOrderIdx, infos[outOfOrderIdx].name);
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
                displayId: StringId.OrderStatusReasonDisplay_Unknown,
            },
            Normal: {
                id: ReasonId.Normal,
                name: 'Normal',
                displayId: StringId.OrderStatusReasonDisplay_Normal,
            },
            Manual: {
                id: ReasonId.Manual,
                name: 'Manual',
                displayId: StringId.OrderStatusReasonDisplay_Manual,
            },
            Abnormal: {
                id: ReasonId.Abnormal,
                name: 'Abnormal',
                displayId: StringId.OrderStatusReasonDisplay_Abnormal,
            },
            Waiting: {
                id: ReasonId.Waiting,
                name: 'Waiting',
                displayId: StringId.OrderStatusReasonDisplay_Waiting,
            },
            Completed: {
                id: ReasonId.Completed,
                name: 'Completed',
                displayId: StringId.OrderStatusReason_Completed,
            },
        };

        export const idCount = Object.keys(infosObject).length;

        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('OrderStatusReasonId', outOfOrderIdx, infos[outOfOrderIdx].name);
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

export namespace OrderStatuses {
    export function find(statuses: OrderStatuses, code: string) {
        for (let i = 0; i < statuses.length; i++) {
            const status = statuses[i];
            if (status.code === code) {
                return status;
            }
        }

        return undefined;
    }
}

export namespace OrderStatusModule {
    export function initialiseStatic() {
        OrderStatus.Allow.initialise();
        OrderStatus.Reason.initialise();
    }
}
