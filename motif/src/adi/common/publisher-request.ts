/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { SysTick } from 'src/sys/internal-api';
import { PublisherSubscription } from './publisher-subscription';

export interface PublisherRequest {
    readonly typeId: PublisherRequest.TypeId;
    readonly subscription: PublisherSubscription;
    responseTimeoutSpan: SysTick.Span;
    responseTimeoutTime: SysTick.Time;
}

export namespace PublisherRequest {
    export const enum TypeId {
        SubscribeQuery,
        Unsubscribe
    }

    const invalidTransactionId = 0;
    let nextTransactionId = invalidTransactionId + 1;

    export function getNextTransactionId() {
        return nextTransactionId++;
    }

    export function compareResponseTimeoutTime(left: PublisherRequest, right: PublisherRequest) {
        return SysTick.compare(left.responseTimeoutTime, right.responseTimeoutTime);
    }
}
