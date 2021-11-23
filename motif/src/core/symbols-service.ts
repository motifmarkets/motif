/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    ExchangeId,
    ExchangeInfo,
    IvemId,
    LitIvemAlternateCodes,
    LitIvemDetail,
    LitIvemId,
    MarketId,
    MarketInfo,
    MarketOrderRoute,
    MarketsDataDefinition,
    MarketsDataItem,
    OrderRoute,
    RoutedIvemId, SymbolFieldId
} from 'src/adi/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import {
    AssertInternalError,
    concatenateArrayUniquely,
    EnumInfoOutOfOrderError,
    ExternalError,
    Integer,
    isArrayEqualUniquely,
    isDigit,
    JsonLoadError,
    MultiEvent,
    NotImplementedError,
    UnreachableCaseError,
    UsableListChangeTypeId
} from 'src/sys/internal-api';
import { ExchangeSettings } from './internal-api';
import { CoreSettings } from './settings/core-settings';
import { SettingsService } from './settings/settings-service';

export class SymbolsService {
    private _finalised = false;

    private _coreSettings: CoreSettings;
    private _exchangeSettingsArray: ExchangeSettings[];
    private _marketsDataItem: MarketsDataItem;

    private _defaultDefaultExchangeId = ExchangeId.Asx;
    private _allowedMarketIds: MarketId[] = [];
    private _allowedExchangeIds: ExchangeId[] = [];

    private _defaultParseModeAuto: boolean;
    private _explicitDefaultParseModeId: SymbolsService.ParseModeId;
    private _promptDefaultExchangeIfRicParseModeId: boolean;
    private _defaultExchangeId: ExchangeId;
    private _ricAnnouncerChar: string;
    private _pscAnnouncerChar: string;
    private _pscMarketAnnouncerChar: string;
    private _pscExchangeAnnouncerChar: string;
    private _pscExchangeHideModeId: SymbolsService.ExchangeHideMode.Id;
    private _pscDefaultMarketHidden: boolean;
    private _pscMarketCodeAsLocalWheneverPossible: boolean;

    private _defaultParseModeId: SymbolsService.ParseModeId;

    private _pscExchangeDisplayCodeMap: SymbolsService.PscExchangeDisplayCodeMap;
    private _pscMarketMap: SymbolsService.PscMarketMap;

    private _settingsChangedEventSubscriptionId: MultiEvent.SubscriptionId;
    private _marketListChangeEventSubscriptionId: MultiEvent.SubscriptionId;

    private _allowedMarketIdsChangedMultiEvent = new MultiEvent<SymbolsService.AllowedMarketIdsChangedEventHandler>();
    private _allowedExchangeIdsChangedMultiEvent = new MultiEvent<SymbolsService.AllowedExchangeIdsChangedEventHandler>();

    constructor(private _settingsService: SettingsService, private _adi: AdiService) {
        this._coreSettings = this._settingsService.core;
        this._exchangeSettingsArray = this._settingsService.exchanges.exchanges;
        this._settingsChangedEventSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(
            () => this.handleSettingsChangedEvent()
        );

        this._pscExchangeDisplayCodeMap = new SymbolsService.PscExchangeDisplayCodeMap();
        this._pscMarketMap = new SymbolsService.PscMarketMap();
    }

    get defaultDefaultExchangeId() { return this._defaultDefaultExchangeId; }
    get allowedExchangeIds() { return this._allowedExchangeIds; }
    get allowedMarketIds() { return this._allowedMarketIds; }

    get defaultParseModeId() { return this._defaultParseModeId; }
    get defaultParseModeAuto() { return this._defaultParseModeAuto; }
    get explicitDefaultParseModeId() { return this._explicitDefaultParseModeId; }
    get promptDefaultExchangeIfRicParseModeId() { return this._promptDefaultExchangeIfRicParseModeId; }
    set promptDefaultExchangeIfRicParseModeId(value) {
        this._promptDefaultExchangeIfRicParseModeId = value;
        this._coreSettings.symbol_PromptDefaultExchangeIfRicParseModeId = this._promptDefaultExchangeIfRicParseModeId;
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get defaultExchangeId() { return this._defaultExchangeId; }
    set defaultExchangeId(value: ExchangeId) {
        this._defaultExchangeId = value;
        this._coreSettings.symbol_DefaultExchangeId = ExchangeInfo.idToJsonValue(this._defaultExchangeId);
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get ricAnnouncerChar() { return this._ricAnnouncerChar; }
    set ricAnnouncerChar(value: string) {
        this._ricAnnouncerChar = value;
        this._coreSettings.symbol_RicAnnouncerChar = this._ricAnnouncerChar;
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get pscAnnouncerChar() { return this._pscAnnouncerChar; }
    set pscAnnouncerChar(value: string) {
        this._pscAnnouncerChar = value;
        this._coreSettings.symbol_PscAnnouncerChar = this._pscAnnouncerChar;
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get pscExchangeAnnouncerChar() { return this._pscExchangeAnnouncerChar; }
    set pscExchangeAnnouncerChar(value: string) {
        this._pscExchangeAnnouncerChar = this.checkFixSymbolSourceSeparator(value);
        this._coreSettings.symbol_PscExchangeAnnouncerChar = this._pscExchangeAnnouncerChar;
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get pscMarketSeparatorChar() { return this._pscMarketAnnouncerChar; }
    set pscMarketSeparatorChar(value: string) {
        this._pscMarketAnnouncerChar = this.checkFixMarketSeparator(value);
        this._coreSettings.symbol_PscMarketAnnouncerChar = this._pscMarketAnnouncerChar;
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get pscExchangeHideModeId() { return this._pscExchangeHideModeId; }
    set pscExchangeHideModeId(value: SymbolsService.ExchangeHideMode.Id) {
        this._pscExchangeHideModeId = value;
        this._coreSettings.symbol_PscExchangeHideModeId =
            SymbolsService.ExchangeHideMode.idToJsonValue(this._pscExchangeHideModeId);
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get pscDefaultMarketHidden() { return this._pscDefaultMarketHidden; }
    set pscDefaultMarketHidden(value: boolean) {
        this._pscDefaultMarketHidden = value;
        this._coreSettings.symbol_PscDefaultMarketHidden = this._pscDefaultMarketHidden;
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get pscMarketCodeAsLocalWheneverPossible() { return this._pscMarketCodeAsLocalWheneverPossible; }
    set pscMarketCodeAsLocalWheneverPossible(value: boolean) {
        this._pscMarketCodeAsLocalWheneverPossible = value;
        this._coreSettings.symbol_PscMarketCodeAsLocalWheneverPossible = this._pscMarketCodeAsLocalWheneverPossible;
    }

    set defaultParseModeIdAuto(value: boolean) {
        this._defaultParseModeAuto = value;
        this.updateDefaultParseModeId();
        this._coreSettings.symbol_DefaultParseModeAuto = this._defaultParseModeAuto;
    }
    set explicitDefaultParseModeIdAuto(value: SymbolsService.ParseModeId) {
        this._explicitDefaultParseModeId = value;
        this.updateDefaultParseModeId();
        this._coreSettings.symbol_ExplicitDefaultParseModeId = SymbolsService.ParseMode.idToJsonValue(this._explicitDefaultParseModeId);
    }

    start() {
        const marketsDefinition = new MarketsDataDefinition();
        this._marketsDataItem = this._adi.subscribe(marketsDefinition) as MarketsDataItem;
        this._marketListChangeEventSubscriptionId = this._marketsDataItem.subscribeListChangeEvent(
            (listChangeTypeId, index, count) => this.handleMarketListChangeEvent(listChangeTypeId, index, count)
        );

        this.loadAllowedExchangeAndMarketIds();
    }

    finalise() {
        if (!this._finalised) {
            if (this._marketsDataItem !== undefined) {
                this._marketsDataItem.unsubscribeListChangeEvent(this._marketListChangeEventSubscriptionId);
                this._adi.unsubscribe(this._marketsDataItem);
            }

            this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedEventSubscriptionId);
            this._finalised = true;
        }
    }

    setDefaultDefaultExchangeId(value: ExchangeId) {
        this._defaultDefaultExchangeId = value;
    }

    getMarketGlobalCode(marketId: MarketId) {
        return this._pscMarketMap.getGlobalCode(marketId);
    }

    parseLitIvemId(value: string): SymbolsService.LitIvemIdParseDetails {
        const calculatedParseMode = this.calculateParseMode(value);
        if (!calculatedParseMode.valid) {
            return SymbolsService.LitIvemIdParseDetails.createFail(value, calculatedParseMode.errorText);
        } else {
            // move to extension
            switch (calculatedParseMode.id) {
                // case SymbolsManager.ParseModeId.Ric: return this.parseRicLitIvemId(calculatedParseMode.parseText);
                case SymbolsService.ParseModeId.Psc: return this.parsePscLitIvemId(calculatedParseMode.parseText);
                default: throw new UnreachableCaseError('', calculatedParseMode.id);
            }
        }
    }

    parseRoutedIvemId(value: string): SymbolsService.RoutedIvemIdParseDetails {
        const calculatedParseMode = this.calculateParseMode(value);
        if (!calculatedParseMode.valid) {
            return SymbolsService.RoutedIvemIdParseDetails.createFail(value, calculatedParseMode.errorText);
        } else {
            // move to extension
            switch (calculatedParseMode.id) {
                // case SymbolsManager.ParseModeId.Ric: return this.parseRicLitIvemId(calculatedParseMode.parseText);
                case SymbolsService.ParseModeId.Psc:
                    // only supports Market Routes for now.  Need to enhance to support other types of routes as well
                    const details = this.parsePscLitIvemId(calculatedParseMode.parseText);
                    const result = SymbolsService.RoutedIvemIdParseDetails.createFromLitIvemIdParseDetails(details);
                    return result;
                default: throw new UnreachableCaseError('', calculatedParseMode.id);
            }
        }
    }

    parseIvemId(value: string): SymbolsService.IvemIdParseDetails {
        const calcululatedParseMode = this.calculateParseMode(value);
        // move to extension
        if (!calcululatedParseMode.valid) {
            return SymbolsService.IvemIdParseDetails.createFail(value, calcululatedParseMode.errorText);
        } else {
            switch (calcululatedParseMode.id) {
                // case SymbolsManager.ParseModeId.Ric: return this.parseRicIvemId(calcululatedParseMode.parseText);
                case SymbolsService.ParseModeId.Psc: return this.parsePscIvemId(calcululatedParseMode.parseText);
                default: throw new UnreachableCaseError('', calcululatedParseMode.id);
            }
        }
    }

    litIvemIdToDisplay(litIvemId: LitIvemId | undefined): string {
        if (litIvemId === undefined) {
            return '';
        // move to extension
        // } else if (EikonUtils.isEikonEnvironment()) {
        //     return this.ricNotNullLitIvemIdToDisplay(litIvemId);
        } else {
            return this.pscNotNullLitIvemIdToDisplay(litIvemId, false);
        }
    }

    routedIvemIdToDisplay(routedIvemId: RoutedIvemId | undefined): string {
        if (routedIvemId === undefined) {
            return '';
        // move to extension
        // } else if (EikonUtils.isEikonEnvironment()) {
        //     return this.ricNotNullLitIvemIdToDisplay(litIvemId);
        } else {
            const route = routedIvemId.route;
            if (!OrderRoute.isMarketRoute(route)) {
                // need to enhance to support BestMarket and FIX
                throw new NotImplementedError('SMRIITD2121222');
            } else {
                const litIvemId = LitIvemId.createFromCodeMarket(routedIvemId.ivemId.code, route.marketId);
                return this.pscNotNullLitIvemIdToDisplay(litIvemId, false);
            }
        }
    }

    routedIvemIdToNothingHiddenDisplay(routedIvemId: RoutedIvemId) {
        const route = routedIvemId.route;
        if (!OrderRoute.isMarketRoute(route)) {
            // need to enhance to support BestMarket and FIX
            throw new NotImplementedError('SMRIITD2121222');
        } else {
            const litIvemId = LitIvemId.createFromCodeMarket(routedIvemId.ivemId.code, route.marketId);
            return this.pscNotNullLitIvemIdToDisplay(litIvemId, true);
        }
    }

    ivemIdToDisplay(ivemId: IvemId | undefined): string {
        if (ivemId === undefined) {
            return '';
        } else {
            const exchangeHidden = this._pscExchangeHideModeId !== SymbolsService.ExchangeHideModeId.Never &&
                ivemId.exchangeId === this._defaultExchangeId;
            if (exchangeHidden) {
                return ivemId.code;
            } else {
                return ivemId.code + this.pscExchangeAnnouncerChar + this._pscExchangeDisplayCodeMap.get(ivemId.exchangeId);
            }
        }
    }

    tryCreateValidLitIvemId(code: string, exchangeId: ExchangeId | undefined, marketId: MarketId | undefined) {
        code = code.toUpperCase();
        if (marketId !== undefined) {
            const marketExchangeId = MarketInfo.idToExchangeId(marketId);
            if (exchangeId === undefined) {
                exchangeId = marketExchangeId;
            } else {
                if (exchangeId !== marketExchangeId) {
                    throw new AssertInternalError('SMTCVLII19003', `${ExchangeInfo.idToName(exchangeId)} ${MarketInfo.idToName(marketId)}`);
                }
            }
        } else {
            if (exchangeId === undefined) {
                exchangeId = this.defaultExchangeId;
            }
            marketId = ExchangeInfo.idToDefaultMarketId(exchangeId);
        }

        if (this.isValidCode(code, exchangeId)) {
            return LitIvemId.createFromCodeMarket(code, marketId);
        } else {
            return undefined;
        }
    }

    tryCreateValidRoutedIvemId(code: string, exchangeId: ExchangeId | undefined, orderRoute: OrderRoute | undefined) {
        code = code.toUpperCase();
        if (orderRoute !== undefined) {
            if (OrderRoute.isMarketRoute(orderRoute)) {
                const marketId = orderRoute.marketId;
                const marketExchangeId = MarketInfo.idToExchangeId(marketId);
                if (exchangeId === undefined) {
                    exchangeId = marketExchangeId;
                } else {
                    if (exchangeId !== marketExchangeId) {
                        const exchangeName = ExchangeInfo.idToName(exchangeId);
                        const marketName = MarketInfo.idToName(marketId);
                        throw new AssertInternalError('SMTCVRII19003',`${exchangeName} ${marketName}`);
                    }
                }
            } else {
                // Currently only Market OrderRoutes supported
                throw new AssertInternalError('SMTCVRII1009552');
            }
        } else {
            if (exchangeId === undefined) {
                exchangeId = this.defaultExchangeId;
            }
        }

        if (!this.isValidCode(code, exchangeId)) {
            return undefined;
        } else {
            if (orderRoute === undefined) {
                const marketId = ExchangeInfo.idToDefaultMarketId(exchangeId);
                orderRoute = new MarketOrderRoute(marketId);
            }

            const ivemId = new IvemId(code, exchangeId);
            return new RoutedIvemId(ivemId, orderRoute);
        }
    }

    getBestLitIvemIdFromIvemId(ivemId: IvemId) {
        const litId = ExchangeInfo.idToDefaultMarketId(ivemId.exchangeId);
        return LitIvemId.createFromCodeMarket(ivemId.code, litId);
    }

    getBestLitIvemIdFromRoutedIvemId(routedIvemId: RoutedIvemId) {
        const route = routedIvemId.route;
        const litId = route.getBestLitMarketId();
        return LitIvemId.createFromCodeMarket(routedIvemId.ivemId.code, litId);
    }

    calculateSymbolNameFromLitIvemDetail(detail: LitIvemDetail) {
        return this.calculateSymbolName(detail.exchangeId, detail.name, detail.litIvemId.code, detail.alternateCodes);
    }

    calculateSymbolName(exchangeId: ExchangeId, detailName: string, detailCode: string, detailAlternateCodes: LitIvemAlternateCodes) {
        const fieldId = this._exchangeSettingsArray[exchangeId].symbolNameFieldId;
        if (fieldId === SymbolFieldId.Name) {
            return detailName;
        } else {
            const alternateCodes = detailAlternateCodes;
            if (alternateCodes === undefined) {
                return detailName;
            } else {
                if (fieldId === SymbolFieldId.Ticker) {
                    const ticker = alternateCodes.ticker;
                    if (ticker === undefined) {
                        return detailName;
                    } else {
                        return ticker;
                    }
                } else {
                    let result: string | undefined;
                    switch (fieldId) {
                        case SymbolFieldId.Code: {
                            result = detailCode;
                            break;
                        }
                        case SymbolFieldId.Isin: {
                            result = alternateCodes.isin;
                            break;
                        }
                        case SymbolFieldId.Ric: {
                            result = alternateCodes.ric;
                            break;
                        }
                        case SymbolFieldId.Base: {
                            result = alternateCodes.base;
                            break;
                        }
                        case SymbolFieldId.Gics: {
                            result = alternateCodes.gics;
                            break;
                        }
                        case SymbolFieldId.Long: {
                            result = alternateCodes.long;
                            break;
                        }
                        case SymbolFieldId.Short: {
                            result = alternateCodes.short;
                            break;
                        }
                        default:
                            result = detailName;
                    }
                    if (result === undefined) {
                        result = detailName;
                    }
                    return result;
                }
            }
        }
    }

    calculateSymbolSearchFieldIds(exchangeId: ExchangeId | undefined) {
        if (exchangeId === undefined) {
            if (this._coreSettings.symbol_ExplicitSearchFieldsEnabled) {
                return this._coreSettings.symbol_ExplicitSearchFieldIds;
            } else {
                return this._exchangeSettingsArray[this._defaultExchangeId].symbolSearchFieldIds;
            }
        } else {
            return this._exchangeSettingsArray[exchangeId].symbolSearchFieldIds;
        }
    }

    tryGetBestRoutedIvemIdFromLitIvemId(litIvemId: LitIvemId) {
        const marketId = litIvemId.litId;
        const isRoutable = MarketInfo.idToIsRoutable(marketId);
        if (!isRoutable) {
            return undefined;
        } else {
            const route = new MarketOrderRoute(marketId);
            const routedIvemId = new RoutedIvemId(litIvemId.ivemId, route);
            return routedIvemId;
        }
    }

    tryGetBestRoutedIvemIdFromIvemId(ivemId: IvemId) {
        const marketId = ExchangeInfo.idToDefaultMarketId(ivemId.exchangeId);
        const isRoutable = MarketInfo.idToIsRoutable(marketId);
        if (!isRoutable) {
            return undefined;
        } else {
            const route = new MarketOrderRoute(marketId);
            const routedIvemId = new RoutedIvemId(ivemId, route);
            return routedIvemId;
        }
    }

    subscribeAllowedMarketIdsChangedEvent(handler: SymbolsService.AllowedMarketIdsChangedEventHandler) {
        return this._allowedMarketIdsChangedMultiEvent.subscribe(handler);
    }

    unsubscribeAllowedMarketIdsChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._allowedMarketIdsChangedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeAllowedExchangeIdsChangedEvent(handler: SymbolsService.AllowedExchangeIdsChangedEventHandler) {
        return this._allowedExchangeIdsChangedMultiEvent.subscribe(handler);
    }

    unsubscribeAllowedExchangeIdsChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._allowedExchangeIdsChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private handleSettingsChangedEvent() {
        this.applySettings();
    }

    private handleMarketListChangeEvent(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                this.loadAllowedExchangeAndMarketIds();
                break;
            case UsableListChangeTypeId.PreUsableClear:
                // no action
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                break;
            case UsableListChangeTypeId.Usable:
                this.loadAllowedExchangeAndMarketIds();
                break;
            case UsableListChangeTypeId.Insert:
                this.loadAllowedExchangeAndMarketIds();
                break;
            case UsableListChangeTypeId.Remove:
                this.loadAllowedExchangeAndMarketIds();
                break;
            case UsableListChangeTypeId.Clear:
                this.loadAllowedExchangeAndMarketIds();
                break;
            default:
                throw new UnreachableCaseError('FSDIPMLCU10009134', listChangeTypeId);
        }
    }

    private notifyAllowedMarketIdsChanged() {
        const handlers = this._allowedMarketIdsChangedMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler();
        }
    }

    private notifyAllowedExchangeIdsChanged() {
        const handlers = this._allowedExchangeIdsChangedMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler();
        }
    }

    private getDefaultMarketId(exchangeId: ExchangeId): MarketId | undefined {
        return ExchangeInfo.idToDefaultMarketId(exchangeId);
    }

    private doesMarketSupportExchange(marketId: MarketId, exchangeId: ExchangeId): boolean {
        const supportedExchanges = this._pscMarketMap.getSupportedExchanges(marketId);
        return supportedExchanges.includes(exchangeId);
    }

    private loadAllowedExchangeAndMarketIds() {
        const oldAllowedMarketIds = this._allowedMarketIds.slice();
        const oldAllowedExchangeIds = this._allowedExchangeIds.slice();

        const allowedMarketIdCount = this._marketsDataItem.count;
        this._allowedMarketIds.length = allowedMarketIdCount;
        this._allowedExchangeIds.length = allowedMarketIdCount;

        let allowedExchangeIdCount = 0;

        for (let i = 0; i < allowedMarketIdCount; i++) {
            const market = this._marketsDataItem.records[i];
            const marketId = market.marketId;
            this._allowedMarketIds[i] = marketId;

            const exchangeId = MarketInfo.idToExchangeId(marketId);
            let exchangeIdNotIncluded: boolean;
            if (allowedExchangeIdCount === 0) {
                exchangeIdNotIncluded = true;
            } else {
                exchangeIdNotIncluded = this._allowedExchangeIds.lastIndexOf(exchangeId, allowedExchangeIdCount - 1) === -1;
            }
            if (exchangeIdNotIncluded) {
                this._allowedExchangeIds[allowedExchangeIdCount++] = exchangeId;
            }
        }

        this._allowedExchangeIds.length = allowedExchangeIdCount;

        const allowedMarketIdsChanged = isArrayEqualUniquely(this._allowedMarketIds, oldAllowedMarketIds);
        if (allowedMarketIdsChanged) {
            this.notifyAllowedMarketIdsChanged();
        }

        const allowedExchangeIdsChanged = isArrayEqualUniquely(this._allowedExchangeIds, oldAllowedExchangeIds);
        if (allowedExchangeIdsChanged) {
            this.notifyAllowedExchangeIdsChanged();
        }
    }

    // move to extension
    // private parseRicLitIvemId(ricValue: string): SymbolsManager.LitIvemIdParseDetails {
    //     const parseResult = EikonUtils.parseRic(ricValue);

    //     const result = new SymbolsManager.LitIvemIdParseDetails();
    //     result.success = parseResult.success;
    //     if (!parseResult.success) {
    //         result.litIvemId = undefined;
    //     } else {
    //         result.litIvemId = parseResult.createLitIvemId();
    //     }
    //     result.isRic = true;
    //     result.sourceIdExplicit = false;
    //     result.marketIdExplicit = parseResult.success;
    //     result.errorText = parseResult.errorText;
    //     result.value = ricValue;

    //     return result;
    // }

    // private parseRicIvemId(ricValue: string) {
    //     const parseResult = EikonUtils.parseRic(ricValue);

    //     const result = new SymbolsManager.IvemIdParseDetails();

    //     if (!parseResult.success) {
    //         result.ivemId = undefined;
    //         result.success = false;
    //     } else {
    //         const sourceId = Market.idToSymbolSourceId(parseResult.marketId);
    //         result.ivemId = IvemId.createFromCodeSource(parseResult.code, sourceId);
    //         result.success = true;
    //     }
    //     result.isRic = true;
    //     result.sourceIdExplicit = parseResult.success;
    //     result.errorText = parseResult.errorText;
    //     result.value = ricValue;

    //     return result;
    // }

    private parsePscLitIvemId(value: string): SymbolsService.LitIvemIdParseDetails {
        const upperValue = value.trim().toUpperCase();
        let errorText = '';
        let litIvemId: LitIvemId | undefined;
        let exchangeId: ExchangeId | undefined;
        let code = upperValue;
        let litIdSeparatorPos = -1; // prevent compiler warning
        let marketDisplayCode: string | undefined;
        let exchangeDisplayCode: string | undefined;

        for (let i = upperValue.length - 1; i >= 0; i--) {
            if (marketDisplayCode === undefined && (upperValue[i] === this._pscMarketAnnouncerChar)) {
                marketDisplayCode = upperValue.substr(i + 1);
                litIdSeparatorPos = i;
                code = upperValue.substr(0, i);
            } else {
                if (upperValue[i] === this._pscExchangeAnnouncerChar) {
                    if (marketDisplayCode !== undefined) {
                        exchangeDisplayCode = upperValue.substr(i + 1, litIdSeparatorPos - i - 1);
                    } else {
                        exchangeDisplayCode = upperValue.substr(i + 1);
                    }

                    code = upperValue.substr(0, i);
                    break;
                }
            }
        }

        if (code === '') {
            errorText = Strings[StringId.CodeMissing];
        } else {
            if (exchangeDisplayCode !== undefined) {
                exchangeId = this._pscExchangeDisplayCodeMap.findId(exchangeDisplayCode);

                if (exchangeId === undefined) {
                    errorText = `${Strings[StringId.InvalidExchange]}: "${exchangeDisplayCode}"`;
                } else {
                    if (marketDisplayCode !== undefined) {
                        const parseResult = this.parseLitIvemIdMarket(code, exchangeId, marketDisplayCode);
                        litIvemId = parseResult.litIvemId;
                        errorText = parseResult.errorText;
                    } else {
                        const litId = this.getDefaultMarketId(exchangeId);
                        if (litId === undefined) {
                            const errorName = Strings[StringId.SymbolSourceDoesNotHaveDefaultMarket];
                            errorText = `${errorName}: ${ExchangeInfo.idToAbbreviatedDisplay(exchangeId)}`;
                        } else {
                            litIvemId = LitIvemId.createFromCodeMarket(code, litId);
                        }
                    }
                }
            } else {
                if (marketDisplayCode !== undefined) {
                    const parseResult = this.parseLitIvemIdMarket(code, exchangeId, marketDisplayCode);
                    litIvemId = parseResult.litIvemId;
                    errorText = parseResult.errorText;
                } else {
                    exchangeId = this._defaultExchangeId;
                    const litId = this.getDefaultMarketId(exchangeId);
                    if (litId === undefined) {
                        const errorName = Strings[StringId.SymbolSourceDoesNotHaveDefaultMarket];
                        errorText = `${errorName}: ${ExchangeInfo.idToAbbreviatedDisplay(exchangeId)}`;
                    } else {
                        litIvemId = LitIvemId.createFromCodeMarket(code, litId);
                    }
                }
            }
        }

        const result: SymbolsService.LitIvemIdParseDetails = {
            success: errorText === '',
            litIvemId,
            isRic: false,
            sourceIdExplicit: exchangeDisplayCode !== undefined,
            marketIdExplicit: marketDisplayCode !== undefined,
            errorText,
            value,
        };

        return result;
    }

    private parseLitIvemIdMarket(code: string, explicitExchangeId: ExchangeId | undefined, marketDisplayCode: string) {
        let exchangeId: ExchangeId;
        if (explicitExchangeId === undefined) {
            exchangeId = this._defaultExchangeId;
        } else {
            exchangeId = explicitExchangeId;
        }

        let globalMarketSpecified: boolean;
        let litId = this._pscMarketMap.findId(marketDisplayCode);
        if (litId !== undefined) {
            globalMarketSpecified = true;
        } else {
            globalMarketSpecified = false;
            const localMarkets = ExchangeInfo.idToLocalMarkets(exchangeId);
            for (const marketId of localMarkets) {
                const upperLocal = this._pscMarketMap.getUpperLocalCode(marketId);
                if (upperLocal === marketDisplayCode) {
                    litId = marketId;
                    break;
                }
            }
        }

        let errorText: string;
        let litIvemId: LitIvemId | undefined;
        if (litId === undefined) {
            litIvemId = undefined;
            errorText = `${Strings[StringId.InvalidMarket]}: "${marketDisplayCode}"`;
        } else {
            if (globalMarketSpecified && !this.doesMarketSupportExchange(litId, exchangeId)) {
                litIvemId = undefined;
                errorText = `${Strings[StringId.MarketDoesNotSupportExchange]}: ${ExchangeInfo.idToAbbreviatedDisplay(exchangeId)}, ` +
                    MarketInfo.idToDisplayId(litId);
            } else {
                litIvemId = LitIvemId.createFromCodeMarket(code, litId);
                errorText = '';
            }
        }

        return {
            litIvemId,
            errorText,
        };
    }

    private parsePscIvemId(value: string) {
        const upperValue = value.trim().toUpperCase();
        let errorText = '';
        let ivemId: IvemId | undefined;
        let exchangeId: ExchangeId | undefined;
        let code = upperValue;

        for (let i = upperValue.length - 1; i >= 0; i--) {
            if (upperValue[i] === this._pscExchangeAnnouncerChar) {
                const exchangeDisplayCode = upperValue.substr(i + 1);

                exchangeId = this._pscExchangeDisplayCodeMap.findId(exchangeDisplayCode);

                if (exchangeId === undefined) {
                    errorText = `${Strings[StringId.InvalidExchange]}: "${exchangeDisplayCode}"`;
                } else {
                    code = upperValue.substr(0, i);
                    if (code === '') {
                        errorText = Strings[StringId.CodeMissing];
                    }
                }

                break;
            }
        }

        if (errorText === '') {
            if (exchangeId !== undefined) {
                ivemId = new IvemId(code, exchangeId);
            } else {
                if (code === '') {
                    errorText = Strings[StringId.CodeMissing];
                } else {
                    ivemId = new IvemId(code, this._defaultExchangeId);
                }
            }
        }

        const result: SymbolsService.IvemIdParseDetails = {
            success: errorText === '',
            ivemId,
            sourceIdExplicit: exchangeId !== undefined,
            errorText,
            value,
        };

        return result;
    }

    private checkFixAnnouncerChar(value: string): string {
        value = value.trim();
        switch (value.length) {
            case 0: return '';
            case 1: return value;
            default: return value.substr(0, 1);
        }
    }

    private checkFixSymbolSourceSeparator(value: string): string {
        switch (value.length) {
            case 0: return SymbolsService.defaultPscExchangeAnnouncerChar;
            case 1: return value;
            default: return value.substr(0, 1);
        }
    }

    private checkFixMarketSeparator(value: string): string {
        switch (value.length) {
            case 0: return SymbolsService.defaultPscMarketSeparatorChar;
            case 1: return value;
            default: return value.substr(0, 1);
        }
    }

    private applySettings() {
        const defaultParseModeAutoSetting = this._coreSettings.symbol_DefaultParseModeAuto;
        if (defaultParseModeAutoSetting === undefined) {
            this._defaultParseModeAuto = SymbolsService.defaultDefaultParseModeAuto;
        } else {
            this._defaultParseModeAuto = defaultParseModeAutoSetting;
        }

        const promptDefaultSymbolSourceIfRicParseModeIdSetting = this._coreSettings.symbol_PromptDefaultExchangeIfRicParseModeId;
        if (promptDefaultSymbolSourceIfRicParseModeIdSetting === undefined) {
            this._promptDefaultExchangeIfRicParseModeId = SymbolsService.defaultPromptDefaultSymbolSourceIfRicParseModeId;
        } else {
            this._promptDefaultExchangeIfRicParseModeId = promptDefaultSymbolSourceIfRicParseModeIdSetting;
        }

        const explicitDefaultParseModeIdSetting = this._coreSettings.symbol_ExplicitDefaultParseModeId;
        if (explicitDefaultParseModeIdSetting === undefined) {
            this._explicitDefaultParseModeId = SymbolsService.defaultExplicitParseModeId;
        } else {
            const parseModeId = SymbolsService.ParseMode.tryJsonValueToId(explicitDefaultParseModeIdSetting);
            if (parseModeId === undefined) {
                this._explicitDefaultParseModeId = SymbolsService.defaultExplicitParseModeId;
            } else {
                this._explicitDefaultParseModeId = parseModeId;
            }
        }

        const defaultExchangeIdSetting = this._coreSettings.symbol_DefaultExchangeId;
        if (defaultExchangeIdSetting === undefined) {
            this._defaultExchangeId = this.defaultDefaultExchangeId;
        } else {
            const exchangeId = ExchangeInfo.tryJsonValueToId(defaultExchangeIdSetting);
            if (exchangeId === undefined) {
                this._defaultExchangeId = this.defaultDefaultExchangeId;
            } else {
                this._defaultExchangeId = exchangeId;
            }
        }

        const ricAnnouncerCharSetting = this._coreSettings.symbol_RicAnnouncerChar;
        if (ricAnnouncerCharSetting === undefined) {
            this._ricAnnouncerChar = SymbolsService.defaultRicAnnouncerChar;
        } else {
            this._ricAnnouncerChar = this.checkFixAnnouncerChar(ricAnnouncerCharSetting);
        }

        const pscAnnouncerCharSetting = this._coreSettings.symbol_PscAnnouncerChar;
        if (pscAnnouncerCharSetting === undefined) {
            this._pscAnnouncerChar = SymbolsService.defaultPscAnnouncerChar;
        } else {
            this._pscAnnouncerChar = this.checkFixAnnouncerChar(pscAnnouncerCharSetting);
        }

        const pscExchangeAnnouncerCharSetting = this._coreSettings.symbol_PscExchangeAnnouncerChar;
        if (pscExchangeAnnouncerCharSetting === undefined) {
            this._pscExchangeAnnouncerChar = SymbolsService.defaultPscExchangeAnnouncerChar;
        } else {
            this._pscExchangeAnnouncerChar = this.checkFixAnnouncerChar(pscExchangeAnnouncerCharSetting);
        }

        const pscMarketSeparatorCharSetting = this._coreSettings.symbol_PscMarketAnnouncerChar;
        if (pscMarketSeparatorCharSetting === undefined) {
            this._pscMarketAnnouncerChar = SymbolsService.defaultPscMarketSeparatorChar;
        } else {
            this._pscMarketAnnouncerChar = this.checkFixAnnouncerChar(pscMarketSeparatorCharSetting);
        }

        const pscExchangeHideModeIdSetting = this._coreSettings.symbol_PscExchangeHideModeId;
        if (pscExchangeHideModeIdSetting === undefined) {
            this._pscExchangeHideModeId = SymbolsService.defaultPscExchangeHideModeId;
        } else {
            const exchangeHideModeId = SymbolsService.ExchangeHideMode.tryJsonValueToId(pscExchangeHideModeIdSetting);
            if (exchangeHideModeId === undefined) {
                this._pscExchangeHideModeId = SymbolsService.defaultPscExchangeHideModeId;
            } else {
                this._pscExchangeHideModeId = exchangeHideModeId;
            }
        }

        const pscDefaultMarketHiddenSetting = this._coreSettings.symbol_PscDefaultMarketHidden;
        if (pscDefaultMarketHiddenSetting === undefined) {
            this._pscDefaultMarketHidden = SymbolsService.defaultPscDefaultMarketHidden;
        } else {
            this._pscDefaultMarketHidden = pscDefaultMarketHiddenSetting;
        }

        const pscMarketCodeAsLocalWheneverPossible = this._coreSettings.symbol_PscMarketCodeAsLocalWheneverPossible;
        if (pscMarketCodeAsLocalWheneverPossible === undefined) {
            this._pscMarketCodeAsLocalWheneverPossible = SymbolsService.defaultPscMarketCodeAsLocalWheneverPossible;
        } else {
            this._pscMarketCodeAsLocalWheneverPossible = pscMarketCodeAsLocalWheneverPossible;
        }

        this.updateDefaultParseModeId();
    }

    private updateDefaultParseModeId() {
        if (!this._defaultParseModeAuto) {
            this._defaultParseModeId = this._explicitDefaultParseModeId;
        } else {
            // move to extension
            // if (EikonUtils.isEikonEnvironment()) {
            //     this._defaultParseModeId = SymbolsManager.ParseModeId.Ric;
            // } else {
                this._defaultParseModeId = SymbolsService.ParseModeId.Psc;
            // }
        }
    }

    private calculateParseMode(value: string): SymbolsService.CalculatedParseModeId {
        if (value.length === 0) {
            return SymbolsService.CalculatedParseModeId.createInvalid(Strings[StringId.Blank]);
        } else {
            switch (value[0]) {
                // case this._ricAnnouncerChar:
                //     if (value.length < 2) {
                //         return SymbolsManager.CalculatedParseModeId.createInvalid(Strings[StringId.InsufficientCharacters]);
                //     } else {
                //         return SymbolsManager.CalculatedParseModeId.createValid(SymbolsManager.ParseModeId.Ric, value.substr(1));
                //     }

                case this._pscAnnouncerChar:
                    if (value.length < 2) {
                        return SymbolsService.CalculatedParseModeId.createInvalid(Strings[StringId.InsufficientCharacters]);
                    } else {
                        return SymbolsService.CalculatedParseModeId.createValid(SymbolsService.ParseModeId.Psc, value.substr(1));
                    }

                default:
                    // move to extension
                    switch (this._defaultParseModeId) {
                        // case SymbolsManager.ParseModeId.Ric:
                        //     return SymbolsManager.CalculatedParseModeId.createValid(SymbolsManager.ParseModeId.Ric, value);
                        case SymbolsService.ParseModeId.Psc:
                            return SymbolsService.CalculatedParseModeId.createValid(SymbolsService.ParseModeId.Psc, value);
                        default:
                            throw new UnreachableCaseError('SMCPMDDD399467', this._defaultParseModeId);
                    }
            }
        }
    }

    // move to extension
    // private ricNotNullLitIvemIdToDisplay(litIvemId: LitIvemId) {
    //     if (litIvemId.ric !== undefined) {
    //         return litIvemId.ric;
    //     } else {
    //         const possibleRic = EikonUtils.notNullLitIvemIdToRic(litIvemId);
    //         if (possibleRic === undefined) {
    //             return '';
    //         } else {
    //             return possibleRic;
    //         }
    //     }
    // }

    private pscNotNullCodeExchangeIdMarketIdToDisplay(code: string, exchangeId: ExchangeId, marketId: MarketId,
        exchangeHideModeId: SymbolsService.ExchangeHideMode.Id, defaultMarketHidden: boolean): string {
        let displayMarketAsLocal: boolean;
        let marketHidden: boolean;
        if (defaultMarketHidden && marketId === this.getDefaultMarketId(exchangeId)) {
            marketHidden = true;
            displayMarketAsLocal = false; // actually may be local but since market is hidden we dont care
        } else {
            marketHidden = false;
            const localMarkets = ExchangeInfo.idToLocalMarkets(exchangeId);
            displayMarketAsLocal = this._pscMarketCodeAsLocalWheneverPossible && localMarkets.includes(marketId);
        }

        switch (exchangeHideModeId) {
            case SymbolsService.ExchangeHideModeId.Never: {
                if (marketHidden) {
                    return code + this.pscExchangeAnnouncerChar + this._pscExchangeDisplayCodeMap.get(exchangeId);
                } else {
                    return code + this.pscExchangeAnnouncerChar +
                        this._pscExchangeDisplayCodeMap.get(exchangeId) + this.pscMarketSeparatorChar +
                        this._pscMarketMap.getCode(marketId, displayMarketAsLocal);
                }
            }

            case SymbolsService.ExchangeHideModeId.Default: {
                let result: string;
                if (exchangeId === this.defaultExchangeId) {
                    result = code;
                } else {
                    result = code + this.pscExchangeAnnouncerChar +
                        this._pscExchangeDisplayCodeMap.get(exchangeId);
                }

                if (!marketHidden) {
                    result = result + this.pscMarketSeparatorChar + this._pscMarketMap.getCode(marketId, displayMarketAsLocal);
                }

                return result;
            }

            case SymbolsService.ExchangeHideModeId.WheneverPossible: {
                let result: string;
                const isDefaultExchange = exchangeId === this.defaultExchangeId;
                const exchangeHidden = !marketHidden || isDefaultExchange;
                if (exchangeHidden) {
                    result = code;
                } else {
                    result = code + this.pscExchangeAnnouncerChar +
                        this._pscExchangeDisplayCodeMap.get(exchangeId);
                }

                if (!marketHidden) {
                    const marketCode = this._pscMarketMap.getCode(marketId, displayMarketAsLocal && isDefaultExchange);
                    result = result + this.pscMarketSeparatorChar + marketCode;
                }
                return result;
            }

            default:
                throw new UnreachableCaseError('SMPNNCSIMITD38846', exchangeHideModeId);
        }
    }

    private pscNotNullLitIvemIdToDisplay(litIvemId: LitIvemId, nothingHidden: boolean) {
        if (nothingHidden) {
            return this.pscNotNullCodeExchangeIdMarketIdToDisplay(litIvemId.code, litIvemId.exchangeId, litIvemId.litId,
                SymbolsService.ExchangeHideModeId.Never, false);
        } else {
            return this.pscNotNullCodeExchangeIdMarketIdToDisplay(litIvemId.code, litIvemId.exchangeId, litIvemId.litId,
                this._pscExchangeHideModeId, this._pscDefaultMarketHidden);
        }
    }

    private isValidCode(code: string, exchangeId: ExchangeId) {
        switch (exchangeId) {
            case ExchangeId.Myx: {
                const codeCharCount = code.length;
                if (codeCharCount < 4) {
                    return false;
                } else {
                    for (let i = 0; i < 4; i++) {
                        const charCode = code.charCodeAt(i);
                        if (!isDigit(charCode)) {
                            return false;
                        }
                    }
                    return true;
                }
            }
            case ExchangeId.Asx: {
                return code.length >= 3;
            }
            case ExchangeId.Ptx: {
                return code.length >= 3;
            }
            case ExchangeId.Fnsx: {
                return code.length >= 3;
            }
            default:
                return false;
        }
    }
}

export namespace SymbolsService {
    // move to extension
    export const enum ParseModeId {
        // Ric,
        Psc,
    }

    export const enum ExchangeHideModeId {
        Never,
        Default,
        WheneverPossible
    }

    export const defaultDefaultParseModeAuto = true;
    export const defaultExplicitParseModeId = ParseModeId.Psc;
    export const defaultPromptDefaultSymbolSourceIfRicParseModeId = false;
    export const defaultRicAnnouncerChar = ']';
    export const defaultPscAnnouncerChar = '{';
    export const defaultPscExchangeAnnouncerChar = '.';
    export const defaultPscMarketSeparatorChar = '@';
    export const defaultPscExchangeHideModeId = ExchangeHideModeId.WheneverPossible;
    export const defaultPscDefaultMarketHidden = true;
    export const defaultPscMarketCodeAsLocalWheneverPossible = true;
    export const defaultAutoSelectDefaultMarketDest = true;

    export type AllowedMarketIdsChangedEventHandler = (this: void) => void;
    export type AllowedExchangeIdsChangedEventHandler = (this: void) => void;

    export interface LitIvemIdParseDetails {
        success: boolean;
        litIvemId: LitIvemId | undefined;
        isRic: boolean;
        sourceIdExplicit: boolean;
        marketIdExplicit: boolean;
        errorText: string;
        value: string;
    }

    export namespace LitIvemIdParseDetails {
        export function createFail(value: string, errorText: string) {
            const result: LitIvemIdParseDetails = {
                success: false,
                litIvemId: LitIvemId.createFromCodeMarket(LitIvemId.nullCode, MarketInfo.nullId),
                isRic: false,
                sourceIdExplicit: false,
                marketIdExplicit: false,
                errorText,
                value
            };
            return result;
        }
        export function createUndefinedSuccess(value: string) {
            const result: LitIvemIdParseDetails = {
                success: true,
                litIvemId: undefined,
                isRic: false,
                sourceIdExplicit: false,
                marketIdExplicit: false,
                errorText: '',
                value,
            };
            return result;
        }
    }

    export interface IvemIdParseDetails {
        success: boolean;
        ivemId: IvemId | undefined;
        sourceIdExplicit: boolean;
        errorText: string;
        value: string;
    }

    export namespace IvemIdParseDetails {
        export function createFail(value: string, errorText: string) {
            const result: IvemIdParseDetails = {
                success: false,
                ivemId: undefined,
                sourceIdExplicit: false,
                errorText,
                value
            };
            return result;
        }
        export function createUndefinedSuccess() {
            const result: IvemIdParseDetails = {
                success: true,
                ivemId: undefined,
                sourceIdExplicit: false,
                errorText: '',
                value: ''
            };
            return result;
        }
    }

    export interface RoutedIvemIdParseDetails {
        success: boolean;
        routedIvemId: RoutedIvemId | undefined;
        sourceIdExplicit: boolean;
        orderRouteExplicit: boolean;
        errorText: string;
        value: string;
    }

    export namespace RoutedIvemIdParseDetails {
        export function createFail(value: string, errorText: string) {
            const result: RoutedIvemIdParseDetails = {
                success: false,
                routedIvemId: undefined,
                sourceIdExplicit: false,
                orderRouteExplicit: false,
                errorText,
                value,
            };
            return result;
        }
        export function createUndefinedSuccess() {
            const result: RoutedIvemIdParseDetails = {
                success: true,
                routedIvemId: undefined,
                sourceIdExplicit: false,
                orderRouteExplicit: false,
                errorText: '',
                value: '',
            };
            return result;
        }
        export function createFromLitIvemIdParseDetails(litDetails: LitIvemIdParseDetails) {
            const litIvemId = litDetails.litIvemId;
            let routedIvemId: RoutedIvemId | undefined;
            if (litIvemId === undefined) {
                routedIvemId = undefined;
            } else {
                const ivemId = litIvemId.ivemId;
                const litId = litIvemId.litId;
                const route = new MarketOrderRoute(litId);
                routedIvemId = new RoutedIvemId(ivemId, route);
            }
            const result: RoutedIvemIdParseDetails = {
                success: litDetails.success,
                routedIvemId,
                sourceIdExplicit: litDetails.sourceIdExplicit,
                orderRouteExplicit: litDetails.marketIdExplicit,
                errorText: litDetails.errorText,
                value: litDetails.value,
            };

            return result;
        }
    }

    export class CalculatedParseModeId {
        valid: boolean;
        id: ParseModeId;
        parseText: string;
        errorText: string;
    }

    export namespace CalculatedParseModeId {
        export function createInvalid(errorText: string) {
            const result = new CalculatedParseModeId();
            result.valid = false;
            result.errorText = errorText;
            return result;
        }

        export function createValid(id: ParseModeId, text: string) {
            const result = new CalculatedParseModeId();
            result.valid = true;
            result.id = id;
            result.parseText = text;
            return result;
        }
    }

    export namespace ParseMode {
        export type Id = ParseModeId;

        interface Info {
            readonly id: Id;
            readonly jsonValue: string;
            readonly display: string;
        }

        type InfosObject = { [id in keyof typeof ParseModeId]: Info };

        // move to extension
        const infosObject: InfosObject = {
            // Ric: { id: ParseModeId.Ric,
            //     jsonValue: 'ric',
            //     display: 'ric',
            // },
            Psc: { id: ParseModeId.Psc,
                jsonValue: 'psc',
                display: 'psc',
            }
        };

        export const idCount = Object.keys(infosObject).length;

        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('SymbolsManager.ParseModeId', outOfOrderIdx, infos[outOfOrderIdx].jsonValue);
            }
        }

        export function getAll(): Id[] {
            return infos.map(info => info.id);
        }

        export function idToDisplay(id: Id): string {
            return infos[id].display;
        }

        export function idToJsonValue(id: Id): string {
            return infos[id].jsonValue;
        }

        export function jsonValueToId(value: string): Id {
            const index = infos.findIndex(info => info.jsonValue === value);
            if (index >= 0) {
                return infos[index].id;
            } else {
                throw new JsonLoadError(ExternalError.Code.SymbolsServiceParseModeJsonValueToId, value);
            }
        }

        export function tryJsonValueToId(value: string): Id | undefined {
            const index = infos.findIndex(info => info.jsonValue === value);
            return index >= 0 ? infos[index].id : undefined;
        }
    }

    export namespace ExchangeHideMode {
        export type Id = ExchangeHideModeId;

        interface Info {
            readonly id: Id;
            readonly jsonValue: string;
            readonly displayId: StringId;
            readonly descriptionId: StringId;
        }

        type InfosObject = { [id in keyof typeof ExchangeHideModeId]: Info };

        const infosObject: InfosObject = {
            Never: { id: ExchangeHideModeId.Never,
                jsonValue: 'never',
                displayId: StringId.SymbolExchangeHideModeDisplay_Never,
                descriptionId: StringId.SymbolExchangeHideModeDescription_Never,
            },
            Default: { id: ExchangeHideModeId.Default,
                jsonValue: 'default',
                displayId: StringId.SymbolExchangeHideModeDisplay_Default,
                descriptionId: StringId.SymbolExchangeHideModeDescription_Default,
            },
            WheneverPossible: { id: ExchangeHideModeId.WheneverPossible,
                jsonValue: 'wheneverPossible',
                displayId: StringId.SymbolExchangeHideModeDisplay_WheneverPossible,
                descriptionId: StringId.SymbolExchangeHideModeDescription_WheneverPossible,
            },
        };

        export const idCount = Object.keys(infosObject).length;

        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('SymbolsManager.ExchangeHideMode', outOfOrderIdx, infos[outOfOrderIdx].jsonValue);
            }
        }

        export function getAll() {
            return infos.map(info => info.id);
        }

        export function idToDisplayId(id: Id) {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id) {
            return Strings[idToDisplayId(id)];
        }

        export function idToDescriptionId(id: Id) {
            return infos[id].descriptionId;
        }

        export function idToDescription(id: Id) {
            return Strings[idToDescriptionId(id)];
        }

        export function idToJsonValue(id: Id): string {
            return infos[id].jsonValue;
        }

        export function jsonValueToId(value: string): Id {
            const index = infos.findIndex(info => info.jsonValue === value);
            if (index >= 0) {
                return infos[index].id;
            } else {
                throw new JsonLoadError(ExternalError.Code.SymbolsServiceExchangeHideModeJsonValueToId, value);
            }
        }

        export function tryJsonValueToId(value: string): Id | undefined {
            const index = infos.findIndex(info => info.jsonValue === value);
            return index >= 0 ? infos[index].id : undefined;
        }

    }

    interface PscExchangeRec {
        id: ExchangeId;
        code: string;
        upper: string;
    }

    export class PscExchangeDisplayCodeMap {
        private mapArray = new Array<PscExchangeRec>(ExchangeInfo.idCount);

        constructor() {
            // in future, get from Settings using below as default
            for (let id = 0; id < ExchangeInfo.idCount; id++) {
                const code = ExchangeInfo.idToDefaultPscCode(id);

                this.mapArray[id] = {
                    id,
                    code,
                    upper: code.toUpperCase(),
                };
            }
        }

        get(id: ExchangeId) {
            return this.mapArray[id].code;
        }

        findId(upperCode: string): ExchangeId | undefined {
            const idx = this.mapArray.findIndex((rec) => rec.upper === upperCode);
            return idx >= 0 ? idx : undefined;
        }
    }

    interface PscMarketRec {
        id: MarketId;
        globalCode: string;
        upperGlobalCode: string;
        localCode: string;
        upperLocalCode: string;
        supportedExchanges: ExchangeId[];
    }

    export class PscMarketMap {
        private _mapArray = new Array<PscMarketRec>(MarketInfo.idCount);

        constructor() {
            // in future, get from Settings using below as default
            for (let id = 0; id < MarketInfo.idCount; id++) {
                const globalCode = MarketInfo.idToDefaultPscGlobalCode(id);
                const localCode = MarketInfo.idToDefaultExchangeLocalCode(id);
                this._mapArray[id] = {
                    id,
                    globalCode,
                    upperGlobalCode: globalCode.toUpperCase(),
                    localCode,
                    upperLocalCode: localCode.toUpperCase(),
                    supportedExchanges: concatenateArrayUniquely([MarketInfo.idToExchangeId(id)], MarketInfo.idToSupportedExchanges(id))
                };
            }
        }

        getGlobalCode(id: MarketId) {
            return this._mapArray[id].globalCode;
        }

        getUpperLocalCode(id: MarketId) {
            return this._mapArray[id].upperLocalCode;
        }

        getCode(id: MarketId, local: boolean) {
            const rec = this._mapArray[id];
            return local ? rec.localCode : rec.globalCode;
        }

        findId(upperGlobalCode: string) {
            const count = this._mapArray.length;
            for (let i = 0; i < count; i++) {
                const rec = this._mapArray[i];
                if (rec.upperGlobalCode === upperGlobalCode) {
                    return rec.id;
                }
            }
            return undefined;
        }

        getSupportedExchanges(id: MarketId) {
            return this._mapArray[id].supportedExchanges;
        }
    }

    export function initialiseStatic() {
        ParseMode.initialise();
        ExchangeHideMode.initialise();
    }
}

export namespace SymbolsManagerModule {
    export function initialiseStatic() {
        SymbolsService.initialiseStatic();
    }
}
