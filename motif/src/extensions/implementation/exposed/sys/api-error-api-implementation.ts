/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EnumInfoOutOfOrderError } from '@motifmarkets/motif-core';
import { ApiError as ApiErrorApi } from '../../../api/extension-api';

export class ApiErrorImplementation extends Error implements ApiErrorApi {
    constructor(private _code: ApiErrorApi.Code, message?: string) {
        super(ApiErrorImplementation.generateMessage(_code, message));
    }

    get code() { return this._code; }
}

export class UnreachableCaseApiErrorImplementation extends ApiErrorImplementation {
    constructor(code: ApiErrorApi.Code, value: never) {
        super(code, `"${value}"`);
    }
}

export namespace ApiErrorImplementation {
    export function generateMessage(code: ApiErrorApi.Code, message: string | undefined) {
        if (message === undefined || message === '') {
            return `${code}`;
        } else {
            return `${code}: ${message}`;
        }
    }

    export namespace Code {
        interface Info {
            readonly id: ApiErrorApi.Code;
            readonly code: ApiErrorApi.Code;
        }

        type InfosObject = { [id in ApiErrorApi.Code]: Info };

        const infosObject: InfosObject = {
            ZeroLengthMenuName: {
                id: ApiErrorApi.CodeEnum.ZeroLengthMenuName,
                code: 'ZeroLengthMenuName',
            },
            CommandNotRegistered: {
                id: ApiErrorApi.CodeEnum.CommandNotRegistered,
                code: 'CommandNotRegistered',
            },
            DestroyCommandMenuItemNotExist: {
                id: ApiErrorApi.CodeEnum.DestroyCommandMenuItemNotExist,
                code: 'DestroyCommandMenuItemNotExist',
            },
            DestroyChildMenuItemNotExist: {
                id: ApiErrorApi.CodeEnum.DestroyChildMenuItemNotExist,
                code: 'DestroyChildMenuItemNotExist',
            },
            InvalidCorrectness: {
                id: ApiErrorApi.CodeEnum.InvalidCorrectness,
                code: 'InvalidCorrectness',
            },
            InvalidBadness: {
                id: ApiErrorApi.CodeEnum.InvalidBadness,
                code: 'InvalidBadness',
            },
            InvalidFeedClass: {
                id: ApiErrorApi.CodeEnum.InvalidFeedClass,
                code: 'InvalidFeedClass',
            },
            InvalidFeedId: {
                id: ApiErrorApi.CodeEnum.InvalidFeedId,
                code: 'InvalidFeedId',
            },
            InvalidMarketId: {
                id: ApiErrorApi.CodeEnum.InvalidMarketId,
                code: 'InvalidMarketId',
            },
            InvalidExchangeId: {
                id: ApiErrorApi.CodeEnum.InvalidExchangeId,
                code: 'InvalidExchangeId',
            },
            InvalidExchangeEnvironmentId: {
                id: ApiErrorApi.CodeEnum.InvalidExchangeEnvironmentId,
                code: 'InvalidExchangeEnvironmentId',
            },
            InvalidOrderSide: {
                id: ApiErrorApi.CodeEnum.InvalidOrderSide,
                code: 'InvalidOrderSide',
            },
            InvalidOrderTimeInForce: {
                id: ApiErrorApi.CodeEnum.InvalidOrderTimeInForce,
                code: 'InvalidOrderTimeInForce',
            },
            InvalidOrderType: {
                id: ApiErrorApi.CodeEnum.InvalidOrderType,
                code: 'InvalidOrderType',
            },
            InvalidOrderRouteAlgorithm: {
                id: ApiErrorApi.CodeEnum.InvalidOrderRouteAlgorithm,
                code: 'InvalidOrderRouteAlgorithm',
            },
            InvalidUiActionState: {
                id: ApiErrorApi.CodeEnum.InvalidUiActionState,
                code: 'InvalidUiActionState',
            },
            InvalidUiActionCommitType: {
                id: ApiErrorApi.CodeEnum.InvalidUiActionCommitType,
                code: 'InvalidUiActionCommitType',
            },
            InvalidUiActionAutoAcceptanceType: {
                id: ApiErrorApi.CodeEnum.InvalidUiActionAutoAcceptanceType,
                code: 'InvalidUiActionAutoAcceptanceType',
            },
            InvalidBuiltinIconButtonUiActionIconId: {
                id: ApiErrorApi.CodeEnum.InvalidBuiltinIconButtonUiActionIconId,
                code: 'InvalidBuiltinIconButtonUiActionIconId',
            },
            InvalidBrokerageAccountGroupType: {
                id: ApiErrorApi.CodeEnum.InvalidBrokerageAccountGroupType,
                code: 'InvalidBrokerageAccountGroupType',
            },
            InvalidDesktopPreferredLocation: {
                id: ApiErrorApi.CodeEnum.InvalidDesktopPreferredLocation,
                code: 'InvalidDesktopPreferredLocation',
            },
            InvalidPublisherType: {
                id: ApiErrorApi.CodeEnum.InvalidPublisherType,
                code: 'InvalidPublisherType',
            },
            InvalidSourceTzOffsetDateTimeApiTimezoneMode: {
                id: ApiErrorApi.CodeEnum.InvalidSourceTzOffsetDateTimeApiTimezoneMode,
                code: 'InvalidSourceTzOffsetDateTimeApiTimezoneMode',
            },
            InvalidLitIvemIdPriceVolumeSequenceHistorySeriesTypeId: {
                id: ApiErrorApi.CodeEnum.InvalidLitIvemIdPriceVolumeSequenceHistorySeriesTypeId,
                code: 'InvalidLitIvemIdPriceVolumeSequenceHistorySeriesTypeId',
            },
            InvalidHistorySequencerUnit: {
                id: ApiErrorApi.CodeEnum.InvalidHistorySequencerUnit,
                code: 'InvalidHistorySequencerUnit',
            },
            InvalidSequencerHistory: {
                id: ApiErrorApi.CodeEnum.InvalidSequencerHistory,
                code: 'InvalidSequencerHistory',
            },
            EventSubscriptionNotFound: {
                id: ApiErrorApi.CodeEnum.EventSubscriptionNotFound,
                code: 'EventSubscriptionNotFound',
            },
            RoutedIvemIdCreateError_InvalidParameterTypes: {
                id: ApiErrorApi.CodeEnum.RoutedIvemIdCreateError_InvalidParameterTypes,
                code: 'RoutedIvemIdCreateError_InvalidParameterTypes',
            },
            GetFrameEventerIsUndefined: {
                id: ApiErrorApi.CodeEnum.GetFrameEventerIsUndefined,
                code: 'GetFrameEventerIsUndefined',
            },
            UnknownControl: {
                id: ApiErrorApi.CodeEnum.UnknownControl,
                code: 'UnknownControl',
            },
            UnknownContentComponent: {
                id: ApiErrorApi.CodeEnum.UnknownContentComponent,
                code: 'UnknownContentComponent',
            },
        };

        const infos = Object.values(infosObject);
        const idCount = infos.length;

        export function initialise() {
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                if (info.id !== info.code) {
                    throw new EnumInfoOutOfOrderError('ApiErrorApiImplementationCode', i, info.code);
                }
            }
        }
    }
}

export namespace ApiErrorImplementationModule {
    export function initialiseStatic() {
        ApiErrorImplementation.Code.initialise();
    }
}
