/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

/** @public */
export interface Badness {
    readonly reason: Badness.Reason;
    readonly reasonExtra: string;
}

/** @public */
export namespace Badness {
    export const enum ReasonEnum {
        NotBad = 'NotBad',
        Inactive = 'Inactive',
        Custom_Usable = 'Custom_Usable',
        Custom_Suspect = 'Custom_Suspect',
        Custom_Error = 'Custom_Error',
        PublisherSubscriptionError_Internal_Error = 'PublisherSubscriptionError_Internal_Error',
        PublisherSubscriptionError_Offlined_Suspect = 'PublisherSubscriptionError_Offlined_Suspect',
        PublisherSubscriptionError_Offlined_Error = 'PublisherSubscriptionError_Offlined_Error',
        PublisherSubscriptionError_RequestTimeout_Suspect = 'PublisherSubscriptionError_RequestTimeout_Suspect',
        PublisherSubscriptionError_RequestTimeout_Error = 'PublisherSubscriptionError_RequestTimeout_Error',
        PublisherSubscriptionError_UserNotAuthorised_Error = 'PublisherSubscriptionError_UserNotAuthorised_Error',
        PublisherSubscriptionError_PublishRequestError_Suspect = 'PublisherSubscriptionError_PublishRequestError_Suspect',
        PublisherSubscriptionError_PublishRequestError_Error = 'PublisherSubscriptionError_PublishRequestError_Error',
        PublisherSubscriptionError_SubRequestError_Suspect = 'PublisherSubscriptionError_SubRequestError_Suspect',
        PublisherSubscriptionError_SubRequestError_Error = 'PublisherSubscriptionError_SubRequestError_Error',
        PublisherSubscriptionError_DataError_Suspect = 'PublisherSubscriptionError_DataError_Suspect',
        PublisherSubscriptionError_DataError_Error = 'PublisherSubscriptionError_DataError_Error',
        PublisherServerWarning = 'PublisherServerWarning',
        PublisherServerError = 'PublisherServerError',
        PublisherSubscriptionState_NeverSubscribed = 'PublisherSubscriptionState_NeverSubscribed',
        PublisherSubscriptionState_PublisherOnlineWaiting = 'PublisherSubscriptionState_PublisherOnlineWaiting',
        PublisherSubscriptionState_PublisherOfflining = 'PublisherSubscriptionState_PublisherOfflining',
        PublisherSubscriptionState_ResponseWaiting = 'PublisherSubscriptionState_ResponseWaiting',
        PublisherSubscriptionState_SynchronisationWaiting = 'PublisherSubscriptionState_SynchronisationWaiting',
        PublisherSubscriptionState_Synchronised = 'PublisherSubscriptionState_Synchronised',
        PublisherSubscriptionState_UnsubscribedSynchronised = 'PublisherSubscriptionState_UnsubscribedSynchronised',
        PreUsable_Clear = 'PreUsable_Clear',
        PreUsable_Add = 'PreUsable_Add',
        ConnectionOffline = 'ConnectionOffline',
        FeedsWaiting = 'FeedsWaiting',
        FeedsError = 'FeedsError',
        FeedWaiting = 'FeedWaiting',
        FeedError = 'FeedError',
        FeedNotAvailable = 'FeedNotAvailable',
        NoAuthorityFeed = 'NoAuthorityFeed',
        MarketsWaiting = 'MarketsWaiting',
        MarketsError = 'MarketsError',
        MarketWaiting = 'MarketWaiting',
        MarketError = 'MarketError',
        MarketNotAvailable = 'MarketNotAvailable',
        BrokerageAccountsWaiting = 'BrokerageAccountsWaiting',
        BrokerageAccountsError = 'BrokerageAccountsError',
        BrokerageAccountWaiting = 'BrokerageAccountWaiting',
        BrokerageAccountError = 'BrokerageAccountError',
        BrokerageAccountNotAvailable = 'BrokerageAccountNotAvailable',
        OrderStatusesError = 'OrderStatusesError',
        FeedStatus_Unknown = 'FeedStatus_Unknown',
        FeedStatus_Initialising = 'FeedStatus_Initialising',
        FeedStatus_Impaired = 'FeedStatus_Impaired',
        FeedStatus_Expired = 'FeedStatus_Expired',
        Reading = 'Reading',
        SymbolMatching_None = 'SymbolMatching_None',
        SymbolMatching_Ambiguous = 'SymbolMatching_Ambiguous',
        SymbolOkWaitingForData = 'SymbolOkWaitingForData',
        DataRetrieving = 'DataRetrieving',
        MarketTradingStatesRetrieving = 'MarketTradingStatesRetrieving',
        OrderStatusesFetching = 'OrderStatusesFetching',
        BrokerageAccountDataListsIncubating = 'BrokerageAccountDataListsIncubating',
        OneOrMoreAccountsInError = 'OneOrMoreAccountsInError',
        ResourceWarnings = 'ResourceWarnings',
        ResourceErrors = 'ResourceErrors',
        StatusWarnings = 'StatusWarnings',
        StatusRetrieving = 'StatusRetrieving',
        StatusErrors = 'StatusErrors',
    }

    export type Reason = keyof typeof ReasonEnum;
}
