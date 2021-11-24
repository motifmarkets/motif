/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { isDevMode } from '@angular/core';
import {
    AdiService,
    ExchangeEnvironment,
    ExchangeEnvironmentId,
    ExchangeInfo,
    ZenithExtConnectionDataDefinition,
    ZenithExtConnectionDataItem,
    ZenithPublisherReconnectReason,
    ZenithPublisherReconnectReasonId,
    ZenithPublisherState,
    ZenithPublisherStateId,
    ZenithPublisherSubscriptionManager
} from 'adi-internal-api';
import { SessionInfoService } from 'component-services-internal-api';
import {
    AppStorageService,
    MotifServicesService,
    SessionState,
    SessionStateId,
    SettingsService,
    SymbolsService
} from 'core-internal-api';
import { Version } from 'generated-internal-api';
import { Log as OidcLog, User, UserManager, UserManagerSettings } from 'oidc-client';
import { StringId, Strings } from 'res-internal-api';
import { SignOutService } from 'src/component-services/sign-out-service';
import { ExtensionsService } from 'src/extensions/internal-api';
import {
    AssertInternalError,
    ExternalError,
    IdleDeadline,
    IdleRequestOptions,
    Integer,
    JsonElement,
    Logger,
    MotifServicesError,
    mSecsPerSec,
    MultiEvent,
    SysTick,
    UserAlertService
} from 'sys-internal-api';
import { Config } from './config';
import { TelemetryService } from './telemetry-service';

export class SessionService {
    authenticatedEvent: SessionService.AuthenticatedEvent;
    onlineEvent: SessionService.OnlineEvent;

    private _stateId = SessionStateId.NotStarted;

    private _serviceName: string;
    private _serviceDescription: string | undefined;

    private _userManager: UserManager;
    private _access_token = SessionService.invalidAccessToken;
    private _token_type = '';
    private _userId: string;
    private _username: string;
    private _userFullName: string;

    private _motifServicesEndpoint: string;
    private _zenithEndpoint: string;

    private _infoService: SessionInfoService = new SessionInfoService();

    private _useZenithAuthOwnerAuthentication: boolean;
    private _useLocalStateStorage: boolean;
    private _exchangeEnvironmentId: ExchangeEnvironmentId;
    private _motifServicesEndpoints: readonly string[];
    private _zenithEndpoints: readonly string[];
    private _openIdAuthority: string;
    private _openIdClientId: string;
    private _openIdRedirectUri: string;
    private _openIdSilentRedirectUri: string;
    private _openIdScope: string;

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
        private _telemetryService: TelemetryService,
        private _userAlertService: UserAlertService,
        private _settingsService: SettingsService,
        private _motifServicesService: MotifServicesService,
        private _appStorageService: AppStorageService,
        private _extensionService: ExtensionsService,
        private _adiService: AdiService,
        private _symbolsService: SymbolsService,
        private _signoutService: SignOutService,
    ) {
        OidcLog.logger = console;
        OidcLog.level = OidcLog.INFO;

        this._signoutService.signOutEvent = () => this.handleSignOut();
    }

    get serviceName() { return this._serviceName; }
    get serviceDescription() { return this._serviceDescription; }
    get userId() { return this._userId; }
    get username() { return this._username; }
    get userFullName() { return this._userFullName; }

    get infoService() { return this._infoService; }

    get stateId() { return this._stateId; }
    get zenithEndpoint() { return this._zenithEndpoint; }
    get running() { return this._stateId === SessionStateId.Offline || this._stateId === SessionStateId.Online; }
    get final() { return this._stateId === SessionStateId.Finalising || this._stateId === SessionStateId.Finalised; }

    startAuthentication(config: Config) {
        if (config === undefined) {
            throw new AssertInternalError('SSACU89888982232');
        } else {
            this.applyConfig(config);
            this._userManager = this.createUserManager();
            this._userManager.events.addUserLoaded((user) => this.processUserLoaded(user));
            this._userManager.events.addAccessTokenExpired(() => this.processAccessTokenExpired());
            this._userManager.signinRedirect();
        }
    }

    async completeAuthentication(config: Config) {
        this.applyConfig(config);

        this._userManager = this.createUserManager();
        this._userManager.events.addUserLoaded((user) => this.processUserLoaded(user));
        this._userManager.events.addAccessTokenExpired(() => this.processAccessTokenExpired());
        const user = await this._userManager.signinRedirectCallback();
        if (user === undefined || user === null) {
            this.logError(`OIDC UserManager returned null or undefined user`);
        } else {
            this.authenticatedEvent();
        }
    }

    isLoggedIn(): boolean {
        return this._access_token !== SessionService.invalidAccessToken;
    }

    getAuthorizationHeaderValue(): string {
        if (this._access_token === SessionService.invalidAccessToken) {
            throw new AssertInternalError('SMGAHV338834590');
        } else {
            return `${this._token_type} ${this._access_token}`;
        }
    }

    async start(config: Config) {
        this.applyConfig(config);

        this.setStateId(SessionStateId.Starting);
        this.logInfo(`${Strings[StringId.Version]}: ${Version.app}`);
        this.logInfo(`${Strings[StringId.Service]}: ${config.service.name}`);
        this.logInfo(`ProdMode: ${isDevMode() ? 'False' : 'True'}`);
        ExchangeInfo.setDefaultEnvironmentId(this._exchangeEnvironmentId);
        this.logInfo(`Exchange Environment: ${ExchangeEnvironment.idToDisplay(this._exchangeEnvironmentId)}`);
        this.setZenithEndpoint(this._zenithEndpoints[0]);
        this.logInfo(`Zenith Endpoint: ${this._zenithEndpoint}`);
        if (this._useZenithAuthOwnerAuthentication) {
            this.logInfo('Zenith AuthOwner Authentication: True');
        }

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
                    this._exchangeEnvironmentId,
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

        this._userManager.signoutRedirect();
    }

    finalise() {
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

    private setUserId(value: string) {
        this._userId = value;
        this._infoService.userId = value;
    }

    private setUsername(value: string) {
        this._username = value;
        this._infoService.username = value;
    }

    private setUserFullName(value: string) {
        this._userFullName = value;
        this._infoService.userFullName = value;
    }

    private setZenithEndpoint(value: string) {
        this._zenithEndpoint = value;
        this._infoService.zenithEndpoint = value;
    }

    private handleZenithFeedOnlineChangeEvent(online: boolean): void {
        if (!this.final) {
            if (online) {
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
        const logText = `Zenith Reconnection: ${ZenithPublisherReconnectReason.idToDisplay(reconnectReasonId)}`;
        if (ZenithPublisherReconnectReason.idToNormal(reconnectReasonId)) {
            this.logInfo(logText);
        } else {
            this.logWarning(logText);
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

        this._telemetryService.applyConfig(config);
        this._userAlertService.enabled = config.diagnostics.appNotifyErrors;

        this._symbolsService.setDefaultDefaultExchangeId(config.exchange.defaultDefaultExchangeId);

        this._adiService.dataMgr.dataSubscriptionCachingEnabled = !config.diagnostics.dataSubscriptionCachingDisabled;
        ZenithPublisherSubscriptionManager.logLevelId = config.diagnostics.zenithLogLevelId;

        this._useZenithAuthOwnerAuthentication = config.diagnostics.motifServicesBypass.useZenithAuthOwnerAuthentication;
        this._useLocalStateStorage = config.diagnostics.motifServicesBypass.useLocalStateStorage;
        this._exchangeEnvironmentId = config.exchange.environmentId;
        this._infoService.bannerOverrideExchangeEnvironmentId = config.exchange.bannerOverrideEnvironmentId;
        this._motifServicesEndpoints = config.endpoints.motifServices;
        this._zenithEndpoints = config.endpoints.zenith;

        this._openIdAuthority = config.openId.authority;
        this._openIdClientId = config.openId.clientId;
        this._openIdRedirectUri = config.openId.redirectUri;
        this._openIdSilentRedirectUri = config.openId.silentRedirectUri;
        this._openIdScope = config.openId.scope;

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

    private createUserManager() {
        const settings: UserManagerSettings = {
            authority: this._openIdAuthority,
            client_id: this._openIdClientId,
            redirect_uri: this._openIdRedirectUri,
            response_type: 'code',
            scope: this._openIdScope,
            automaticSilentRenew: true,
            silent_redirect_uri: this._openIdSilentRedirectUri,
            filterProtocolClaims: true,
            loadUserInfo: true
        };

        return new UserManager(settings);
    }

    private processUserLoaded(user: User) {
        this._access_token = user.access_token;
        this._token_type = user.token_type;

        const profile = user.profile;
        this.setUserId(profile.sub);
        this.setUsername(profile.preferred_username ?? '');
        this.setUserFullName(profile.name ?? '');

        const telemetryUsername = profile.preferred_username ?? profile.name ?? this._userId;
        this._telemetryService.setUser(this._userId, telemetryUsername);

        if (this._zenithExtConnectionDataItem !== undefined) {
            this._zenithExtConnectionDataItem.updateAccessToken(this._access_token);
        }
    }

    private processAccessTokenExpired() {
        this._access_token = SessionService.invalidAccessToken;

        if (this._zenithExtConnectionDataItem !== undefined) {
            this._zenithExtConnectionDataItem.updateAccessToken(SessionService.invalidAccessToken);
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
        zenithExtConnectionDataDefinition.initialAuthAccessToken = this._access_token;
        zenithExtConnectionDataDefinition.zenithWebsocketEndpoint = this._zenithEndpoint;
        zenithExtConnectionDataDefinition.useAuthOwnerZenithAuthentication = this._useZenithAuthOwnerAuthentication;

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

    export type ExchangeEnvironmentIdAvailableEventHandler = (id: ExchangeEnvironmentId) => void;

    export const invalidAccessToken = '';
    export const motifServicesGetClientConfigurationRetryDelaySpan = 30 * mSecsPerSec;
    export const getSettingsRetryDelaySpan = 30 * mSecsPerSec;
    export const idleCallbackTimeout = 30 * mSecsPerSec;
    export const minimumSettingsSaveRepeatSpan = 15 * mSecsPerSec;
}
