/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from 'res-internal-api';
import { Correctness, CorrectnessId } from './correctness';
import { EnumInfoOutOfOrderError } from './internal-error';

export interface Badness {
    readonly reasonId: Badness.ReasonId;
    readonly reasonExtra: string;
}

export namespace Badness {
    export const enum ReasonId {
        NotBad,
        Inactive,
        Custom_Usable,
        Custom_Suspect,
        Custom_Error,
        PublisherSubscriptionError_Internal_Error,
        PublisherSubscriptionError_Offlined_Suspect,
        PublisherSubscriptionError_Offlined_Error,
        PublisherSubscriptionError_RequestTimeout_Suspect,
        PublisherSubscriptionError_RequestTimeout_Error,
        PublisherSubscriptionError_UserNotAuthorised_Error,
        PublisherSubscriptionError_PublishRequestError_Suspect,
        PublisherSubscriptionError_PublishRequestError_Error,
        PublisherSubscriptionError_SubRequestError_Suspect,
        PublisherSubscriptionError_SubRequestError_Error,
        PublisherSubscriptionError_DataError_Suspect,
        PublisherSubscriptionError_DataError_Error,
        PublisherServerWarning,
        PublisherServerError,
        PublisherSubscriptionState_NeverSubscribed,
        PublisherSubscriptionState_PublisherOnlineWaiting,
        PublisherSubscriptionState_PublisherOfflining,
        PublisherSubscriptionState_ResponseWaiting,
        PublisherSubscriptionState_SynchronisationWaiting,
        PublisherSubscriptionState_Synchronised,
        PublisherSubscriptionState_UnsubscribedSynchronised,
        PublisherSubscriptionState_Unexpected, // Should never be used
        PreUsable_Clear,
        PreUsable_Add,
        ConnectionOffline,
        FeedsWaiting,
        FeedsError,
        FeedWaiting,
        FeedError,
        FeedNotAvailable,
        NoAuthorityFeed,
        MarketsWaiting,
        MarketsError,
        MarketWaiting,
        MarketError,
        MarketNotAvailable,
        BrokerageAccountsWaiting,
        BrokerageAccountsError,
        BrokerageAccountWaiting,
        BrokerageAccountError,
        BrokerageAccountNotAvailable,
        OrderStatusesError,
        FeedStatus_Unknown,
        FeedStatus_Initialising,
        FeedStatus_Impaired,
        FeedStatus_Expired,
        Reading,
        SymbolMatching_None,
        SymbolMatching_Ambiguous,
        SymbolOkWaitingForData,
        DataRetrieving,
        MarketTradingStatesRetrieving,
        OrderStatusesFetching,
        BrokerageAccountDataListsIncubating,
        OneOrMoreAccountsInError,
        ResourceWarnings,
        ResourceErrors,
        StatusWarnings,
        StatusRetrieving,
        StatusErrors,
    }

    export function isEqual(left: Badness, right: Badness) {
        const reasonIdEqual = left.reasonId === right.reasonId;
        if (!reasonIdEqual) {
            return false;
        } else {
            if (left.reasonId === ReasonId.NotBad) {
                return true; // if good, then reasonExtra and error do not matter
            } else {
                return left.reasonExtra === right.reasonExtra;
            }
        }
    }

    export function createCopy(badness: Badness): Badness {
        return {
            reasonId: badness.reasonId,
            reasonExtra: badness.reasonExtra,
        } as const;
    }

    export function getCorrectnessId(badness: Badness) {
        return Reason.idToCorrectnessId(badness.reasonId);
    }

    export function isGood(badness: Badness) {
        return badness.reasonId === ReasonId.NotBad;
    }

    export function isUsable(badness: Badness) {
        const correctnessId = Reason.idToCorrectnessId(badness.reasonId);
        return Correctness.idIsUsable(correctnessId);
    }

    export function isUnusable(badness: Badness) {
        const correctnessId = Reason.idToCorrectnessId(badness.reasonId);
        return Correctness.idIsUnusable(correctnessId);
    }

    export function isSuspect(badness: Badness) {
        const correctnessId = Reason.idToCorrectnessId(badness.reasonId);
        return correctnessId === CorrectnessId.Suspect;
    }

    export function isError(badness: Badness) {
        const correctnessId = Reason.idToCorrectnessId(badness.reasonId);
        return correctnessId === CorrectnessId.Error;
    }

    export function generateText(badness: Badness) {
        let result = Badness.Reason.idToDisplay(badness.reasonId);
        const extra = badness.reasonExtra;
        if (extra !== '') {
            if (extra.startsWith(result)) {
                result = extra;
            } else {
                result += ': ' + extra;
            }
        }
        return result;
    }

    export const notBad: Badness = {
        reasonId: ReasonId.NotBad,
        reasonExtra: '',
    } as const;

    export const inactive: Badness = {
        reasonId: ReasonId.Inactive,
        reasonExtra: '',
    } as const;

    export const preUsableClear: Badness = {
        reasonId: ReasonId.PreUsable_Clear,
        reasonExtra: '',
    } as const;

    export const preUsableAdd: Badness = {
        reasonId: ReasonId.PreUsable_Add,
        reasonExtra: '',
    } as const;

    export namespace Reason {
        export const nullId = -1; // Inactive is not really null.  Just used as placeholder.

        interface Info {
            readonly id: ReasonId;
            readonly correctnessId: CorrectnessId;
            readonly displayId: StringId;
        }

        type InfosObject = { [id in keyof typeof ReasonId]: Info };

        const infosObject: InfosObject = {
            NotBad: {
                id: ReasonId.NotBad,
                correctnessId: CorrectnessId.Good,
                displayId: StringId.BadnessReasonId_NotBad,
            },
            Inactive: {
                id: ReasonId.Inactive,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_Inactive,
            },
            Custom_Usable: {
                id: ReasonId.Custom_Usable,
                correctnessId: CorrectnessId.Usable,
                displayId: StringId.Blank,
            },
            Custom_Suspect: {
                id: ReasonId.Custom_Suspect,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.Blank,
            },
            Custom_Error: {
                id: ReasonId.Custom_Error,
                correctnessId: CorrectnessId.Error,
                displayId: StringId.Blank,
            },

            PublisherSubscriptionError_Internal_Error: {
                id: ReasonId.PublisherSubscriptionError_Internal_Error,
                correctnessId: CorrectnessId.Error,
                displayId: StringId.BadnessReasonId_PublisherSubscriptionError_Internal_Error,
            },
            PublisherSubscriptionError_Offlined_Suspect: {
                id: ReasonId.PublisherSubscriptionError_Offlined_Suspect,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_PublisherSubscriptionError_Offlined_Suspect,
            },
            PublisherSubscriptionError_Offlined_Error: {
                id: ReasonId.PublisherSubscriptionError_Offlined_Error,
                correctnessId: CorrectnessId.Error,
                displayId: StringId.BadnessReasonId_PublisherSubscriptionError_Offlined_Error,
            },
            PublisherSubscriptionError_RequestTimeout_Suspect: {
                id: ReasonId.PublisherSubscriptionError_RequestTimeout_Suspect,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_PublisherSubscriptionError_Timeout_Suspect,
            },
            PublisherSubscriptionError_RequestTimeout_Error: {
                id: ReasonId.PublisherSubscriptionError_RequestTimeout_Error,
                correctnessId: CorrectnessId.Error,
                displayId: StringId.BadnessReasonId_PublisherSubscriptionError_Timeout_Error,
            },
            PublisherSubscriptionError_UserNotAuthorised_Error: {
                id: ReasonId.PublisherSubscriptionError_UserNotAuthorised_Error,
                correctnessId: CorrectnessId.Error,
                displayId: StringId.BadnessReasonId_PublisherSubscriptionError_UserNotAuthorised_Error,
            },
            PublisherSubscriptionError_PublishRequestError_Suspect: {
                id: ReasonId.PublisherSubscriptionError_PublishRequestError_Suspect,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_PublisherSubscriptionError_PublishRequestError_Suspect,
            },
            PublisherSubscriptionError_PublishRequestError_Error: {
                id: ReasonId.PublisherSubscriptionError_PublishRequestError_Error,
                correctnessId: CorrectnessId.Error,
                displayId: StringId.BadnessReasonId_PublisherSubscriptionError_PublishRequestError_Error,
            },
            PublisherSubscriptionError_SubRequestError_Suspect: {
                id: ReasonId.PublisherSubscriptionError_SubRequestError_Suspect,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_PublisherSubscriptionError_SubRequestError_Suspect,
            },
            PublisherSubscriptionError_SubRequestError_Error: {
                id: ReasonId.PublisherSubscriptionError_SubRequestError_Error,
                correctnessId: CorrectnessId.Error,
                displayId: StringId.BadnessReasonId_PublisherSubscriptionError_SubRequestError_Error,
            },
            PublisherSubscriptionError_DataError_Suspect: {
                id: ReasonId.PublisherSubscriptionError_DataError_Suspect,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_PublisherSubscriptionError_DataError_Suspect,
            },
            PublisherSubscriptionError_DataError_Error: {
                id: ReasonId.PublisherSubscriptionError_DataError_Error,
                correctnessId: CorrectnessId.Error,
                displayId: StringId.BadnessReasonId_PublisherSubscriptionError_DataError_Error,
            },
            PublisherServerWarning: {
                id: ReasonId.PublisherServerWarning,
                correctnessId: CorrectnessId.Usable,
                displayId: StringId.BadnessReasonId_PublisherServerWarning,
            },
            PublisherServerError: {
                id: ReasonId.PublisherServerError,
                correctnessId: CorrectnessId.Error,
                displayId: StringId.BadnessReasonId_PublisherServerError,
            },
            PublisherSubscriptionState_NeverSubscribed: {
                id: ReasonId.PublisherSubscriptionState_NeverSubscribed,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_PublisherSubscription_NeverSubscribed,
            },
            PublisherSubscriptionState_PublisherOnlineWaiting: {
                id: ReasonId.PublisherSubscriptionState_PublisherOnlineWaiting,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_PublisherSubscription_PublisherOnlineWaiting,
            },
            PublisherSubscriptionState_PublisherOfflining: {
                id: ReasonId.PublisherSubscriptionState_PublisherOfflining,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_PublisherSubscription_PublisherOfflining,
            },
            PublisherSubscriptionState_ResponseWaiting: {
                id: ReasonId.PublisherSubscriptionState_ResponseWaiting,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_PublisherSubscription_ResponseWaiting,
            },
            PublisherSubscriptionState_SynchronisationWaiting: {
                id: ReasonId.PublisherSubscriptionState_SynchronisationWaiting,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_PublisherSubscription_SynchronisationWaiting,
            },
            PublisherSubscriptionState_Synchronised: {
                id: ReasonId.PublisherSubscriptionState_Synchronised,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_PublisherSubscription_Synchronised,
            },
            PublisherSubscriptionState_UnsubscribedSynchronised: {
                id: ReasonId.PublisherSubscriptionState_UnsubscribedSynchronised,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_PublisherSubscription_UnsubscribedSynchronised,
            },
            PublisherSubscriptionState_Unexpected: {
                id: ReasonId.PublisherSubscriptionState_Unexpected,
                correctnessId: CorrectnessId.Error,
                displayId: StringId.InternalError,
            },
            PreUsable_Clear: {
                id: ReasonId.PreUsable_Clear,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_PreGood_Clear,
            },
            PreUsable_Add: {
                id: ReasonId.PreUsable_Add,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_PreGood_Add,
            },
            ConnectionOffline: {
                id: ReasonId.ConnectionOffline,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_ConnectionOffline,
            },
            FeedsWaiting: {
                id: ReasonId.FeedsWaiting,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_FeedsWaiting,
            },
            FeedsError: {
                id: ReasonId.FeedsError,
                correctnessId: CorrectnessId.Error,
                displayId: StringId.BadnessReasonId_FeedsError,
            },
            FeedWaiting: {
                id: ReasonId.FeedWaiting,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_FeedWaiting,
            },
            FeedError: {
                id: ReasonId.FeedError,
                correctnessId: CorrectnessId.Error,
                displayId: StringId.BadnessReasonId_FeedError,
            },
            FeedNotAvailable: {
                id: ReasonId.FeedNotAvailable,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_FeedNotAvailable,
            },
            NoAuthorityFeed: {
                id: ReasonId.NoAuthorityFeed,
                correctnessId: CorrectnessId.Error,
                displayId: StringId.BadnessReasonId_NoAuthorityFeed,
            },
            MarketsWaiting: {
                id: ReasonId.MarketsWaiting,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_MarketsWaiting,
            },
            MarketsError: {
                id: ReasonId.MarketsError,
                correctnessId: CorrectnessId.Error,
                displayId: StringId.BadnessReasonId_MarketsError,
            },
            MarketWaiting: {
                id: ReasonId.MarketWaiting,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_MarketWaiting,
            },
            MarketError: {
                id: ReasonId.MarketError,
                correctnessId: CorrectnessId.Error,
                displayId: StringId.BadnessReasonId_MarketError,
            },
            MarketNotAvailable: {
                id: ReasonId.MarketNotAvailable,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_MarketNotAvailable,
            },
            BrokerageAccountsWaiting: {
                id: ReasonId.BrokerageAccountsWaiting,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_BrokerageAccountsWaiting,
            },
            BrokerageAccountsError: {
                id: ReasonId.BrokerageAccountsError,
                correctnessId: CorrectnessId.Error,
                displayId: StringId.BadnessReasonId_BrokerageAccountsError,
            },
            BrokerageAccountWaiting: {
                id: ReasonId.BrokerageAccountWaiting,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_BrokerageAccountWaiting,
            },
            BrokerageAccountError: {
                id: ReasonId.BrokerageAccountError,
                correctnessId: CorrectnessId.Error,
                displayId: StringId.BadnessReasonId_BrokerageAccountError,
            },
            BrokerageAccountNotAvailable: {
                id: ReasonId.BrokerageAccountNotAvailable,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_BrokerageAccountNotAvailable,
            },
            OrderStatusesError: {
                id: ReasonId.OrderStatusesError,
                correctnessId: CorrectnessId.Error,
                displayId: StringId.BadnessReasonId_OrderStatusesError,
            },
            FeedStatus_Unknown: {
                id: ReasonId.FeedStatus_Unknown,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_FeedStatus_Unknown,
            },
            FeedStatus_Initialising: {
                id: ReasonId.FeedStatus_Initialising,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_FeedStatus_Initialising,
            },
            FeedStatus_Impaired: {
                id: ReasonId.FeedStatus_Impaired,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_FeedStatus_Impaired,
            },
            FeedStatus_Expired: {
                id: ReasonId.FeedStatus_Expired,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_FeedStatus_Expired,
            },
            Reading: {
                id: ReasonId.Reading,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_Reading,
            },
            SymbolMatching_None: {
                id: ReasonId.SymbolMatching_None,
                correctnessId: CorrectnessId.Error,
                displayId: StringId.BadnessReasonId_SymbolMatching_None,
            },
            SymbolMatching_Ambiguous: {
                id: ReasonId.SymbolMatching_Ambiguous,
                correctnessId: CorrectnessId.Error,
                displayId: StringId.BadnessReasonId_SymbolMatching_Ambiguous,
            },
            SymbolOkWaitingForData: {
                id: ReasonId.SymbolOkWaitingForData,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_SymbolOkWaitingForData,
            },
            DataRetrieving: {
                id: ReasonId.DataRetrieving,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_DataRetrieving,
            },
            MarketTradingStatesRetrieving: {
                id: ReasonId.MarketTradingStatesRetrieving,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_MarketTradingStatesRetrieving,
            },
            OrderStatusesFetching: {
                id: ReasonId.OrderStatusesFetching,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_OrderStatusesFetching,
            },
            BrokerageAccountDataListsIncubating: {
                id: ReasonId.BrokerageAccountDataListsIncubating,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_BrokerageAccountDataListsIncubating,
            },
            OneOrMoreAccountsInError: {
                id: ReasonId.OneOrMoreAccountsInError,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_OneOrMoreAccountsInError,
            },
            ResourceWarnings: {
                id: ReasonId.ResourceWarnings,
                correctnessId: CorrectnessId.Usable,
                displayId: StringId.BadnessReasonId_ResourceWarnings,
            },
            ResourceErrors: {
                id: ReasonId.ResourceErrors,
                correctnessId: CorrectnessId.Error,
                displayId: StringId.BadnessReasonId_ResourceErrors,
            },
            StatusWarnings: {
                id: ReasonId.StatusWarnings,
                correctnessId: CorrectnessId.Usable,
                displayId: StringId.BadnessReasonId_StatusWarnings,
            },
            StatusRetrieving: {
                id: ReasonId.StatusRetrieving,
                correctnessId: CorrectnessId.Suspect,
                displayId: StringId.BadnessReasonId_StatusRetrieving,
            },
            StatusErrors: {
                id: ReasonId.StatusErrors,
                correctnessId: CorrectnessId.Error,
                displayId: StringId.BadnessReasonId_StatusErrors,
            },

        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            for (let id = 0; id < idCount; id++) {
                if (id !== infos[id].id) {
                    throw new EnumInfoOutOfOrderError('Badness.ReasonId', id, idToDisplay(id));
                }
            }
        }

        export function idToCorrectnessId(id: ReasonId) {
            return infos[id].correctnessId;
        }

        export function idToDisplayId(id: ReasonId) {
            return infos[id].displayId;
        }

        export function idToDisplay(id: ReasonId) {
            return Strings[idToDisplayId(id)];
        }
    }
}

export namespace BadnessModule {
    export function initialiseStatic(): void {
        Badness.Reason.initialise();
    }
}
