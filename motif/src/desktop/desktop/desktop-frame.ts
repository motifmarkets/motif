/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { SafeResourceUrl } from '@angular/platform-browser';
import {
    AdiService,
    AppStorageService,
    AssertInternalError,
    BrokerageAccountGroup,
    Command,
    CommandContext,
    CommandRegisterService,
    CommandUiAction,
    ExtensionHandle,
    Integer,
    InternalCommand,
    Json,
    JsonElement,
    JsonValue,
    KeyboardService,
    LitIvemId,
    Logger,
    MarketOrderId,
    MultiEvent,
    OrderPad,
    OrderRequestTypeId,
    SettingsService,
    SingleBrokerageAccountGroup,
    StringId,
    Strings,
    SuccessOrErrorText,
    SuccessOrErrorText_Success,
    SymbolsService,
    UiAction,
    UserAlertService
} from '@motifmarkets/motif-core';
import { SignOutService } from 'component-services-internal-api';
import { ExtensionsAccessService } from 'content-internal-api';
import { MenuBarService } from 'controls-internal-api';
import { BuiltinDitemFrame, DesktopAccessService, DitemFrame, ExtensionDitemFrame, OrderRequestDitemFrame } from 'ditem-internal-api';
import { BuiltinDitemNgComponentBaseDirective } from 'ditem-ng-api';
import { LayoutConfig } from 'golden-layout';
import { AppFeature } from 'src/app.feature';
import { BrandingSplashWebPageDitemFrame } from 'src/ditem/web-page-ditem/branding-splash/branding-splash-web-page-ditem-frame';
import { GoldenLayoutHostFrame } from '../golden-layout-host/golden-layout-host-frame';

export class DesktopFrame implements DesktopAccessService {
    private static readonly XmlTag_HistoricalAccountIds = 'HistoricalAccountIds';
    private static readonly DefaultMaxHistoricalAccountIdCount = 15;

    initialLoadedEvent: DesktopAccessService.InitialLoadedEvent;

    private _goldenLayoutHostFrame: GoldenLayoutHostFrame;

    private _activeLayoutName: string | undefined;

    private _frames: DitemFrame[] = [];
    private _primaryFrames: DitemFrame[] = [];

    private _litIvemId: LitIvemId | undefined;
    private _litIvemIdAppLinked = false;
    private _brokerageAccountGroup: BrokerageAccountGroup | undefined;
    private _brokerageAccountGroupAppLinked = false;

    private _lastSingleBrokerageAccountGroup: SingleBrokerageAccountGroup | undefined;

    private _brokerageAccountGroupOrLitIvemIdSettingCount: Integer = 0;

    private _historicalAccountIds: string[] = [];
    private _maxHistoricalAccountIdCount: Integer = DesktopFrame.DefaultMaxHistoricalAccountIdCount;

    private _lastFocusedFrame: DitemFrame | undefined;
    private _lastFocusedLitIvemId: LitIvemId | undefined;
    private _lastFocusedBrokerageAccountGroup: BrokerageAccountGroup | undefined;
    private _lastFocusedSingleBrokerageAccountGroup: BrokerageAccountGroup | undefined;

    private _prevFocusedFrame: DitemFrame | undefined;
    private _prevFrameLastFocusedLitIvemId: LitIvemId | undefined;
    private _prevFrameLastFocusedBrokerageAccountGroup: BrokerageAccountGroup | undefined;
    private _prevFrameLastFocusedSingleBrokerageAccountGroup: BrokerageAccountGroup | undefined;

    private _saveLayoutLitIvemIdsAndBrokerageAccountGroups = true;

    private _litIvemIdChangeMultiEvent = new MultiEvent<DesktopFrame.LitIvemIdChangeEventHandler>();
    private _BrokerageAccountGroupChangeMultiEvent = new MultiEvent<DesktopFrame.BrokerageAccountGroupChangeEventHandler>();

    private _commandContext: CommandContext;

    private _newPlaceholderDitemUiAction: CommandUiAction;
    private _newExtensionsDitemUiAction: CommandUiAction;
    private _newSymbolsDitemUiAction: CommandUiAction;
    private _newDepthAndTradesDitemUiAction: CommandUiAction;
    private _newWatchlistDitemUiAction: CommandUiAction;
    private _newDepthDitemUiAction: CommandUiAction;
    private _newNewsHeadlinesDitemUiAction: CommandUiAction;
    private _newNewsBodyDitemUiAction: CommandUiAction;
    private _newAlertsDitemUiAction: CommandUiAction;
    private _newSearchDitemUiAction: CommandUiAction;
    private _newAdvertWebPageDitemUiAction: CommandUiAction;
    private _newTopShareholdersDitemUiAction: CommandUiAction;
    private _newStatusDitemUiAction: CommandUiAction;
    private _newTradesDitemUiAction: CommandUiAction;
    private _newOrderRequestDitemUiAction: CommandUiAction;
    private _newBrokerageAccountsDitemUiAction: CommandUiAction;
    private _newOrdersDitemUiAction: CommandUiAction;
    private _newHoldingsDitemUiAction: CommandUiAction;
    private _newBalancesDitemUiAction: CommandUiAction;
    private _newSettingsDitemUiAction: CommandUiAction;
    private _newEtoPriceQuotationDitemUiAction: CommandUiAction;

    private _newBuyOrderRequestDitemUiAction: CommandUiAction;
    private _newSellOrderRequestDitemUiAction: CommandUiAction;

    private _saveLayoutUiAction: CommandUiAction;
    private _resetLayoutUiAction: CommandUiAction;
    private _signOutUiAction: CommandUiAction;

    private _newExtensionsDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newSymbolsDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newDepthAndTradesDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newWatchlistDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newDepthDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newNewsHeadlinesDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newAlertsDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newSearchDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newAdvertWebPageDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newStatusDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newTradesDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newBrokerageAccountsDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newOrdersDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newHoldingsDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newBalancesDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newSettingsDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newBuyOrderRequestDitemMenuItem: MenuBarService.CommandMenuItem;
    private _newSellOrderRequestDitemMenuItem: MenuBarService.CommandMenuItem;
    private _saveLayoutMenuItem: MenuBarService.CommandMenuItem;
    private _resetLayoutMenuItem: MenuBarService.CommandMenuItem;

    private _requestGlobalLinkedLitIvemIdEvent: DesktopFrame.RequestAppLinkedLitIvemIdEvent;
    private _requestGlobalLinkedBrokerageAccountGroupEvent: DesktopFrame.RequestAppLinkedBrokerageAccountGroupEvent;

    private _newDisplayEvent: DesktopFrame.TNewDisplayEvent;
    private _openDisplayEvent: DesktopFrame.TOpenDisplayEvent;
    private _closeDisplayEvent: DesktopFrame.TCloseDisplayEvent;
    private _printDesktopEvent: DesktopFrame.TPrintDesktopEvent;

    private _litIvemIdChangedEvent = new DesktopFrame.TLitIvemIdChangedEvent();

    // editOrderRequestFromMarketOrderIdEvent: DesktopFrame.EditOrderRequestFromMarketOrderIdEvent;

    constructor(
        frameHtmlElement: HTMLElement,
        private readonly _settingsService: SettingsService,
        private readonly _storage: AppStorageService,
        private readonly _userAlertService: UserAlertService,
        private readonly _extensionsAccessService: ExtensionsAccessService,
        private readonly _symbolsService: SymbolsService,
        private readonly _adiService: AdiService,
        private readonly _signOutService: SignOutService,
        private readonly _menuBarService: MenuBarService,
        private readonly _commandRegisterService: CommandRegisterService,
        private readonly _keyboardService: KeyboardService,
        private readonly _startupSplashWebPageSafeResourceUrl: SafeResourceUrl | undefined,
        private readonly _getBuiltinDitemFrameFromComponent: DesktopFrame.GetBuiltinDitemFrameFromComponent,
    ) {
        this._commandContext = this.createCommandContext(frameHtmlElement);
        this.createUiActions();
    }

    get historicalAccountIds(): string[] { return this._historicalAccountIds; }
    get FrameCount(): Integer { return this.getFrameCount(); }

    get litIvemId() { return this._litIvemId; }
    get brokerageAccountGroup() { return this._brokerageAccountGroup; }

    get lastSingleBrokerageAccountGroup() { return this._lastSingleBrokerageAccountGroup; }

    get lastFocusedLitIvemIdValid() { return this.getLastFocusedLitIvemIdValid(); }
    get lastFocusedLitIvemId() { return this._lastFocusedLitIvemId; }

    get prevFrameLastFocusedLitIvemIdValid() { return this.getPrevFrameLastFocusedLitIvemIdValid(); }
    get PrevFrameLastFocusedLitIvemId() { return this._prevFrameLastFocusedLitIvemId; }

    get lastFocusedAccountAggregationValid() { return this.getLastFocusedAccountIdValid(); }
    get lastFocusedBrokerageAccountGroup() { return this._lastFocusedBrokerageAccountGroup; }

    get prevFrameLastFocusedBrokerageAccountGroupValid() { return this._prevFrameLastFocusedBrokerageAccountGroup !== undefined; }
    get prevFrameLastFocusedBrokerageAccountGroup() { return this._prevFrameLastFocusedBrokerageAccountGroup; }

    get prevFrameLastFocusedSingleBrokerageAccountGroupValid() {
        return this._prevFrameLastFocusedSingleBrokerageAccountGroup !== undefined;
    }
    get prevFrameLastFocusedSingleBrokerageAccountGroup() { return this._prevFrameLastFocusedSingleBrokerageAccountGroup; }

    get lastFocusedSingleBrokerageAccountGroupValid() { return this._lastFocusedSingleBrokerageAccountGroup !== undefined; }
    get lastFocusedSingleBrokerageAccountGroup() { return this._lastFocusedSingleBrokerageAccountGroup; }

    get brokerageAccountGroupOrLitIvemIdSetting(): boolean { return this._brokerageAccountGroupOrLitIvemIdSettingCount > 0; }

    get menuBarService() { return this._menuBarService; }

    get litIvemIdAppLinked() { return this._litIvemIdAppLinked; }
    set litIvemIdAppLinked(value: boolean) { this.setLitIvemIdAppLinked(value); }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get accountAggregationAppLinked(): boolean { return this._brokerageAccountGroupAppLinked; }
    set accountAggregationAppLinked(value: boolean) { this.setAccountAggregationAppLinked(value); }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get saveLayoutLitIvemIdsAndAccountAggregations(): boolean { return this._saveLayoutLitIvemIdsAndBrokerageAccountGroups; }
    set saveLayoutLitIvemIdsAndAccountAggregations(value: boolean) { this._saveLayoutLitIvemIdsAndBrokerageAccountGroups = value; }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public get litIvemIdChangedEvent(): DesktopFrame.TLitIvemIdChangedEvent { return this._litIvemIdChangedEvent; }
    public set litIvemIdChangedEvent(value: DesktopFrame.TLitIvemIdChangedEvent) { this._litIvemIdChangedEvent = value; }

    async initialise(goldenLayoutHostFrame: GoldenLayoutHostFrame) {
        this._goldenLayoutHostFrame = goldenLayoutHostFrame;

        this.connectMenuBarItems();

        const loadPromise = this.loadLayout(DesktopFrame.mainLayoutName);
        loadPromise.then(
            (success) => {
                if (!success) {
                    // layout does not exist
                    this._goldenLayoutHostFrame.loadDefaultLayout();
                }
                this.checkLoadBrandingSplashWebPage();
                this.notifInitialLoaded();
            },
            (reason) => {
                Logger.logWarning(`Error loading layout "${DesktopFrame.mainLayoutName}": "${reason}". Resetting Layout`);
                this._goldenLayoutHostFrame.resetLayout();
                this.checkLoadBrandingSplashWebPage();
                this.notifInitialLoaded();
            }
        );
    }

    finalise() {
        this.disconnectMenuBarItems();
        this.finaliseUiActions();
    }

    registerFrame(frame: DitemFrame) {
        this._frames.push(frame);
    }

    deleteFrame(frame: DitemFrame) {
        if (frame.primary) {
            const ditemTypeId = frame.ditemTypeId;
            const primaryIdx = this.indexOfPrimaryFrame(ditemTypeId);
            if (primaryIdx < 0) {
                throw new AssertInternalError('DFDFP57200009');
            } else {
                this._primaryFrames.splice(primaryIdx, 1);
            }
        }
        const idx = this.indexOfFrame(frame);
        if (idx < 0) {
            throw new AssertInternalError('DFDFF57200009');
        } else {
            this._frames.splice(idx, 1);
        }
    }

    indexOfFrame(value: DitemFrame): Integer {
        return this._frames.findIndex((frame: DitemFrame) => frame === value);
    }

    newDisplay(SenderFrame: DitemFrame, typeId: BuiltinDitemFrame.BuiltinTypeId /*, TargetPanel: TaqCustomDockingControl*/): DitemFrame {
        return this._newDisplayEvent(SenderFrame, typeId);
    }

    openDisplay(SenderFrame: DitemFrame, TypeId: BuiltinDitemFrame.BuiltinTypeId, ALitIvemId: LitIvemId) {
        this._openDisplayEvent(SenderFrame, TypeId, /*TargetPanel,*/ ALitIvemId);
    }

    notifyCloseDisplay(Frame: DitemFrame) {
        this._closeDisplayEvent(Frame);
    }

    notifyDestroyFrame(Frame: DitemFrame) {
        if (Frame === this._prevFocusedFrame) {
            this._prevFrameLastFocusedLitIvemId = undefined;
            this._prevFrameLastFocusedBrokerageAccountGroup = undefined;
            this._prevFrameLastFocusedSingleBrokerageAccountGroup = undefined;
            this._prevFocusedFrame = undefined;
        }

        if (Frame === this._lastFocusedFrame) {
            this.clearLastFocusedLitIvemId();
            this.clearLastFocusedBrokerageAccountGroup();
            this._lastFocusedSingleBrokerageAccountGroup = undefined;
        }
    }


    printDesktop() {
        this._printDesktopEvent();
    }

    public notifyDitemFramePrimaryChanged(frame: DitemFrame) {
        const ditemTypeId = frame.ditemTypeId;
        const idx = this.indexOfPrimaryFrame(ditemTypeId);
        if (idx < 0) {
            if (frame.primary) {
                this._primaryFrames.push(frame);
            } else {
                throw new AssertInternalError('DNDFPCN33448867'); // not found
            }
        } else {
            const existingPrimaryFrame = this._primaryFrames[idx];
            if (frame.primary) {
                if (existingPrimaryFrame === frame) {
                    throw new AssertInternalError('DNDFPCE6511094'); // not a change
                } else {
                    existingPrimaryFrame.primary = false; // will remove from array with re-entrancy
                    this._primaryFrames.push(frame);
                }
            } else {
                if (existingPrimaryFrame !== frame) {
                    throw new AssertInternalError('DNDFPCM6511094'); // must have been more than one
                } else {
                    existingPrimaryFrame.primary = false; // will remove from array with re-entrancy
                    this._primaryFrames.splice(idx, 1);
                }
            }
        }
    }

    setBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, initiatingFrame: DitemFrame | undefined) {
        if (!BrokerageAccountGroup.isUndefinableEqual(group, this._brokerageAccountGroup)) {
            this.beginBrokerageAccountGroupOrLitIvemIdSetting();
            try {
                this._brokerageAccountGroup = group;

                if (this._brokerageAccountGroup !== undefined && BrokerageAccountGroup.isSingle(this._brokerageAccountGroup)) {
                    this._lastSingleBrokerageAccountGroup = this._brokerageAccountGroup;
                }

                for (const frame of this._frames) {
                    if (frame.brokerageAccountGroupLinked) {
                        frame.setBrokerageAccountGroupFromDesktop(group, initiatingFrame);
                    }
                }

                this.notifyAccountIdChange(initiatingFrame);
            } finally {
                this.endBrokerageAccountGroupOrLitIvemIdSetting();
            }
        }
    }

    clearBrokerageAccountGroup(InitiatingFrame: DitemFrame) {
        this.setBrokerageAccountGroup(undefined, InitiatingFrame);
    }

    initialiseLitIvemId(litIvemId: LitIvemId) {
        this._litIvemId = litIvemId;
    }

    setLitIvemId(litIvemId: LitIvemId | undefined, initiatingFrame: DitemFrame | undefined) {
        if (!LitIvemId.isUndefinableEqual(litIvemId, this._litIvemId)) {
            this.beginBrokerageAccountGroupOrLitIvemIdSetting();
            try {
                this._litIvemId = litIvemId;

                for (const frame of this._frames) {
                    if (frame.litIvemIdLinked) {
                        frame.setLitIvemIdFromDesktop(litIvemId, initiatingFrame);
                    }
                }

                this._litIvemIdChangedEvent.trigger(litIvemId, initiatingFrame);
            } finally {
                this.endBrokerageAccountGroupOrLitIvemIdSetting();
            }
        }
    }

    clearLitIvemId(initiatingFrame: DitemFrame | undefined) {
        this.setLitIvemId(undefined, initiatingFrame);
    }


    beginBrokerageAccountGroupOrLitIvemIdSetting() {
        this._brokerageAccountGroupOrLitIvemIdSettingCount++;
    }

    endBrokerageAccountGroupOrLitIvemIdSetting() {
        this._brokerageAccountGroupOrLitIvemIdSettingCount--;
    }


    setFocusedFrame(Frame: DitemFrame | undefined) {
        if (this._lastFocusedFrame !== undefined) {
            this._prevFocusedFrame = this._lastFocusedFrame;
            this._prevFrameLastFocusedLitIvemId = this._lastFocusedLitIvemId;
            this._prevFrameLastFocusedBrokerageAccountGroup = this._lastFocusedBrokerageAccountGroup;
            this._prevFrameLastFocusedSingleBrokerageAccountGroup = this._lastFocusedSingleBrokerageAccountGroup;
        }

        if (Frame !== this._lastFocusedFrame) {
            this._lastFocusedFrame = Frame;
            this._lastFocusedLitIvemId = undefined;
            this._lastFocusedBrokerageAccountGroup = undefined;
            this._lastFocusedSingleBrokerageAccountGroup = undefined;
        }
    }

    setLastFocusedLitIvemId(ALitIvemId: LitIvemId) {
        this._lastFocusedLitIvemId = ALitIvemId;
    }

    clearLastFocusedLitIvemId() {
        this._lastFocusedLitIvemId = undefined;
    }

    setLastFocusedBrokerageAccountGroup(group: BrokerageAccountGroup) {
        this._lastFocusedBrokerageAccountGroup = group;

        if (this._lastFocusedBrokerageAccountGroup.isSingle()) {
            this._lastFocusedSingleBrokerageAccountGroup = this._lastFocusedBrokerageAccountGroup;
        }
    }

    clearLastFocusedBrokerageAccountGroup() {
        this._lastFocusedBrokerageAccountGroup = undefined;
    }

    resetLayout() {
        // this._activeLayoutName = undefined;
        // this._goldenLayoutHostFrame.resetLayout();
        this._storage.removeSubNamedItem(AppStorageService.Key.Layout, DesktopFrame.mainLayoutName);
        this._userAlertService.queueAlert(UserAlertService.Alert.Type.Id.ResetLayout, 'Reset Layout');
    }

    createExtensionComponent(extensionHandle: ExtensionHandle, frameTypeName: string, initialState: JsonValue | undefined,
        tabText: string | undefined, preferredLocationId: GoldenLayoutHostFrame.PreferredLocationId | undefined
    ) {
        return this._goldenLayoutHostFrame.createExtensionComponent(extensionHandle,
            frameTypeName, initialState, tabText, preferredLocationId
        );
    }

    destroyExtensionComponent(ditemFrame: ExtensionDitemFrame) {
        this._goldenLayoutHostFrame.destroyExtensionComponent(ditemFrame);
    }

    createPlaceheldExtensionComponents(extensionHandle: ExtensionHandle) {
        this._goldenLayoutHostFrame.createPlaceheldExtensionComponents(extensionHandle);
    }

    placeholdExtensionComponent(ditemFrame: ExtensionDitemFrame, reason: string) {
        this._goldenLayoutHostFrame.placeholdExtensionComponent(ditemFrame, reason);
    }

    createOrderRequestBuiltinComponent(preferredLocationId?: GoldenLayoutHostFrame.PreferredLocationId) {
        const component = this._goldenLayoutHostFrame.createBuiltinComponent(
            BuiltinDitemFrame.BuiltinTypeId.OrderRequest, undefined, preferredLocationId
        );
        const ditemFrame = this._getBuiltinDitemFrameFromComponent(component);
        if (!(ditemFrame instanceof OrderRequestDitemFrame)) {
            throw new AssertInternalError('DFNORDI2252388645');
        } else {
            return ditemFrame;
        }
    }

    loadLayout(name: string): Promise<boolean> {
        // return Promise.resolve(false); // uncomment to force default layout
        const getPromise = this._storage.getSubNamedItem(AppStorageService.Key.Layout, name);
        return getPromise.then(
            (layoutConfigAsStr) => {
                if (layoutConfigAsStr === undefined) {
                    return Promise.resolve(false);
                } else {
                    let successOrErrorText: string | undefined;
                    try {
                        successOrErrorText = this.loadLayoutFromString(layoutConfigAsStr);
                    } catch (e) {
                        successOrErrorText = `${e}`;
                    }
                    if (successOrErrorText !== SuccessOrErrorText_Success) {
                        return Promise.reject(`Load layout "${name}" failure: ${successOrErrorText}`);
                    } else {
                        return Promise.resolve(true);
                    }
                }
            },
            (reason) => Promise.reject(`Storage Get Failure: ${reason}`)
        );
    }

    async saveLayout(name: string) {
        const layoutElement = new JsonElement();
        const goldenLayoutConfig = this._goldenLayoutHostFrame.saveLayout();
        if (this._activeLayoutName !== undefined) {
            layoutElement.setString(DesktopFrame.JsonName.layoutName, this._activeLayoutName);
        }
        layoutElement.setString(DesktopFrame.JsonName.layoutSchemaVersion, DesktopFrame.layoutStateSchemaVersion);
        layoutElement.setJson(DesktopFrame.JsonName.layoutGolden, goldenLayoutConfig as Json);

        const layoutStr = JSON.stringify(layoutElement.json);
        try {
            return await this._storage.setSubNamedItem(AppStorageService.Key.Layout, name, layoutStr);
        } catch (e) {
            Logger.logError(`DesktopService save layout error: ${e}`);
            throw(e);
        }
    }

    addAccountIdToHistory(AAccountId: string) {
        const upperAccountId = AAccountId.toUpperCase();

        const idx = this._historicalAccountIds.findIndex((id: string) => id.toUpperCase() === upperAccountId);
        if (idx >= 0) {
            this._historicalAccountIds.splice(idx, 1);
        }

        if (this._historicalAccountIds.length >= this._maxHistoricalAccountIdCount) {
            this._historicalAccountIds.splice(this._maxHistoricalAccountIdCount - 1);
        }

        this._historicalAccountIds.unshift(AAccountId);
    }

    editOrderRequest(pad: OrderPad) {
        const primaryFrame = this.getPrimaryBuiltinFrame(BuiltinDitemFrame.BuiltinTypeId.OrderRequest);
        if (primaryFrame !== undefined) {
            if (!(primaryFrame instanceof OrderRequestDitemFrame)) {
                throw new AssertInternalError('GLHFEOR233884324');
            } else {
                const orderRequestFrame = primaryFrame as OrderRequestDitemFrame;
                orderRequestFrame.setOrderPad(pad);
                primaryFrame.focus();
            }
        } else {
            const component = this.createOrderRequestBuiltinComponent(GoldenLayoutHostFrame.PreferredLocationId.NextToFocused);
            component.setOrderPad(pad);
            component.focus();
        }
    }

    // editOrderRequestFromMarketOrderId(requestType: OrderRequestTypeId, accountId: BrokerageAccountId, marketOrderId: MarketOrderId) {
    //     this.editOrderRequestFromMarketOrderIdEvent(requestType, accountId, marketOrderId);
    // }

    subscribeLitIvemIdChangeEvent(handler: DesktopFrame.LitIvemIdChangeEventHandler): MultiEvent.DefinedSubscriptionId {
        return this._litIvemIdChangeMultiEvent.subscribe(handler);
    }

    unsubscribeLitIvemIdChangeEvent(id: MultiEvent.SubscriptionId) {
        this._litIvemIdChangeMultiEvent.unsubscribe(id);
    }

    subscribeBrokerageAccountGroupChangeEvent(handler: DesktopFrame.BrokerageAccountGroupChangeEventHandler) {
        return this._BrokerageAccountGroupChangeMultiEvent.subscribe(handler);
    }

    unsubscribeBrokerageAccountGroupChangeEvent(id: MultiEvent.SubscriptionId) {
        this._BrokerageAccountGroupChangeMultiEvent.unsubscribe(id);
    }

    private handleNewDitemUiActionSignal(ditemTypeId: BuiltinDitemFrame.BuiltinTypeId) {
        this._goldenLayoutHostFrame.createBuiltinComponent(ditemTypeId, undefined, undefined);
    }

    private handleNewBuyOrderRequestDitemUiActionSignal() {
        const component = this.createOrderRequestBuiltinComponent();
        const pad = new OrderPad(this._symbolsService, this._adiService);
        pad.loadBuy();
        pad.applySettingsDefaults(this._settingsService.core);
        component.setOrderPad(pad);
    }

    private handleNewSellOrderRequestDitemUiActionSignal() {
        const component = this.createOrderRequestBuiltinComponent();
        const pad = new OrderPad(this._symbolsService, this._adiService);
        pad.loadSell();
        pad.applySettingsDefaults(this._settingsService.core);
        component.setOrderPad(pad);
    }

    private handleSaveLayoutUiActionSignal() {
        this.saveLayout(DesktopFrame.mainLayoutName);
    }

    private handleResetLayoutUiActionSignal() {
        this.resetLayout();
    }

    private handleSignOutUiActionSignal() {
        this._signOutService.signOut();
    }

    private notifInitialLoaded() {
        this.initialLoadedEvent();
    }

    private createCommandContext(htmlElement: HTMLElement) {
        const id: CommandContext.Id = {
            name: 'Desktop',
            extensionHandle: this._extensionsAccessService.internalHandle,
        };

        return new CommandContext(id, StringId.CommandContextDisplay_Root, htmlElement, () => undefined);
    }

    private createUiActions() {
        this._newPlaceholderDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Placeholder);
        this._newExtensionsDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Extensions);
        this._newSymbolsDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Symbols);
        this._newDepthAndTradesDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.DepthAndTrades);
        this._newWatchlistDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Watchlist);
        this._newDepthDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Depth);
        this._newNewsHeadlinesDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.NewsHeadlines);
        this._newNewsBodyDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.NewsBody);
        this._newAlertsDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Alerts);
        this._newSearchDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Search);
        this._newAdvertWebPageDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.AdvertWebPage);
        this._newTopShareholdersDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.TopShareholders);
        this._newStatusDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Status);
        this._newTradesDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Trades);
        this._newOrderRequestDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.OrderRequest);
        this._newBrokerageAccountsDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.BrokerageAccounts);
        this._newOrdersDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Orders);
        this._newHoldingsDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Holdings);
        this._newBalancesDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Balances);
        this._newSettingsDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.Settings);
        this._newEtoPriceQuotationDitemUiAction = this.createNewDitemUiAction(BuiltinDitemFrame.BuiltinTypeId.EtoPriceQuotation);

        const buySellOrderRequestMenuPath = [...DesktopFrame.BuySellOrderRequestParentMenuPath, DesktopFrame.BuySellOrderRequestMenuName];

        this._newBuyOrderRequestDitemUiAction = this.createCommandUiAction(InternalCommand.Id.NewBuyOrderRequestDitem,
            StringId.DitemMenuDisplay_OrderRequest_Buy,
            () => this.handleNewBuyOrderRequestDitemUiActionSignal(),
            {
                menuPath: buySellOrderRequestMenuPath,
                rank: 10000,
            }
        );

        this._newSellOrderRequestDitemUiAction = this.createCommandUiAction(InternalCommand.Id.NewSellOrderRequestDitem,
            StringId.DitemMenuDisplay_OrderRequest_Sell,
            () => this.handleNewSellOrderRequestDitemUiActionSignal(),
            {
                menuPath: buySellOrderRequestMenuPath,
                rank: 20000,
            }
        );

        this._saveLayoutUiAction = this.createCommandUiAction(InternalCommand.Id.SaveLayout,
            StringId.Desktop_SaveLayoutCaption,
            () => this.handleSaveLayoutUiActionSignal(),
            {
                menuPath: [MenuBarService.Menu.Name.Root.tools],
                rank: 30000,
            }
        );
        this._resetLayoutUiAction = this.createCommandUiAction(InternalCommand.Id.ResetLayout,
            StringId.Desktop_ResetLayoutCaption,
            () => this.handleResetLayoutUiActionSignal(),
            {
                menuPath: [MenuBarService.Menu.Name.Root.tools],
                rank: 30000,
            }
        );
        this._signOutUiAction = this.createCommandUiAction(InternalCommand.Id.SignOut,
            StringId.Desktop_SignOutCaption,
            () => this.handleSignOutUiActionSignal()
        );
    }

    private finaliseUiActions() {
        this._newPlaceholderDitemUiAction.finalise();
        this._newExtensionsDitemUiAction.finalise();
        this._newSymbolsDitemUiAction.finalise();
        this._newDepthAndTradesDitemUiAction.finalise();
        this._newWatchlistDitemUiAction.finalise();
        this._newDepthDitemUiAction.finalise();
        this._newNewsHeadlinesDitemUiAction.finalise();
        this._newNewsBodyDitemUiAction.finalise();
        this._newAlertsDitemUiAction.finalise();
        this._newSearchDitemUiAction.finalise();
        this._newAdvertWebPageDitemUiAction.finalise();
        this._newTopShareholdersDitemUiAction.finalise();
        this._newStatusDitemUiAction.finalise();
        this._newTradesDitemUiAction.finalise();
        this._newOrderRequestDitemUiAction.finalise();
        this._newBrokerageAccountsDitemUiAction.finalise();
        this._newOrdersDitemUiAction.finalise();
        this._newHoldingsDitemUiAction.finalise();
        this._newBalancesDitemUiAction.finalise();
        this._newSettingsDitemUiAction.finalise();
        this._newEtoPriceQuotationDitemUiAction.finalise();
        this._newBuyOrderRequestDitemUiAction.finalise();
        this._newSellOrderRequestDitemUiAction.finalise();
        this._saveLayoutUiAction.finalise();
        this._resetLayoutUiAction.finalise();
        this._signOutUiAction.finalise();
    }

    private connectMenuBarItems() {
        this._menuBarService.beginChanges();
        try {
            // Position menus first
            this._menuBarService.positionRootChildMenuItem(MenuBarService.Menu.Name.Root.price, 10000,
                this._extensionsAccessService.internalToExtStringId(StringId.MenuDisplay_Price),
                this._extensionsAccessService.internalToExtStringId(StringId.MenuAccessKey_Price)
            );
            this._menuBarService.positionRootChildMenuItem(MenuBarService.Menu.Name.Root.trading, 20000,
                this._extensionsAccessService.internalToExtStringId(StringId.MenuDisplay_Trading),
                this._extensionsAccessService.internalToExtStringId(StringId.MenuAccessKey_Trading)
            );
            this._menuBarService.positionRootChildMenuItem(MenuBarService.Menu.Name.Root.commands, 30000,
                this._extensionsAccessService.internalToExtStringId(StringId.MenuDisplay_Tools),
                this._extensionsAccessService.internalToExtStringId(StringId.MenuAccessKey_Tools)
            );
            this._menuBarService.positionRootChildMenuItem(MenuBarService.Menu.Name.Root.tools, 40000,
                this._extensionsAccessService.internalToExtStringId(StringId.MenuDisplay_Tools),
                this._extensionsAccessService.internalToExtStringId(StringId.MenuAccessKey_Tools)
            );
            this._menuBarService.positionRootChildMenuItem(MenuBarService.Menu.Name.Root.help, 50000,
                this._extensionsAccessService.internalToExtStringId(StringId.MenuDisplay_Help),
                this._extensionsAccessService.internalToExtStringId(StringId.MenuAccessKey_Help)
            );

            const buySellOrderRequestPosition: MenuBarService.MenuItem.Position = {
                menuPath: DesktopFrame.BuySellOrderRequestParentMenuPath,
                rank: 1000,
            };
            this._menuBarService.positionEmbeddedChildMenu(DesktopFrame.BuySellOrderRequestMenuName, buySellOrderRequestPosition);

            // connect
            this._newExtensionsDitemMenuItem = this._menuBarService.connectMenuItem(this._newExtensionsDitemUiAction);
            this._newSymbolsDitemMenuItem = this._menuBarService.connectMenuItem(this._newSymbolsDitemUiAction);
            this._newDepthAndTradesDitemMenuItem = this._menuBarService.connectMenuItem(this._newDepthAndTradesDitemUiAction);
            this._newWatchlistDitemMenuItem = this._menuBarService.connectMenuItem(this._newWatchlistDitemUiAction);
            this._newDepthDitemMenuItem = this._menuBarService.connectMenuItem(this._newDepthDitemUiAction);
            if (AppFeature.advertising) {
                this._newNewsHeadlinesDitemMenuItem = this._menuBarService.connectMenuItem(this._newNewsHeadlinesDitemUiAction);
                this._newAlertsDitemMenuItem = this._menuBarService.connectMenuItem(this._newAlertsDitemUiAction);
                this._newSearchDitemMenuItem = this._menuBarService.connectMenuItem(this._newSearchDitemUiAction);
                this._newAdvertWebPageDitemMenuItem = this._menuBarService.connectMenuItem(this._newAdvertWebPageDitemUiAction);
            }
            this._newStatusDitemMenuItem = this._menuBarService.connectMenuItem(this._newStatusDitemUiAction);
            this._newTradesDitemMenuItem = this._menuBarService.connectMenuItem(this._newTradesDitemUiAction);
            this._newBrokerageAccountsDitemMenuItem = this._menuBarService.connectMenuItem(this._newBrokerageAccountsDitemUiAction);
            this._newOrdersDitemMenuItem = this._menuBarService.connectMenuItem(this._newOrdersDitemUiAction);
            this._newHoldingsDitemMenuItem = this._menuBarService.connectMenuItem(this._newHoldingsDitemUiAction);
            this._newBalancesDitemMenuItem = this._menuBarService.connectMenuItem(this._newBalancesDitemUiAction);
            this._newSettingsDitemMenuItem = this._menuBarService.connectMenuItem(this._newSettingsDitemUiAction);
            this._newBuyOrderRequestDitemMenuItem = this._menuBarService.connectMenuItem(this._newBuyOrderRequestDitemUiAction);
            this._newSellOrderRequestDitemMenuItem = this._menuBarService.connectMenuItem(this._newSellOrderRequestDitemUiAction);
            this._saveLayoutMenuItem = this._menuBarService.connectMenuItem(this._saveLayoutUiAction);
            this._resetLayoutMenuItem = this._menuBarService.connectMenuItem(this._resetLayoutUiAction);
        } finally {
            this._menuBarService.endChanges();
        }
    }

    private disconnectMenuBarItems() {
        this._menuBarService.beginChanges();
        try {
            this._menuBarService.disconnectMenuItem(this._newExtensionsDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._newSymbolsDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._newDepthAndTradesDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._newWatchlistDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._newDepthDitemMenuItem);
            if (AppFeature.advertising) {
                this._menuBarService.disconnectMenuItem(this._newNewsHeadlinesDitemMenuItem);
                this._menuBarService.disconnectMenuItem(this._newAlertsDitemMenuItem);
                this._menuBarService.disconnectMenuItem(this._newSearchDitemMenuItem);
                this._menuBarService.disconnectMenuItem(this._newAdvertWebPageDitemMenuItem);
            }
            this._menuBarService.disconnectMenuItem(this._newStatusDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._newTradesDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._newBrokerageAccountsDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._newOrdersDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._newHoldingsDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._newBalancesDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._newSettingsDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._newBuyOrderRequestDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._newSellOrderRequestDitemMenuItem);
            this._menuBarService.disconnectMenuItem(this._saveLayoutMenuItem);
            this._menuBarService.disconnectMenuItem(this._resetLayoutMenuItem);
        } finally {
            this._menuBarService.endChanges();
        }
    }

    private createNewDitemUiAction(ditemTypeId: BuiltinDitemFrame.BuiltinTypeId) {
        const commandName = BuiltinDitemFrame.BuiltinType.idToNewInternalCommandName(ditemTypeId);
        const displayId = BuiltinDitemFrame.BuiltinType.idToMenuDisplayId(ditemTypeId);
        const menuBarItemPosition = BuiltinDitemFrame.BuiltinType.idToMenuBarItemPosition(ditemTypeId);
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId, menuBarItemPosition);
        const action = new CommandUiAction(command);
        action.signalEvent = () => this.handleNewDitemUiActionSignal(ditemTypeId);
        return action;
    }

    private createCommandUiAction(commandId: InternalCommand.Id, displayId: StringId, handler: UiAction.SignalEventHandler,
        menuBarItemPosition?: Command.MenuBarItemPosition
    ) {
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandId, displayId, menuBarItemPosition);
        const action = new CommandUiAction(command);
        action.signalEvent = handler;
        return action;
    }

    private getFrameCount(): Integer {
        return this._frames.length;
    }

    private setLitIvemIdAppLinked(value: boolean) {
        this._litIvemIdAppLinked = value;
        if (this._litIvemIdAppLinked) {
            const ALitIvemId = this._requestGlobalLinkedLitIvemIdEvent();
            this.setLitIvemId(ALitIvemId, undefined);
        }
    }

    private setAccountAggregationAppLinked(value: boolean) {
        this._brokerageAccountGroupAppLinked = value;
        if (this._brokerageAccountGroupAppLinked) {
            const group = this._requestGlobalLinkedBrokerageAccountGroupEvent();
            this.setBrokerageAccountGroup(group, undefined);
        }
    }

    private getLastFocusedLitIvemIdValid(): boolean {
        return this._lastFocusedLitIvemId !== undefined;
    }

    private getLastFocusedAccountIdValid(): boolean {
        return this._lastFocusedBrokerageAccountGroup !== undefined;
    }

    private getPrevFrameLastFocusedLitIvemIdValid(): boolean {
        return this._prevFrameLastFocusedLitIvemId !== undefined;
    }

    private getPrimaryBuiltinFrame(typeId: BuiltinDitemFrame.BuiltinTypeId): DitemFrame | undefined {
        const ditemTypeId = BuiltinDitemFrame.createBuiltinDitemTypeId(this._extensionsAccessService.internalHandle, typeId);
        return this.getPrimaryFrame(ditemTypeId);
    }

    private getPrimaryFrame(typeId: DitemFrame.TypeId): DitemFrame | undefined {
        for (const frame of this._primaryFrames) {
            if (DitemFrame.TypeId.isEqual(frame.ditemTypeId, typeId)) {
                return frame;
            }
        }

        return undefined;
    }

    private indexOfPrimaryFrame(typeId: DitemFrame.TypeId) {
        const count = this._primaryFrames.length;
        for (let i = 0; i < count; i++) {
            const frame = this._primaryFrames[i];
            if (frame.ditemTypeId === typeId) {
                return i;
            }
        }
        return -1;
    }

    private notifyAccountIdChange(initiatingFrame: DitemFrame | undefined) {
        const handlers = this._BrokerageAccountGroupChangeMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](initiatingFrame);
        }
    }

    private notifyLitIvemIdChange(initiatingFrame: DitemFrame | undefined) {
        const handlers = this._litIvemIdChangeMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](initiatingFrame);
        }
    }

    private loadLayoutFromString(layoutAsStr: string): SuccessOrErrorText {
        let result: SuccessOrErrorText;
        let layoutJson: Json | undefined;
        try {
            layoutJson = JSON.parse(layoutAsStr);
            result = SuccessOrErrorText_Success;
        } catch (e) {
            result = `${Strings[StringId.Layout_InvalidJson]}: "${e}": ${layoutAsStr}`;
            Logger.logError(result, 1000);
            layoutJson = undefined;
        }

        if (layoutJson !== undefined) {
            const layoutElement = new JsonElement(layoutJson);
            this._activeLayoutName = layoutElement.tryGetString(DesktopFrame.JsonName.layoutName);
            const name = this._activeLayoutName ?? 'Unnamed';
            const schemaVersion = layoutElement.tryGetString(DesktopFrame.JsonName.layoutSchemaVersion);
            if (schemaVersion === undefined) {
                Logger.logWarning(`${Strings[StringId.Layout_SerialisationFormatNotDefinedLoadingDefault]}: ${name}`);
                this.loadDefaultLayout();
            } else {
                if (schemaVersion !== DesktopFrame.layoutStateSchemaVersion) {
                    Logger.logWarning(`${Strings[StringId.Layout_SerialisationFormatIncompatibleLoadingDefault]}: "${name}", ` +
                        `${schemaVersion}, ${DesktopFrame.layoutStateSchemaVersion}`);
                    this.loadDefaultLayout();
                } else {
                    const golden = layoutElement.tryGetJsonObject(DesktopFrame.JsonName.layoutGolden);
                    if (golden === undefined) {
                        Logger.logWarning(`${Strings[StringId.Layout_GoldenNotDefinedLoadingDefault]}: ${name}`);
                        this.loadDefaultLayout();
                    } else {
                        const layoutConfig = golden as unknown as LayoutConfig;
                        this._goldenLayoutHostFrame.loadLayout(layoutConfig);
                    }
                }
            }

            this.initialiseLoadedLayout();
        }
        return result;
    }

    private loadDefaultLayout() {
        this._activeLayoutName = undefined;
        this._goldenLayoutHostFrame.loadDefaultLayout();
    }

    private initialiseLoadedLayout() {
        this._primaryFrames.length = 0;
        for (const frame of this._frames) {
            if (frame.primary) {
                this._primaryFrames.push(frame);
            }
        }
    }

    private checkLoadBrandingSplashWebPage() {
        if (this._startupSplashWebPageSafeResourceUrl !== undefined) {
            this.loadBrandingSplashWebPage(this._startupSplashWebPageSafeResourceUrl);
        }
    }

    private loadBrandingSplashWebPage(safeResourceUrl: SafeResourceUrl) {
        const primaryFrame = this.getPrimaryBuiltinFrame(BuiltinDitemFrame.BuiltinTypeId.BrandingSplashWebPage);
        if (primaryFrame !== undefined) {
            if (!(primaryFrame instanceof BrandingSplashWebPageDitemFrame)) {
                throw new AssertInternalError('DFLBSWPP44468');
            } else {
                primaryFrame.loadPage(safeResourceUrl);
                primaryFrame.focus();
            }
        } else {
            const component = this._goldenLayoutHostFrame.createSplashComponent();
            const ditemFrame = this._getBuiltinDitemFrameFromComponent(component);
            if (!(ditemFrame instanceof BrandingSplashWebPageDitemFrame)) {
                throw new AssertInternalError('DFLBSWPC44468');
            } else {
                ditemFrame.primary = true;
                ditemFrame.loadPage(safeResourceUrl);
                ditemFrame.focus();
            }
        }
    }
}

export namespace DesktopFrame {
    export namespace JsonName {
        export const desktop = 'desktop';
        export const formatType = 'formatType';
        export const layout = 'layout';

        export const layoutName = 'name';
        export const layoutSchemaVersion = 'schemaVersion';
        export const layoutGolden = 'golden';
    }
    export const layoutStateSchemaVersion = '2';

    export const enum TRectAdjacency {
        radTop, radBottom, radLeft, radRight, radTopLeft, radTopRight, radBottomLeft, radBottomRight
    }

    export const BuySellOrderRequestParentMenuPath = [MenuBarService.Menu.Name.Root.trading];
    export const BuySellOrderRequestMenuName = 'BuySellOrderRequest';

    export type LayoutSaveEventHandler = (this: void) => Json;
    export type LayoutLoadEventHandler = (this: void, layoutJson: Json) => void;
    export type ResetLayoutEventHandler = (this: void) => void;
    export type NewTabEventHandler = (typeId: BuiltinDitemFrame.BuiltinTypeId, componentState?: Json) => void;

    export type LitIvemIdChangeEventHandler = (this: void, initiatingFrame: DitemFrame | undefined) => void;
    export type BrokerageAccountGroupChangeEventHandler = (this: void, initiatingFrame: DitemFrame | undefined) => void;

    export type RequestAppLinkedLitIvemIdEvent = (this: void) => LitIvemId;
    export type RequestAppLinkedBrokerageAccountGroupEvent = (this: void) => BrokerageAccountGroup;

    export type GetBuiltinDitemFrameFromComponent = (component: BuiltinDitemNgComponentBaseDirective) => BuiltinDitemFrame | undefined;

    export type EditOrderRequestEvent = (this: void, request: OrderPad) => void;
    export type EditOrderRequestFromMarketOrderIdEvent = (this: void, requestType: OrderRequestTypeId,
        AccountId: string, marketOrderId: MarketOrderId) => void;

    export type TNewDisplayEvent = (SenderFrame: DitemFrame, FrameTypeId: BuiltinDitemFrame.BuiltinTypeId,
            /*TargetPanel: TaqCustomDockingControl*/) => DitemFrame;
    export type TOpenDisplayEvent = (SenderFrame: DitemFrame, FrameTypeId: BuiltinDitemFrame.BuiltinTypeId,
            /*TargetPanel: TaqCustomDockingControl,*/ ALitIvemId: LitIvemId) => void;
    export type TCloseDisplayEvent = (Frame: DitemFrame) => void;
    export type TPrintDesktopEvent = (this: void) => void;

    export type LitIvemIdChangeEventHandlerArray = LitIvemIdChangeEventHandler[];
    export type AccountAggregationChangeEventHandlerArray = BrokerageAccountGroupChangeEventHandler[];

    export type LitIvemIdChangedHandler = (ALitIvemId: LitIvemId | undefined, InitiatingFrame: DitemFrame | undefined) => void;

    export class TLitIvemIdChangedEvent extends MultiEvent<LitIvemIdChangedHandler> {
        trigger(ALitIvemId: LitIvemId | undefined, InitiatingFrame: DitemFrame | undefined): void {
            const handlers = this.copyHandlers();
            for (let i = 0; i < handlers.length; i++) {
                handlers[i](ALitIvemId, InitiatingFrame);
            }
        }
    }

    export const mainLayoutName = 'main';
}
