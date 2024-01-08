/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

/** @public */
export interface ApiError extends Error {
    readonly code: ApiError.Code;
}

/** @public */
export namespace ApiError {
    export const enum CodeEnum {
        ZeroLengthMenuName = 'ZeroLengthMenuName',
        CommandNotRegistered = 'CommandNotRegistered',
        DestroyCommandMenuItemNotExist = 'DestroyCommandMenuItemNotExist',
        DestroyChildMenuItemNotExist = 'DestroyChildMenuItemNotExist',
        InvalidCorrectness = 'InvalidCorrectness',
        InvalidBadness = 'InvalidBadness',
        InvalidFeedClass = 'InvalidFeedClass',
        InvalidFeedId = 'InvalidFeedId',
        InvalidMarketId = 'InvalidMarketId',
        InvalidExchangeId = 'InvalidExchangeId',
        InvalidExchangeEnvironmentId = 'InvalidExchangeEnvironmentId',
        InvalidOrderExtendedSide = 'InvalidOrderExtendedSide',
        InvalidOrderTimeInForce = 'InvalidOrderTimeInForce',
        InvalidOrderType = 'InvalidOrderType',
        InvalidOrderRouteAlgorithm = 'InvalidOrderRouteAlgorithm',
        InvalidUiActionState = 'InvalidUiActionState',
        InvalidUiActionCommitType = 'InvalidUiActionCommitType',
        InvalidUiActionAutoAcceptanceType = 'InvalidUiActionAutoAcceptanceType',
        InvalidBuiltinIconButtonUiActionIconId = 'InvalidBuiltinIconButtonUiActionIconId',
        InvalidBrokerageAccountGroupType = 'InvalidBrokerageAccountGroupType',
        InvalidDesktopPreferredLocation = 'InvalidDesktopPreferredLocation',
        InvalidPublisherType = 'InvalidPublisherType',
        InvalidSourceTzOffsetDateTimeApiTimezoneMode = 'InvalidSourceTzOffsetDateTimeApiTimezoneMode',
        InvalidLitIvemIdPriceVolumeSequenceHistorySeriesTypeId = 'InvalidLitIvemIdPriceVolumeSequenceHistorySeriesTypeId',
        InvalidHistorySequencerUnit = 'InvalidHistorySequencerUnit',
        InvalidSequencerHistory = 'InvalidSequencerHistory',
        EventSubscriptionNotFound = 'EventSubscriptionNotFound',
        RoutedIvemIdCreateError_InvalidParameterTypes = 'RoutedIvemIdCreateError_InvalidParameterTypes',
        GetFrameEventerIsUndefined = 'GetFrameEventerIsUndefined',
        UnknownControl = 'UnknownControl',
        UnknownContentComponent = 'UnknownContentComponent',
    }

    export type Code = keyof typeof CodeEnum;
}
