/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExchangeId, IvemId, LitIvemId, MarketId, MultiEvent, RoutedIvemId } from '../../exposed/extension-api';

/** @public */
export interface SymbolSvc {
    readonly defaultDefaultExchangeId: ExchangeId;
    readonly allowedExchangeIds: readonly ExchangeId[];
    readonly allowedMarketIds: readonly MarketId[];
    readonly defaultExchangeId: ExchangeId;
    readonly exchangeAnnouncerChar: string;
    readonly marketSeparatorChar: string;
    readonly exchangeHideMode: SymbolSvc.ExchangeHideMode;
    readonly defaultMarketHidden: boolean;
    readonly marketCodeAsLocalWheneverPossible: boolean;


    parseLitIvemId(value: string): SymbolSvc.LitIvemIdParseDetails;
    parseRoutedIvemId(value: string): SymbolSvc.RoutedIvemIdParseDetails;
    parseIvemId(value: string): SymbolSvc.IvemIdParseDetails;

    litIvemIdToDisplay(litIvemId: LitIvemId | undefined): string;
    routedIvemIdToDisplay(routedIvemId: RoutedIvemId | undefined): string;
    routedIvemIdToNothingHiddenDisplay(routedIvemId: RoutedIvemId): string;
    ivemIdToDisplay(ivemId: IvemId | undefined): string;

    getBestLitIvemIdFromIvemId(ivemId: IvemId): LitIvemId;
    getBestLitIvemIdFromRoutedIvemId(routedIvemId: RoutedIvemId): LitIvemId;
    tryGetBestRoutedIvemIdFromLitIvemId(litIvemId: LitIvemId): RoutedIvemId | undefined;
    tryGetBestRoutedIvemIdFromIvemId(ivemId: IvemId): RoutedIvemId | undefined;

    subscribeAllowedMarketIdsChangedEvent(handler: SymbolSvc.AllowedMarketIdsChangedEventHandler): MultiEvent.SubscriptionId;
    unsubscribeAllowedMarketIdsChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
    subscribeAllowedExchangeIdsChangedEvent(handler: SymbolSvc.AllowedExchangeIdsChangedEventHandler): MultiEvent.SubscriptionId;
    unsubscribeAllowedExchangeIdsChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void;

    unsubscribeAllEvents(): void;
}

/** @public */
export namespace SymbolSvc {
    export const enum ExchangeHideModeEnum {
        Never = 'Never',
        Default = 'Default',
        WheneverPossible = 'WheneverPossible',
    }
    export type ExchangeHideMode = keyof typeof ExchangeHideModeEnum;

    export type AllowedMarketIdsChangedEventHandler = (this: void) => void;
    export type AllowedExchangeIdsChangedEventHandler = (this: void) => void;

    export interface LitIvemIdParseDetails {
        success: boolean;
        litIvemId: LitIvemId | undefined;
        exchangeExplicit: boolean;
        marketExplicit: boolean;
        errorText: string;
        value: string;
    }

    export interface IvemIdParseDetails {
        success: boolean;
        ivemId: IvemId | undefined;
        exchangeExplicit: boolean;
        errorText: string;
        value: string;
    }

    export interface RoutedIvemIdParseDetails {
        success: boolean;
        routedIvemId: RoutedIvemId | undefined;
        exchangeExplicit: boolean;
        orderRouteExplicit: boolean;
        errorText: string;
        value: string;
    }
}
