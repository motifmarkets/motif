/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { isDevMode } from '@angular/core';
import {
    AdiService,
    AppStorageService,
    AssertInternalError,
    DataEnvironment,
    DataEnvironmentId, ExchangeInfo, ExternalError,
    IdleDeadline,
    IdleRequestOptions,
    Integer,
    JsonElement,
    Logger,
    MotifServicesError,
    MotifServicesService,
    mSecsPerSec,
    MultiEvent,
    SessionInfoService,
    SessionState,
    SessionStateId,
    SettingsService,
    StringId,
    Strings,
    SymbolsService,
    SysTick,
    TradingEnvironment, UserAlertService,
    ZenithExtConnectionDataDefinition,
    ZenithExtConnectionDataItem,
    ZenithPublisherReconnectReason,
    ZenithPublisherReconnectReasonId,
    ZenithPublisherState,
    ZenithPublisherStateId,
    ZenithPublisherSubscriptionManager
} from '@motifmarkets/motif-core';
import { Version } from 'generated-internal-api';
import { AppFeature } from 'src/app.feature';
import { SignOutService } from 'src/component-services/sign-out-service';
import { ExtensionsService } from 'src/extensions/internal-api';
import { Config } from './config';
import { OpenIdService } from './open-id-service';
import { TelemetryService } from './telemetry-service';

export class SessionService {
    authenticatedEvent: SessionService.AuthenticatedEvent;
    onlineEvent: SessionService.OnlineEvent;

    private _stateId = SessionStateId.NotStarted;

    private _serviceName: string;
    private _serviceDescription: string | undefined;

    private _motifServicesEndpoint: string;

    private _infoService: SessionInfoService = new SessionInfoService();

    private _useLocalStateStorage: boolean;
    private _motifServicesEndpoints: readonly string[];
    private _zenithEndpoints: readonly string[];

    private _sequentialZenithReconnectionWarningCount = 0;

    private _stateChangeMultiEvent = new MultiEvent<SessionService.StateChangeEventHandler>();
    private _kickedOffMultiEvent = new MultiEvent<SessionService.KickedOffEventHandler>();
    private _consolidatedLogMultiEvent = new MultiEvent<SessionService.ConsolidatedLogEventHandler>();

    private _zenithExtConnectionDataItem: ZenithExtConnectionDataItem | undefined;
    private _zenithFeedOnlineChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _zenithFeedStateChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _zenithReconnectSubscriptionId: MultiEvent.SubscriptionId;
    private _zenithCounterSubscriptionId: MultiEvent.SubscriptionId;
    private _zenithLogSubscriptionId: MultiEvent.SubscriptionId;
    private _zenithKickedOffSubscriptionId: MultiEvent.SubscriptionId;

    private _requestIdleCallbackHandle: number | undefined;
    private _settingsSaveNotAllowedUntilTime: SysTick.Time = 0;
    private _lastSettingsSaveFailed = false;

    constructor(
        private readonly _telemetryService: TelemetryService,
        private readonly _userAlertService: UserAlertService,
        private readonly _settingsService: SettingsService,
        private readonly _openIdService: OpenIdService,
        private readonly _motifServicesService: MotifServicesService,
        private readonly _appStorageService: AppStorageService,
        private readonly _extensionService: ExtensionsService,
        private readonly _adiService: AdiService,
        private readonly _symbolsService: SymbolsService,
        private readonly _signoutService: SignOutService,
    ) {
        this._openIdService.logErrorEvent = (text) => this.logError(text);
        this._openIdService.userLoadedEvent = () => this.handleUserLoadedEvent();
        this._signoutService.signOutEvent = () => this.handleSignOut();
    }

    get serviceName() { return this._serviceName; }
    get serviceDescription() { return this._serviceDescription; }

    get infoService() { return this._infoService; }

    get stateId() { return this._stateId; }
    get zenithEndpoints() { return this._zenithEndpoints; }
    get running() { return this._stateId === SessionStateId.Offline || this._stateId === SessionStateId.Online; }
    get final() { return this._stateId === SessionStateId.Finalising || this._stateId === SessionStateId.Finalised; }

    get userId() { return this._openIdService.userId; }
    get username() { return this._openIdService.username; }
    get userFullName() { return this._openIdService.userFullName; }

    startAuthentication(config: Config) {
        if (config === undefined) {
            throw new AssertInternalError('SSACU89888982232');
        } else {
            this.applyConfig(config);
            this._openIdService.startAuthentication();
        }
    }

    async completeAuthentication(config: Config) {
        this.applyConfig(config);
        const authenticated = await this._openIdService.completeAuthentication();
        if (authenticated) {
            this.authenticatedEvent();
        } else {
            this.logError(`Open ID authentication failed. Returned null or undefined user`);
        }
    }

    isLoggedIn(): boolean {
        return this._openIdService.isLoggedIn();
    }

    getAuthorizationHeaderValue(): string {
        return this._openIdService.getAuthorizationHeaderValue();
    }

    async start(config: Config) {
        this.applyConfig(config);

        this.setStateId(SessionStateId.Starting);
        this.logInfo(`${Strings[StringId.Version]}: ${Version.app}`);
        this.logInfo(`${Strings[StringId.Service]}: ${config.service.name}`);
        this.logInfo(`ProdMode: ${isDevMode() ? 'False' : 'True'}`);
        this.logInfo(`Data Environment: ${DataEnvironment.idToDisplay(DataEnvironment.getDefaultId())}`);
        this.logInfo(`Trading Environment: ${TradingEnvironment.idToDisplay(TradingEnvironment.getDefaultId())}`);
        this.logInfo(`Zenith Endpoint: ${this._zenithEndpoints.join(',')}`);

        let storageTypeId: AppStorageService.TypeId;
        if (this._useLocalStateStorage) {
            this.logInfo('State Storage: Local');
            storageTypeId = AppStorageService.TypeId.Local;
        } else {
            if (this._motifServicesEndpoints.length === 0) {
                throw new MotifServicesError(ExternalError.Code.SSSMSE19774);
            } else {
                this.logInfo('State Storage: MotifServices');
                this._motifServicesEndpoint = this._motifServicesEndpoints[0];
                this.logInfo(`MotifServices Endpoint: ${this._motifServicesEndpoint}`);
                await this._motifServicesService.initialise(this._motifServicesEndpoint,
                    DataEnvironment.getDefaultId(),
                    () => this.getAuthorizationHeaderValue()
                );
                storageTypeId = AppStorageService.TypeId.MotifServices;
            }
        }
        this._appStorageService.initialise(storageTypeId);

        await this.processLoadSettings();
        await this.processLoadExtensions();
        this.finishStartup();
    }

    signOut() {
        this.finalise();
        this._openIdService.signOut();
    }

    finalise() {
        this._openIdService.finalise();

        if (!this.final) {
            this.setStateId(SessionStateId.Finalising);

            if (this._requestIdleCallbackHandle !== undefined) {
                window.cancelIdleCallback(this._requestIdleCallbackHandle);
                this._requestIdleCallbackHandle = undefined;
            }

            this.unsubscribeZenithExtConnection();

            this.setStateId(SessionStateId.Finalised);
        }
    }

    subscribeStateChangeEvent(handler: SessionService.StateChangeEventHandler) {
        return this._stateChangeMultiEvent.subscribe(handler);
    }

    unsubscribeStateChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void {
        this._stateChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeKickedOffEvent(handler: SessionService.KickedOffEventHandler) {
        return this._kickedOffMultiEvent.subscribe(handler);
    }

    unsubscribeKickedOffEvent(subscriptionId: MultiEvent.SubscriptionId): void {
        this._kickedOffMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeConsolidatedLogEvent(handler: SessionService.ConsolidatedLogEventHandler) {
        return this._consolidatedLogMultiEvent.subscribe(handler);
    }

    unsubscribeConsolidatedLogEvent(subscriptionId: MultiEvent.SubscriptionId): void {
        this._consolidatedLogMultiEvent.unsubscribe(subscriptionId);
    }

    private setServiceName(value: string) {
        this._serviceName = value;
        this._infoService.serviceName = value;
    }

    private setServiceDescription(value: string | undefined) {
        this._serviceDescription = value;
        this._infoService.serviceDescription = value;
    }

    private setZenithEndpoints(value: readonly string[]) {
        this._zenithEndpoints = value;
        this._infoService.zenithEndpoints = value;
    }

    private handleUserLoadedEvent() {
        const userId = this._openIdService.userId;
        const username = this._openIdService.username;
        const userFullName = this._openIdService.userFullName;

        this._infoService.userId = userId;
        this._infoService.username = this._openIdService.username;
        this._infoService.userFullName = this._openIdService.userFullName;
        this._infoService.userAccessTokenExpiryTime = this._openIdService.userAccessTokenExpiryTime;

        const telemetryUsername = username ?? userFullName ?? userId;
        this._telemetryService.setUser(userId, telemetryUsername);

        const accessToken = this._openIdService.accessToken;
        if (this._zenithExtConnectionDataItem !== undefined && accessToken !== OpenIdService.invalidAccessToken) {
            this._zenithExtConnectionDataItem.updateAccessToken(accessToken);
        }
    }

    private handleZenithFeedOnlineChangeEvent(online: boolean): void {
        if (!this.final) {
            if (online) {
                this._sequentialZenithReconnectionWarningCount = 0;
                this.logInfo(`Session online`);
                this.setStateId(SessionStateId.Online);
            } else {
                if (this.running) {
                    this.logInfo(`Session offline`);
                    this.setStateId(SessionStateId.Offline);
                }
            }
        }
    }

    private handleZenithStateChangeEvent(stateId: ZenithPublisherStateId, waitId: Integer): void {
        const logText = `Zenith State: ${ZenithPublisherState.idToDisplay(stateId)} (${waitId})`;
        this.logInfo(logText);
    }

    private handleZenithReconnectEvent(reconnectReasonId: ZenithPublisherReconnectReasonId): void {
        let logText = `Zenith Reconnection: ${ZenithPublisherReconnectReason.idToDisplay(reconnectReasonId)}`;
        if (ZenithPublisherReconnectReason.idToNormal(reconnectReasonId)) {
            this.logInfo(logText);
        } else {
            switch (this._sequentialZenithReconnectionWarningCount) {
                case 0:
                    this.logWarning(logText);
                    this._sequentialZenithReconnectionWarningCount++;
                    break;
                case 1:
                    logText += ' (more than one)';
                    this.logWarning(logText);
                    this._sequentialZenithReconnectionWarningCount++;
                    break;
                default:
                    // only log 2 warnings until success
            }
        }
    }

    private handleZenithCounterEvent() {
        // TBD
    }

    private handleZenithLogEvent(time: Date, logLevelId: Logger.LevelId, text: string) {
        this.notifyConsolidatedLog(time, logLevelId, text);
    }

    private handleZenithKickedOffEvent() {
        this.notifyKickedOff();
    }

    private handleSignOut() {
        this.signOut();
    }

    private notifyStateChange() {
        const handlers = this._stateChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](this.stateId);
        }
    }

    private notifyKickedOff() {
        const handlers = this._kickedOffMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i]();
        }
    }

    private notifyConsolidatedLog(time: Date, logLevelId: Logger.LevelId, text: string) {
        const handlers = this._consolidatedLogMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](time, logLevelId, text);
        }
    }

    private log(logLevelId: Logger.LevelId, text: string) {
        Logger.log(logLevelId, text);
        this.notifyConsolidatedLog(new Date(), logLevelId, text);
    }

    private logInfo(text: string) {
        this.log(Logger.LevelId.Info, text);
    }

    private logWarning(text: string) {
        this.log(Logger.LevelId.Warning, text);
    }

    private logError(text: string) {
        this.log(Logger.LevelId.Error, text);
    }

    private applyConfig(config: Config) {
        this.setServiceName(config.service.name);
        this.setServiceDescription(config.service.description);

        AppFeature.preview = config.features.preview;
        AppFeature.advertising = config.features.advertising;

        this._telemetryService.applyConfig(config);
        this._userAlertService.enabled = config.diagnostics.appNotifyErrors;

        this._symbolsService.setDefaultDefaultExchangeId(config.exchange.defaultDefaultExchangeId);

        const exchangeOptions = config.exchange.options;
        if (exchangeOptions !== undefined) {
            for (const option of exchangeOptions) {
                const overriddenDefaultDataEnvironmentId = option.overriddenDefaultDataEnvironmentId;
                if (overriddenDefaultDataEnvironmentId !== undefined) {
                    ExchangeInfo.setOverrideDefaultDataEnvironmentId(option.exchangeId, overriddenDefaultDataEnvironmentId);
                }
            }
        }

        this._adiService.dataMgr.dataSubscriptionCachingEnabled = !config.diagnostics.dataSubscriptionCachingDisabled;
        ZenithPublisherSubscriptionManager.logLevelId = config.diagnostics.zenithLogLevelId;

        this._useLocalStateStorage = config.diagnostics.motifServicesBypass.useLocalStateStorage;
        const defaultDataEnvironmentId = config.environment.defaultDataEnvironmentId;
        DataEnvironment.setDefaultId(defaultDataEnvironmentId);
        const tradingEnvironmentId = DataEnvironment.idToCorrespondingTradingEnvironmentId(defaultDataEnvironmentId);
        TradingEnvironment.setDefaultId(tradingEnvironmentId);
        this._infoService.bannerOverrideDataEnvironmentId = config.environment.bannerOverrideDataEnvironmentId;
        this._motifServicesEndpoints = config.endpoints.motifServices;
        this.setZenithEndpoints(config.endpoints.zenith);

        this._openIdService.applyConfig(config);

        this._infoService.defaultLayout = config.defaultLayout;
        this._extensionService.setBundled(config.bundledExtensions);
    }

    private setStateId(stateId: SessionStateId) {
        if (stateId !== this.stateId) {
            this._stateId = stateId;
            this.logInfo(SessionState.idToDisplay(stateId));
            if (this._stateId === SessionStateId.Online) {
                this.onlineEvent();
            }
            this.notifyStateChange();

            this._infoService.stateId = stateId;
        }
    }

    private async processLoadSettings() {
        this.logInfo('Retrieving Settings');
        const appSettings = await this._appStorageService.getItem(AppStorageService.Key.Settings);
        if (!this.final) {
            let rootElement: JsonElement | undefined;
            if (appSettings === undefined || appSettings === '') {
                this.logWarning('Could not retrieve saved settings. Using defaults');
                rootElement = undefined;
            } else {
                this.logInfo('Loading Settings');
                rootElement = new JsonElement();
                if (!rootElement.parse(appSettings, 'Load Settings')) {
                    this.logWarning('Could not parse saved settings. Using defaults');
                    rootElement = undefined;
                }
            }

            this._settingsService.load(rootElement);
        }
    }

    private async processLoadExtensions() {
        this.logInfo('Retrieving Extensions');
        this._extensionService.processBundled();
        // const loadedExtensions = await this._appStorageService.getItem(AppStorageService.Key.LoadedExtensions);
        // if (!this.final) {
        //     if (loadedExtensions === undefined) {
        //         this.logWarning('Loaded Extensions setting not found. No extensions loaded');
        //     } else {
        //         this.logInfo('Loading Extensions');
        //         const rootElement = new JsonElement();
        //         const success = rootElement.parse(loadedExtensions, 'Load Settings');
        //         if (!success) {
        //             this.logWarning('Could not parse loadedExtensions settings. No extensions loaded');
        //         } else {
        //             // this._extensionsService.load(rootElement);
        //         }
        //     }
        // }
    }

    private saveSettings() {
        const rootElement = new JsonElement();
        this._settingsService.save(rootElement);
        const settingsAsJsonString = rootElement.stringify();
        return this._appStorageService.setItem(AppStorageService.Key.Settings, settingsAsJsonString);
    }

    private finishStartup() {
        this._adiService.start();
        this.subscribeZenithExtConnection();
        this._symbolsService.start();
        this.startIdleProcessing();
    }

    private subscribeZenithExtConnection() {
        const zenithExtConnectionDataDefinition = new ZenithExtConnectionDataDefinition();
        zenithExtConnectionDataDefinition.initialAuthAccessToken = this._openIdService.accessToken;
        zenithExtConnectionDataDefinition.zenithWebsocketEndpoints = this._zenithEndpoints;

        this._zenithExtConnectionDataItem = this._adiService.subscribe(zenithExtConnectionDataDefinition) as ZenithExtConnectionDataItem;

        this._zenithFeedOnlineChangeSubscriptionId = this._zenithExtConnectionDataItem.subscribePublisherOnlineChangeEvent(
            (online) => this.handleZenithFeedOnlineChangeEvent(online)
        );

        this._zenithFeedStateChangeSubscriptionId = this._zenithExtConnectionDataItem.subscribePublisherStateChangeEvent(
            (stateId, waitId) => { this.handleZenithStateChangeEvent(stateId, waitId); }
        );

        this._zenithReconnectSubscriptionId = this._zenithExtConnectionDataItem.subscribeZenithReconnectEvent(
            (reconnectReasonId) => { this.handleZenithReconnectEvent(reconnectReasonId); }
        );

        this._zenithCounterSubscriptionId = this._zenithExtConnectionDataItem.subscribeZenithCounterEvent(
            () => { this.handleZenithCounterEvent(); }
        );

        this._zenithLogSubscriptionId = this._zenithExtConnectionDataItem.subscribeZenithLogEvent(
            (time, logLevelId, text) => { this.handleZenithLogEvent(time, logLevelId, text); }
        );

        this._zenithKickedOffSubscriptionId = this._zenithExtConnectionDataItem.subscribeZenithSessionKickedOffEvent(
            () => { this.handleZenithKickedOffEvent(); }
        );
    }

    private unsubscribeZenithExtConnection() {
        if (this._zenithExtConnectionDataItem !== undefined) {
            this._zenithExtConnectionDataItem.unsubscribePublisherOnlineChangeEvent(this._zenithFeedOnlineChangeSubscriptionId);
            this._zenithFeedOnlineChangeSubscriptionId = undefined;

            this._zenithExtConnectionDataItem.unsubscribePublisherStateChangeEvent(this._zenithFeedStateChangeSubscriptionId);
            this._zenithFeedStateChangeSubscriptionId = undefined;

            this._zenithExtConnectionDataItem.unsubscribeZenithReconnectEvent(this._zenithReconnectSubscriptionId);
            this._zenithReconnectSubscriptionId = undefined;

            this._zenithExtConnectionDataItem.unsubscribeZenithCounterEvent(this._zenithCounterSubscriptionId);
            this._zenithCounterSubscriptionId = undefined;

            this._zenithExtConnectionDataItem.unsubscribeZenithLogEvent(this._zenithLogSubscriptionId);
            this._zenithLogSubscriptionId = undefined;

            this._zenithExtConnectionDataItem.unsubscribeZenithSessionKickedOffEvent(this._zenithKickedOffSubscriptionId);
            this._zenithKickedOffSubscriptionId = undefined;

            this._adiService.unsubscribe(this._zenithExtConnectionDataItem);
            this._zenithExtConnectionDataItem = undefined;
        }
    }

    private startIdleProcessing() {
        this.initiateRequestIdleCallback();
    }

    private initiateRequestIdleCallback() {
        const options: IdleRequestOptions = {
            timeout: SessionService.idleCallbackTimeout,
        };
        this._requestIdleCallbackHandle = window.requestIdleCallback((deadline) => this.idleCallback(deadline), options);
    }

    private idleCallback(deadline: IdleDeadline) {
        if (!this.final) {
            // Check for dirty elements....
            if (this._settingsService.saveRequired) {
                if (SysTick.now() > this._settingsSaveNotAllowedUntilTime) {
                    const promise = this.saveSettings();
                    promise.then(
                        () => {
                            this._settingsService.reportSaved();
                            if (this._lastSettingsSaveFailed) {
                                this.logWarning(`Save settings succeeded`);
                                this._lastSettingsSaveFailed = false;
                            }
                            this._settingsSaveNotAllowedUntilTime = SysTick.now() + SessionService.minimumSettingsSaveRepeatSpan;
                        },
                        (reason) => {
                            this.logWarning(`Save settings error: ${reason}`);
                            this._lastSettingsSaveFailed = true;
                            this._settingsSaveNotAllowedUntilTime = SysTick.now() + SessionService.minimumSettingsSaveRepeatSpan;
                        }
                    );
                }
            }

            this.initiateRequestIdleCallback();
        }
    }
}

export namespace SessionService {
    export type AuthenticatedEvent = (this: void) => void;
    export type OnlineEvent = (this: void) => void;
    export type TNotifyEventHandler = (this: void) => void;
    export type StateChangeEventHandler = (stateId: SessionStateId) => void;
    export type KickedOffEventHandler = (this: void) => void;
    export type ConsolidatedLogEventHandler = (time: Date, logLevelId: Logger.LevelId, text: string) => void;

    export type ExchangeEnvironmentIdAvailableEventHandler = (id: DataEnvironmentId) => void;

    export const motifServicesGetClientConfigurationRetryDelaySpan = 30 * mSecsPerSec;
    export const getSettingsRetryDelaySpan = 30 * mSecsPerSec;
    export const idleCallbackTimeout = 30 * mSecsPerSec;
    export const minimumSettingsSaveRepeatSpan = 15 * mSecsPerSec;
}
