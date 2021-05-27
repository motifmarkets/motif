/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer } from './types';

export class MultiEvent<T> {
    private handlers: T[] = [];
    private subscriptionIds: MultiEvent.DefinedSubscriptionId[] = [];

    public subscribe(handler: T): MultiEvent.DefinedSubscriptionId {
        const id = MultiEvent.getNextSubscriptionId();
        return this.subscribeWithId(handler, id);
    }

    public subscribeWithId(handler: T, id: MultiEvent.DefinedSubscriptionId): MultiEvent.DefinedSubscriptionId {
        this.handlers.push(handler);
        this.subscriptionIds.push(id);
        return id;
    }

    public unsubscribe(id: MultiEvent.SubscriptionId) {
        if (id !== undefined) {
            const eventIndex = this.findIndexBySubscriptionId(id);

            if (eventIndex !== -1) {
                this.handlers.splice(eventIndex, 1);
                this.subscriptionIds.splice(eventIndex, 1);
            }
        }
    }

    public copyHandlers(): T[] {
        return this.handlers.slice();
    }

    public get count(): number {
        return this.handlers.length;
    }

    private findIndexBySubscriptionId(uid: MultiEvent.DefinedSubscriptionId): Integer {
        for (let index = 0; index < this.subscriptionIds.length; index++) {
            if (uid === this.subscriptionIds[index]) {
                return index;
            }
        }
        return -1;
    }
}

export namespace MultiEvent {
    export type DefinedSubscriptionId = number;
    export type SubscriptionId = DefinedSubscriptionId | undefined;

    let nextSubscriptionId: DefinedSubscriptionId = 1;

    export function getNextSubscriptionId(): DefinedSubscriptionId {
        return nextSubscriptionId++;
    }
}



export class NotifyMultiEvent extends MultiEvent<() => void> {
    trigger(): void {
        const handlers = this.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i]();
        }
    }
}

export namespace NotifyMultiEvent {
    export type EventHandler = (this: void) => void;
}
