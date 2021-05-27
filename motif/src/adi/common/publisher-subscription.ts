/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MapKey, UnreachableCaseError } from 'src/sys/internal-api';
import { PublisherSubscriptionDataDefinition } from './data-definition';

export interface PublisherSubscription {
    stateId: PublisherSubscription.StateId;

    readonly dataItemId: number;
    readonly dataDefinition: PublisherSubscriptionDataDefinition;
    dataItemRequestNr: number;

    // Safeguard to ensure some subscriptions are only sent once
    readonly resendAllowed: boolean;

    activeMessageMapKey: MapKey;
    beenSentAtLeastOnce: boolean; // used in conjunction with resendAllowed Safeguard to prevent resend of some subscriptions
    unsubscribeRequired: boolean;
}

export namespace PublisherSubscription {
    export const enum StateId {
        Inactive,
        HighPrioritySendQueued,
        NormalSendQueued,
        ResponseWaiting,
        Subscribed, // Response received. More responses might be received yet.
    }

    export namespace State {
        export function idIsSendQueued(id: StateId) {
            switch (id) {
                case StateId.HighPrioritySendQueued:
                case StateId.NormalSendQueued:
                    return true;
                case StateId.Inactive:
                case StateId.ResponseWaiting:
                case StateId.Subscribed:
                    return false;
                default:
                    throw new UnreachableCaseError('FSSSIISQ100048454', id);
            }
        }
        export function idIsRequestSent(id: StateId) {
            switch (id) {
                case StateId.Inactive:
                case StateId.HighPrioritySendQueued:
                case StateId.NormalSendQueued:
                    return false;
                case StateId.ResponseWaiting:
                case StateId.Subscribed:
                    return true;
                default:
                    throw new UnreachableCaseError('FSSSIISQ100048454', id);
            }
        }
    }

    export const enum RequestSendPriorityId {
        High,
        Normal,
    }

    export const enum AllowedRetryTypeId {
        Never,
        Delay,
        SubscribabilityIncrease,
    }

    export const enum ErrorTypeId {
        Internal,
        Offlined,
        RequestTimeout,
        UserNotAuthorised,
        PublishRequestError,
        SubRequestError,
        DataError,
    }
}
