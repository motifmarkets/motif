/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness, UnreachableCaseError } from '@motifmarkets/motif-core';
import { ApiError as ApiErrorApi, Badness as BadnessApi } from '../../../api/extension-api';
import { UnreachableCaseApiErrorImplementation } from './api-error-api-implementation';

export class BadnessImplementation implements BadnessApi {
    constructor(private readonly _actual: Badness) { }

    get actual() { return this._actual; }

    get reason() { return BadnessImplementation.ReasonId.toApi(this._actual.reasonId); }
    get reasonExtra() { return this._actual.reasonExtra; }
}

export namespace BadnessImplementation {

    export namespace ReasonId {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function toApi(value: Badness.ReasonId): BadnessApi.Reason {
            switch (value) {
                case Badness.ReasonId.NotBad: return BadnessApi.ReasonEnum.NotBad;
                case Badness.ReasonId.Inactive: return BadnessApi.ReasonEnum.Inactive;
                case Badness.ReasonId.Custom_Usable: return BadnessApi.ReasonEnum.Custom_Usable;
                case Badness.ReasonId.Custom_Suspect: return BadnessApi.ReasonEnum.Custom_Suspect;
                case Badness.ReasonId.Custom_Error: return BadnessApi.ReasonEnum.Custom_Error;
                case Badness.ReasonId.PublisherSubscriptionError_Internal_Error:
                    return BadnessApi.ReasonEnum.PublisherSubscriptionError_Internal_Error;
                case Badness.ReasonId.PublisherSubscriptionError_Offlined_Suspect:
                    return BadnessApi.ReasonEnum.PublisherSubscriptionError_Offlined_Suspect;
                case Badness.ReasonId.PublisherSubscriptionError_Offlined_Error:
                    return BadnessApi.ReasonEnum.PublisherSubscriptionError_Offlined_Error;
                case Badness.ReasonId.PublisherSubscriptionError_RequestTimeout_Suspect:
                    return BadnessApi.ReasonEnum.PublisherSubscriptionError_RequestTimeout_Suspect;
                case Badness.ReasonId.PublisherSubscriptionError_RequestTimeout_Error:
                    return BadnessApi.ReasonEnum.PublisherSubscriptionError_RequestTimeout_Error;
                case Badness.ReasonId.PublisherSubscriptionError_UserNotAuthorised_Error:
                    return BadnessApi.ReasonEnum.PublisherSubscriptionError_UserNotAuthorised_Error;
                case Badness.ReasonId.PublisherSubscriptionError_PublishRequestError_Suspect:
                    return BadnessApi.ReasonEnum.PublisherSubscriptionError_PublishRequestError_Suspect;
                case Badness.ReasonId.PublisherSubscriptionError_PublishRequestError_Error:
                    return BadnessApi.ReasonEnum.PublisherSubscriptionError_PublishRequestError_Error;
                case Badness.ReasonId.PublisherSubscriptionError_SubRequestError_Suspect:
                    return BadnessApi.ReasonEnum.PublisherSubscriptionError_SubRequestError_Suspect;
                case Badness.ReasonId.PublisherSubscriptionError_SubRequestError_Error:
                    return BadnessApi.ReasonEnum.PublisherSubscriptionError_SubRequestError_Error;
                case Badness.ReasonId.PublisherSubscriptionError_DataError_Suspect:
                    return BadnessApi.ReasonEnum.PublisherSubscriptionError_DataError_Suspect;
                case Badness.ReasonId.PublisherSubscriptionError_DataError_Error:
                    return BadnessApi.ReasonEnum.PublisherSubscriptionError_DataError_Error;
                case Badness.ReasonId.PublisherServerWarning: return BadnessApi.ReasonEnum.PublisherServerWarning;
                case Badness.ReasonId.PublisherServerError: return BadnessApi.ReasonEnum.PublisherServerError;
                case Badness.ReasonId.PublisherSubscriptionState_NeverSubscribed:
                    return BadnessApi.ReasonEnum.PublisherSubscriptionState_NeverSubscribed;
                case Badness.ReasonId.PublisherSubscriptionState_PublisherOnlineWaiting:
                    return BadnessApi.ReasonEnum.PublisherSubscriptionState_PublisherOnlineWaiting;
                case Badness.ReasonId.PublisherSubscriptionState_PublisherOfflining:
                    return BadnessApi.ReasonEnum.PublisherSubscriptionState_PublisherOfflining;
                case Badness.ReasonId.PublisherSubscriptionState_ResponseWaiting:
                    return BadnessApi.ReasonEnum.PublisherSubscriptionState_ResponseWaiting;
                case Badness.ReasonId.PublisherSubscriptionState_SynchronisationWaiting:
                    return BadnessApi.ReasonEnum.PublisherSubscriptionState_SynchronisationWaiting;
                case Badness.ReasonId.PublisherSubscriptionState_Synchronised:
                    return BadnessApi.ReasonEnum.PublisherSubscriptionState_Synchronised;
                case Badness.ReasonId.PublisherSubscriptionState_UnsubscribedSynchronised:
                    return BadnessApi.ReasonEnum.PublisherSubscriptionState_UnsubscribedSynchronised;
                case Badness.ReasonId.PublisherSubscriptionState_Unexpected:
                    return BadnessApi.ReasonEnum.PublisherSubscriptionState_Unexpected;
                case Badness.ReasonId.PreUsable_Clear: return BadnessApi.ReasonEnum.PreUsable_Clear;
                case Badness.ReasonId.PreUsable_Add: return BadnessApi.ReasonEnum.PreUsable_Add;
                case Badness.ReasonId.ConnectionOffline: return BadnessApi.ReasonEnum.ConnectionOffline;
                case Badness.ReasonId.FeedsWaiting: return BadnessApi.ReasonEnum.FeedsWaiting;
                case Badness.ReasonId.FeedsError: return BadnessApi.ReasonEnum.FeedsError;
                case Badness.ReasonId.FeedWaiting: return BadnessApi.ReasonEnum.FeedWaiting;
                case Badness.ReasonId.FeedError: return BadnessApi.ReasonEnum.FeedError;
                case Badness.ReasonId.FeedNotAvailable: return BadnessApi.ReasonEnum.FeedNotAvailable;
                case Badness.ReasonId.NoAuthorityFeed: return BadnessApi.ReasonEnum.NoAuthorityFeed;
                case Badness.ReasonId.MarketsWaiting: return BadnessApi.ReasonEnum.MarketsWaiting;
                case Badness.ReasonId.MarketsError: return BadnessApi.ReasonEnum.MarketsError;
                case Badness.ReasonId.MarketWaiting: return BadnessApi.ReasonEnum.MarketWaiting;
                case Badness.ReasonId.MarketError: return BadnessApi.ReasonEnum.MarketError;
                case Badness.ReasonId.MarketNotAvailable: return BadnessApi.ReasonEnum.MarketNotAvailable;
                case Badness.ReasonId.BrokerageAccountsWaiting: return BadnessApi.ReasonEnum.BrokerageAccountsWaiting;
                case Badness.ReasonId.BrokerageAccountsError: return BadnessApi.ReasonEnum.BrokerageAccountsError;
                case Badness.ReasonId.BrokerageAccountWaiting: return BadnessApi.ReasonEnum.BrokerageAccountWaiting;
                case Badness.ReasonId.BrokerageAccountError: return BadnessApi.ReasonEnum.BrokerageAccountError;
                case Badness.ReasonId.BrokerageAccountNotAvailable: return BadnessApi.ReasonEnum.BrokerageAccountNotAvailable;
                case Badness.ReasonId.OrderStatusesError: return BadnessApi.ReasonEnum.OrderStatusesError;
                case Badness.ReasonId.FeedStatus_Unknown: return BadnessApi.ReasonEnum.FeedStatus_Unknown;
                case Badness.ReasonId.FeedStatus_Initialising: return BadnessApi.ReasonEnum.FeedStatus_Initialising;
                case Badness.ReasonId.FeedStatus_Impaired: return BadnessApi.ReasonEnum.FeedStatus_Impaired;
                case Badness.ReasonId.FeedStatus_Expired: return BadnessApi.ReasonEnum.FeedStatus_Expired;
                case Badness.ReasonId.Reading: return BadnessApi.ReasonEnum.Reading;
                case Badness.ReasonId.SymbolMatching_None: return BadnessApi.ReasonEnum.SymbolMatching_None;
                case Badness.ReasonId.SymbolMatching_Ambiguous: return BadnessApi.ReasonEnum.SymbolMatching_Ambiguous;
                case Badness.ReasonId.SymbolOkWaitingForData: return BadnessApi.ReasonEnum.SymbolOkWaitingForData;
                case Badness.ReasonId.DataRetrieving: return BadnessApi.ReasonEnum.DataRetrieving;
                case Badness.ReasonId.MarketTradingStatesRetrieving: return BadnessApi.ReasonEnum.MarketTradingStatesRetrieving;
                case Badness.ReasonId.OrderStatusesFetching: return BadnessApi.ReasonEnum.OrderStatusesFetching;
                case Badness.ReasonId.BrokerageAccountDataListsIncubating: return BadnessApi.ReasonEnum.BrokerageAccountDataListsIncubating;
                case Badness.ReasonId.OneOrMoreAccountsInError: return BadnessApi.ReasonEnum.OneOrMoreAccountsInError;
                case Badness.ReasonId.ResourceWarnings: return BadnessApi.ReasonEnum.ResourceWarnings;
                case Badness.ReasonId.ResourceErrors: return BadnessApi.ReasonEnum.ResourceErrors;
                case Badness.ReasonId.StatusWarnings: return BadnessApi.ReasonEnum.StatusWarnings;
                case Badness.ReasonId.StatusRetrieving: return BadnessApi.ReasonEnum.StatusRetrieving;
                case Badness.ReasonId.StatusErrors: return BadnessApi.ReasonEnum.StatusErrors;
                case Badness.ReasonId.LockError: return BadnessApi.ReasonEnum.LockError;
                default: throw new UnreachableCaseError('BITA77553499', value);
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function fromApi(value: BadnessApi.Reason): Badness.ReasonId {
            const enumValue = value as BadnessApi.ReasonEnum;
            switch (enumValue) {
                case BadnessApi.ReasonEnum.NotBad: return Badness.ReasonId.NotBad;
                case BadnessApi.ReasonEnum.Inactive: return Badness.ReasonId.Inactive;
                case BadnessApi.ReasonEnum.Custom_Usable: return Badness.ReasonId.Custom_Usable;
                case BadnessApi.ReasonEnum.Custom_Suspect: return Badness.ReasonId.Custom_Suspect;
                case BadnessApi.ReasonEnum.Custom_Error: return Badness.ReasonId.Custom_Error;
                case BadnessApi.ReasonEnum.PublisherSubscriptionError_Internal_Error:
                    return Badness.ReasonId.PublisherSubscriptionError_Internal_Error;
                case BadnessApi.ReasonEnum.PublisherSubscriptionError_Offlined_Suspect:
                    return Badness.ReasonId.PublisherSubscriptionError_Offlined_Suspect;
                case BadnessApi.ReasonEnum.PublisherSubscriptionError_Offlined_Error:
                    return Badness.ReasonId.PublisherSubscriptionError_Offlined_Error;
                case BadnessApi.ReasonEnum.PublisherSubscriptionError_RequestTimeout_Suspect:
                    return Badness.ReasonId.PublisherSubscriptionError_RequestTimeout_Suspect;
                case BadnessApi.ReasonEnum.PublisherSubscriptionError_RequestTimeout_Error:
                    return Badness.ReasonId.PublisherSubscriptionError_RequestTimeout_Error;
                case BadnessApi.ReasonEnum.PublisherSubscriptionError_UserNotAuthorised_Error:
                    return Badness.ReasonId.PublisherSubscriptionError_UserNotAuthorised_Error;
                case BadnessApi.ReasonEnum.PublisherSubscriptionError_PublishRequestError_Suspect:
                    return Badness.ReasonId.PublisherSubscriptionError_PublishRequestError_Suspect;
                case BadnessApi.ReasonEnum.PublisherSubscriptionError_PublishRequestError_Error:
                    return Badness.ReasonId.PublisherSubscriptionError_PublishRequestError_Error;
                case BadnessApi.ReasonEnum.PublisherSubscriptionError_SubRequestError_Suspect:
                    return Badness.ReasonId.PublisherSubscriptionError_SubRequestError_Suspect;
                case BadnessApi.ReasonEnum.PublisherSubscriptionError_SubRequestError_Error:
                    return Badness.ReasonId.PublisherSubscriptionError_SubRequestError_Error;
                case BadnessApi.ReasonEnum.PublisherSubscriptionError_DataError_Suspect:
                    return Badness.ReasonId.PublisherSubscriptionError_DataError_Suspect;
                case BadnessApi.ReasonEnum.PublisherSubscriptionError_DataError_Error:
                    return Badness.ReasonId.PublisherSubscriptionError_DataError_Error;
                case BadnessApi.ReasonEnum.PublisherServerWarning: return Badness.ReasonId.PublisherServerWarning;
                case BadnessApi.ReasonEnum.PublisherServerError: return Badness.ReasonId.PublisherServerError;
                case BadnessApi.ReasonEnum.PublisherSubscriptionState_NeverSubscribed:
                    return Badness.ReasonId.PublisherSubscriptionState_NeverSubscribed;
                case BadnessApi.ReasonEnum.PublisherSubscriptionState_PublisherOnlineWaiting:
                    return Badness.ReasonId.PublisherSubscriptionState_PublisherOnlineWaiting;
                case BadnessApi.ReasonEnum.PublisherSubscriptionState_PublisherOfflining:
                    return Badness.ReasonId.PublisherSubscriptionState_PublisherOfflining;
                case BadnessApi.ReasonEnum.PublisherSubscriptionState_ResponseWaiting:
                    return Badness.ReasonId.PublisherSubscriptionState_ResponseWaiting;
                case BadnessApi.ReasonEnum.PublisherSubscriptionState_SynchronisationWaiting:
                    return Badness.ReasonId.PublisherSubscriptionState_SynchronisationWaiting;
                case BadnessApi.ReasonEnum.PublisherSubscriptionState_Synchronised:
                    return Badness.ReasonId.PublisherSubscriptionState_Synchronised;
                case BadnessApi.ReasonEnum.PublisherSubscriptionState_UnsubscribedSynchronised:
                    return Badness.ReasonId.PublisherSubscriptionState_UnsubscribedSynchronised;
                case BadnessApi.ReasonEnum.PublisherSubscriptionState_Unexpected:
                    return Badness.ReasonId.PublisherSubscriptionState_Unexpected;
                case BadnessApi.ReasonEnum.PreUsable_Clear: return Badness.ReasonId.PreUsable_Clear;
                case BadnessApi.ReasonEnum.PreUsable_Add: return Badness.ReasonId.PreUsable_Add;
                case BadnessApi.ReasonEnum.ConnectionOffline: return Badness.ReasonId.ConnectionOffline;
                case BadnessApi.ReasonEnum.FeedsWaiting: return Badness.ReasonId.FeedsWaiting;
                case BadnessApi.ReasonEnum.FeedsError: return Badness.ReasonId.FeedsError;
                case BadnessApi.ReasonEnum.FeedWaiting: return Badness.ReasonId.FeedWaiting;
                case BadnessApi.ReasonEnum.FeedError: return Badness.ReasonId.FeedError;
                case BadnessApi.ReasonEnum.FeedNotAvailable: return Badness.ReasonId.FeedNotAvailable;
                case BadnessApi.ReasonEnum.NoAuthorityFeed: return Badness.ReasonId.NoAuthorityFeed;
                case BadnessApi.ReasonEnum.MarketsWaiting: return Badness.ReasonId.MarketsWaiting;
                case BadnessApi.ReasonEnum.MarketsError: return Badness.ReasonId.MarketsError;
                case BadnessApi.ReasonEnum.MarketWaiting: return Badness.ReasonId.MarketWaiting;
                case BadnessApi.ReasonEnum.MarketError: return Badness.ReasonId.MarketError;
                case BadnessApi.ReasonEnum.MarketNotAvailable: return Badness.ReasonId.MarketNotAvailable;
                case BadnessApi.ReasonEnum.BrokerageAccountsWaiting: return Badness.ReasonId.BrokerageAccountsWaiting;
                case BadnessApi.ReasonEnum.BrokerageAccountsError: return Badness.ReasonId.BrokerageAccountsError;
                case BadnessApi.ReasonEnum.BrokerageAccountWaiting: return Badness.ReasonId.BrokerageAccountWaiting;
                case BadnessApi.ReasonEnum.BrokerageAccountError: return Badness.ReasonId.BrokerageAccountError;
                case BadnessApi.ReasonEnum.BrokerageAccountNotAvailable: return Badness.ReasonId.BrokerageAccountNotAvailable;
                case BadnessApi.ReasonEnum.OrderStatusesError: return Badness.ReasonId.OrderStatusesError;
                case BadnessApi.ReasonEnum.FeedStatus_Unknown: return Badness.ReasonId.FeedStatus_Unknown;
                case BadnessApi.ReasonEnum.FeedStatus_Initialising: return Badness.ReasonId.FeedStatus_Initialising;
                case BadnessApi.ReasonEnum.FeedStatus_Impaired: return Badness.ReasonId.FeedStatus_Impaired;
                case BadnessApi.ReasonEnum.FeedStatus_Expired: return Badness.ReasonId.FeedStatus_Expired;
                case BadnessApi.ReasonEnum.Reading: return Badness.ReasonId.Reading;
                case BadnessApi.ReasonEnum.SymbolMatching_None: return Badness.ReasonId.SymbolMatching_None;
                case BadnessApi.ReasonEnum.SymbolMatching_Ambiguous: return Badness.ReasonId.SymbolMatching_Ambiguous;
                case BadnessApi.ReasonEnum.SymbolOkWaitingForData: return Badness.ReasonId.SymbolOkWaitingForData;
                case BadnessApi.ReasonEnum.DataRetrieving: return Badness.ReasonId.DataRetrieving;
                case BadnessApi.ReasonEnum.MarketTradingStatesRetrieving: return Badness.ReasonId.MarketTradingStatesRetrieving;
                case BadnessApi.ReasonEnum.OrderStatusesFetching: return Badness.ReasonId.OrderStatusesFetching;
                case BadnessApi.ReasonEnum.BrokerageAccountDataListsIncubating: return Badness.ReasonId.BrokerageAccountDataListsIncubating;
                case BadnessApi.ReasonEnum.OneOrMoreAccountsInError: return Badness.ReasonId.OneOrMoreAccountsInError;
                case BadnessApi.ReasonEnum.ResourceWarnings: return Badness.ReasonId.ResourceWarnings;
                case BadnessApi.ReasonEnum.ResourceErrors: return Badness.ReasonId.ResourceErrors;
                case BadnessApi.ReasonEnum.StatusWarnings: return Badness.ReasonId.StatusWarnings;
                case BadnessApi.ReasonEnum.StatusRetrieving: return Badness.ReasonId.StatusRetrieving;
                case BadnessApi.ReasonEnum.StatusErrors: return Badness.ReasonId.StatusErrors;
                case BadnessApi.ReasonEnum.LockError: return Badness.ReasonId.LockError;
                default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidBadness, enumValue);
            }
        }
    }

    export function toApi(value: Badness): BadnessApi {
        return new BadnessImplementation(value);
    }

    export function fromApi(value: BadnessApi): Badness {
        const implementation = value as BadnessImplementation;
        return implementation.actual;
    }
}
