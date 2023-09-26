/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MultiEvent, SymbolsService } from '@motifmarkets/motif-core';
import {
    ApiError as ApiErrorApi,
    IvemId as IvemIdApi,
    LitIvemId as LitIvemIdApi,
    MultiEvent as MultiEventApi,
    RoutedIvemId as RoutedIvemIdApi,
    SymbolSvc
} from '../../../api/extension-api';
import {
    ApiErrorImplementation,
    ExchangeIdImplementation,
    IvemIdImplementation,
    LitIvemIdImplementation,
    MarketIdImplementation,
    RoutedIvemIdImplementation
} from '../../exposed/internal-api';

export class SymbolSvcImplementation implements SymbolSvc {
    readonly exchangeHideMode: SymbolSvc.ExchangeHideMode;

    private _allowedMarketIdsChangedSubscriptionIds: MultiEvent.SubscriptionId[] = [];
    private _allowedExchangeIdsChangedSubscriptionIds: MultiEvent.SubscriptionId[] = [];

    constructor(private readonly _symbolsService: SymbolsService) { }

    get defaultDefaultExchangeId() { return ExchangeIdImplementation.toApi(this._symbolsService.defaultDefaultExchangeId); }
    get allowedExchangeIds() { return ExchangeIdImplementation.arrayToApi(this._symbolsService.allowedExchangeIds); }
    get allowedMarketIds() { return MarketIdImplementation.arrayToApi(this._symbolsService.allowedMarketIds); }
    get defaultExchangeId() { return ExchangeIdImplementation.toApi(this._symbolsService.defaultExchangeId); }
    get exchangeAnnouncerChar() { return this._symbolsService.pscExchangeAnnouncerChar; }
    get marketSeparatorChar() { return this._symbolsService.pscMarketAnnouncerChar; }
    get defaultMarketHidden() { return this._symbolsService.pscDefaultMarketHidden; }
    get marketCodeAsLocalWheneverPossible() { return this._symbolsService.pscMarketCodeAsLocalWheneverPossible; }

    destroy() {
        this.unsubscribeAllEvents();
    }

    parseLitIvemId(value: string): SymbolSvc.LitIvemIdParseDetails {
        const parseDetails = this._symbolsService.parseLitIvemId(value);
        const litIvemId = parseDetails.litIvemId;

        return {
            success: parseDetails.success,
            litIvemId: litIvemId === undefined ? undefined : LitIvemIdImplementation.toApi(litIvemId),
            exchangeExplicit: parseDetails.sourceIdExplicit,
            marketExplicit: parseDetails.marketIdExplicit,
            errorText: parseDetails.errorText,
            value: parseDetails.value,
        };
    }

    parseRoutedIvemId(value: string): SymbolSvc.RoutedIvemIdParseDetails {
        const parseDetails = this._symbolsService.parseRoutedIvemId(value);
        const routedIvemId = parseDetails.routedIvemId;
        return {
            success: parseDetails.success,
            routedIvemId: routedIvemId === undefined ? undefined : RoutedIvemIdImplementation.toApi(routedIvemId),
            exchangeExplicit: parseDetails.sourceIdExplicit,
            orderRouteExplicit: parseDetails.orderRouteExplicit,
            errorText: parseDetails.errorText,
            value: parseDetails.value,
        };
    }

    parseIvemId(value: string): SymbolSvc.IvemIdParseDetails {
        const parseDetails = this._symbolsService.parseIvemId(value);
        const ivemId = parseDetails.ivemId;

        return {
            success: parseDetails.success,
            ivemId: ivemId === undefined ? undefined : IvemIdImplementation.toApi(ivemId),
            exchangeExplicit: parseDetails.sourceIdExplicit,
            errorText: parseDetails.errorText,
            value: parseDetails.value,
        };
    }

    litIvemIdToDisplay(litIvemIdApi: LitIvemIdApi | undefined) {
        const litIvemId = litIvemIdApi === undefined ? undefined : LitIvemIdImplementation.fromApi(litIvemIdApi);
        return this._symbolsService.litIvemIdToDisplay(litIvemId);
    }

    routedIvemIdToDisplay(routedIvemIdApi: RoutedIvemIdApi | undefined) {
        const routedIvemId = routedIvemIdApi === undefined ? undefined : RoutedIvemIdImplementation.fromApi(routedIvemIdApi);
        return this._symbolsService.routedIvemIdToDisplay(routedIvemId);
    }

    routedIvemIdToNothingHiddenDisplay(routedIvemIdApi: RoutedIvemIdApi) {
        const routedIvemId = RoutedIvemIdImplementation.fromApi(routedIvemIdApi);
        return this._symbolsService.routedIvemIdToNothingHiddenDisplay(routedIvemId);
    }

    ivemIdToDisplay(ivemIdApi: IvemIdApi | undefined) {
        const ivemId = ivemIdApi === undefined ? undefined : IvemIdImplementation.fromApi(ivemIdApi);
        return this._symbolsService.ivemIdToDisplay(ivemId);
    }

    getBestLitIvemIdFromIvemId(ivemIdApi: IvemIdApi) {
        const ivemId = IvemIdImplementation.fromApi(ivemIdApi);
        const litIvemId = this._symbolsService.getBestLitIvemIdFromIvemId(ivemId);
        return LitIvemIdImplementation.toApi(litIvemId);
    }

    getBestLitIvemIdFromRoutedIvemId(routedIvemIdApi: RoutedIvemIdApi) {
        const routedIvemId = RoutedIvemIdImplementation.fromApi(routedIvemIdApi);
        const litIvemId = this._symbolsService.getBestLitIvemIdFromRoutedIvemId(routedIvemId);
        return LitIvemIdImplementation.toApi(litIvemId);
    }

    tryGetBestRoutedIvemIdFromLitIvemId(litIvemIdApi: LitIvemIdApi): RoutedIvemIdApi | undefined {
        const litIvemId = LitIvemIdImplementation.fromApi(litIvemIdApi);
        const routedIvemId = this._symbolsService.tryGetBestRoutedIvemIdFromLitIvemId(litIvemId);
        return routedIvemId === undefined ? undefined : RoutedIvemIdImplementation.toApi(routedIvemId);
    }

    tryGetBestRoutedIvemIdFromIvemId(ivemIdApi: IvemIdApi) {
        const ivemId = IvemIdImplementation.fromApi(ivemIdApi);
        const routedIvemId = this._symbolsService.tryGetBestRoutedIvemIdFromIvemId(ivemId);
        return routedIvemId === undefined ? undefined : RoutedIvemIdImplementation.toApi(routedIvemId);
    }

    subscribeAllowedMarketIdsChangedEvent(handler: SymbolSvc.AllowedMarketIdsChangedEventHandler) {
        const subscriptionId = this._symbolsService.subscribeAllowedMarketIdsChangedEvent(handler);
        this._allowedMarketIdsChangedSubscriptionIds.push(subscriptionId);
        return subscriptionId;
    }

    unsubscribeAllowedMarketIdsChangedEvent(subscriptionId: MultiEventApi.SubscriptionId) {
        if (subscriptionId !== undefined) {
            const idx = this._allowedMarketIdsChangedSubscriptionIds.indexOf(subscriptionId);
            if (idx < 0) {
                throw new ApiErrorImplementation(ApiErrorApi.CodeEnum.EventSubscriptionNotFound,
                    `SymbolSvc.AllowedMarketIdsChanged: ${subscriptionId}`
                );
            } else {
                this._allowedMarketIdsChangedSubscriptionIds.splice(idx, 1);
                this._symbolsService.unsubscribeAllowedMarketIdsChangedEvent(subscriptionId);
            }
        }
    }

    subscribeAllowedExchangeIdsChangedEvent(handler: SymbolSvc.AllowedExchangeIdsChangedEventHandler) {
        const subscriptionId = this._symbolsService.subscribeAllowedExchangeIdsChangedEvent(handler);
        this._allowedExchangeIdsChangedSubscriptionIds.push(subscriptionId);
        return subscriptionId;
    }

    unsubscribeAllowedExchangeIdsChangedEvent(subscriptionId: MultiEventApi.SubscriptionId) {
        if (subscriptionId !== undefined) {
            const idx = this._allowedExchangeIdsChangedSubscriptionIds.indexOf(subscriptionId);
            if (idx < 0) {
                throw new ApiErrorImplementation(ApiErrorApi.CodeEnum.EventSubscriptionNotFound,
                    `SymbolSvc.AllowedExchangeIdsChanged: ${subscriptionId}`
                );
            } else {
                this._allowedExchangeIdsChangedSubscriptionIds.splice(idx, 1);
                this._symbolsService.unsubscribeAllowedExchangeIdsChangedEvent(subscriptionId);
            }
        }
    }

    unsubscribeAllEvents() {
        this.unsubscribeAllAllowedMarketIdsChangedEvents();
        this.unsubscribeAllAllowedExchangedIdsChangedEvents();
    }

    private unsubscribeAllAllowedMarketIdsChangedEvents() {
        for (let i = this._allowedMarketIdsChangedSubscriptionIds.length - 1; i >= 0; i--) {
            const subscriptionId = this._allowedMarketIdsChangedSubscriptionIds[i];
            this._symbolsService.unsubscribeAllowedMarketIdsChangedEvent(subscriptionId);
        }
        this._allowedMarketIdsChangedSubscriptionIds.length = 0;
    }

    private unsubscribeAllAllowedExchangedIdsChangedEvents() {
        for (let i = this._allowedExchangeIdsChangedSubscriptionIds.length - 1; i >= 0; i--) {
            const subscriptionId = this._allowedExchangeIdsChangedSubscriptionIds[i];
            this._symbolsService.unsubscribeAllowedExchangeIdsChangedEvent(subscriptionId);
        }
        this._allowedExchangeIdsChangedSubscriptionIds.length = 0;
    }
}
