/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExchangeEnvironment, ExchangeEnvironmentId } from 'src/adi/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import {
    EnumInfoOutOfOrderError,
    ExternalError,
    Integer,
    JsonElement,
    Logger,
    MotifServicesError,
    MultiEvent,
    UnreachableCaseError
} from 'src/sys/internal-api';
import { AppStorageService } from './app-storage-service';
import { MasterSettings } from './settings/master-settings';
import { SettingsService } from './settings/settings-service';

export class MotifServicesService {
    private _baseUrl: string;
    private _getAuthorizationHeaderValue: MotifServicesService.GetAuthorizationHeaderValueCallback;

    private _applicationFlavour = MotifServicesService.defaultApplicationFlavour;
    private _applicationEnvironment = MotifServicesService.defaultApplicationEnvironment;

    private _masterSettingsChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    private _logEvent = new MultiEvent<MotifServicesService.LogEvent>();

    constructor(private _settingsService: SettingsService) { }

    // eslint-disable-next-line max-len
    async initialise(endpointBaseUrl: string, exchangeEnvironmentId: ExchangeEnvironmentId,
        getAuthorizationHeaderValueCallback: MotifServicesService.GetAuthorizationHeaderValueCallback
    ) {
        this._baseUrl = endpointBaseUrl;
        this._getAuthorizationHeaderValue = getAuthorizationHeaderValueCallback;

        await this.loadMasterSettings();

        this.updateApplicationEnvironment(exchangeEnvironmentId);

        this._masterSettingsChangedEventSubscriptionId =
            this._settingsService.subscribeMasterSettingsChangedEvent(() => this.handleMasterSettingsChangedEvent());
    }

    finalise() {
        this._settingsService.unsubscribeMasterSettingsChangedEvent(this._masterSettingsChangedEventSubscriptionId);
    }

    subscribeLogEvent(handler: MotifServicesService.LogEvent) {
        return this._logEvent.subscribe(handler);
    }

    unsubscribeLogEvent(subscriptionId: MultiEvent.DefinedSubscriptionId) {
        this._logEvent.unsubscribe(subscriptionId);
    }

    async getUserSetting(key: string, overrideApplicationEnvironment?: string): Promise<string | undefined> {
        const endpointPath = MotifServicesService.EndpointPath.getUserSetting;
        const credentials = 'include';
        const method = 'POST';
        const headers = new Headers({
            Authorization: this._getAuthorizationHeaderValue(),
            'Content-Type': 'application/json'
        });

        const applicationEnvironment = overrideApplicationEnvironment ?? this._applicationEnvironment;
        const request: MotifServicesService.GetRequestPayload = {
            applicationFlavour: this._applicationFlavour,
            applicationEnvironment,
            key,
        };
        const body = JSON.stringify(request);

        const url = new URL(endpointPath, this._baseUrl);
        try {
            const response = await fetch(url.href, { credentials, headers, method, body });
            if (response.status === 200) {
                const payloadText = await response.text();
                let payload: MotifServicesService.GetResponsePayload;
                try {
                    payload = JSON.parse(payloadText);
                } catch (e) {
                    throw new MotifServicesError(ExternalError.Code.ParseMotifServicesServiceGetResponsePayload, payloadText);
                }
                if (payload.successful) {
                    return Promise.resolve(payload.data);
                } else {
                    return Promise.reject(`${Strings[StringId.MotifServicesResponsePayloadError]}: ${payload.reason}`);
                }
            } else {
                return Promise.reject(`${Strings[StringId.MotifServicesResponseStatusError]}: ${response.status}: ${response.statusText}`);
            }
        } catch (reason) {
            return Promise.reject(`${Strings[StringId.MotifServicesFetchError]}: ${reason}`);
        }
    }

    async setUserSetting(key: string, value: string, overrideApplicationEnvironment?: string): Promise<void> {
        const endpointPath = MotifServicesService.EndpointPath.setUserSetting;
        const credentials = 'include';
        const method = 'POST';
        const headers = new Headers([
            ['Authorization', this._getAuthorizationHeaderValue()],
            ['Content-Type', 'application/json'],
        ]);

        const applicationEnvironment = overrideApplicationEnvironment ?? this._applicationEnvironment;
        const request: MotifServicesService.SetRequestPayload = {
            applicationFlavour: this._applicationFlavour,
            applicationEnvironment,
            key,
            value,
        };
        const body = JSON.stringify(request);

        const url = new URL(endpointPath, this._baseUrl);
        try {
            const response = await fetch(url.href, { credentials, headers, method, body });
            if (response.status === 200) {
                const payloadText = await response.text();
                let payload: MotifServicesService.SetResponsePayload;
                try {
                    payload = JSON.parse(payloadText);
                } catch (e) {
                    throw new MotifServicesError(ExternalError.Code.ParseMotifServicesServiceSetResponsePayload, payloadText);
                }
                if (payload.successful) {
                    return Promise.resolve();
                } else {
                    return Promise.reject(`${Strings[StringId.MotifServicesResponsePayloadError]}: ${payload.reason}`);
                }
            } else {
                return Promise.reject(`${Strings[StringId.MotifServicesResponseStatusError]}: ${response.status}: ${response.statusText}`);
            }
        } catch (reason) {
            return Promise.reject(`${Strings[StringId.MotifServicesFetchError]}: ${reason}`);
        }
    }

    async deleteUserSetting(key: string): Promise<void> {
        const endpointPath = MotifServicesService.EndpointPath.deleteUserSetting;
        const credentials = 'include';
        const method = 'POST';
        const headers = new Headers([
            ['Authorization', this._getAuthorizationHeaderValue()],
            ['Content-Type', 'application/json'],
        ]);

        const requestJson: MotifServicesService.DeleteRequestPayload = {
            applicationFlavour: this._applicationFlavour,
            applicationEnvironment: this._applicationEnvironment,
            key,
        };
        const body = JSON.stringify(requestJson);

        const url = new URL(endpointPath, this._baseUrl);
        try {
            const response = await fetch(url.href, { credentials, headers, method, body });
            if (response.status === 200) {
                const payloadText = await response.text();
                let payload: MotifServicesService.DeleteResponsePayload;
                try {
                    payload = JSON.parse(payloadText);
                } catch (e) {
                    throw new MotifServicesError(ExternalError.Code.ParseMotifServicesServiceDeleteResponsePayload, payloadText);
                }
                if (payload.successful) {
                    return Promise.resolve();
                } else {
                    return Promise.reject(`${Strings[StringId.MotifServicesResponsePayloadError]}: ${payload.reason}`);
                }
            } else {
                return Promise.reject(`${Strings[StringId.MotifServicesResponseStatusError]}: ${response.status}: ${response.statusText}`);
            }
        } catch (reason) {
            return Promise.reject(`${Strings[StringId.MotifServicesFetchError]}: ${reason}`);
        }
    }

    async getKeysBeginningWith(searchKey: string, overrideApplicationEnvironment?: string): Promise<string | undefined> {
        const endpointPath = MotifServicesService.EndpointPath.getKeysBeginningWith;
        const credentials = 'include';
        const method = 'POST';
        const headers = new Headers({
            Authorization: this._getAuthorizationHeaderValue(),
            'Content-Type': 'application/json'
        });

        const applicationEnvironment = overrideApplicationEnvironment ?? this._applicationEnvironment;
        const request: MotifServicesService.SearchKeyRequestPayload = {
            ApplicationFlavour: this._applicationFlavour,
            ApplicationEnvironment: applicationEnvironment,
            SearchKey: searchKey,
        };
        const body = JSON.stringify(request);

        const url = new URL(endpointPath, this._baseUrl);
        try {
            const response = await fetch(url.href, { credentials, headers, method, body });
            if (response.status === 200) {
                const payloadText = await response.text();
                let payload: MotifServicesService.GetResponsePayload;
                try {
                    payload = JSON.parse(payloadText);
                } catch (e) {
                    throw new MotifServicesError(ExternalError.Code.ParseMotifServicesServiceGetResponsePayload, payloadText);
                }
                if (payload.successful) {
                    return Promise.resolve(payload.data);
                } else {
                    return Promise.reject(`${Strings[StringId.MotifServicesResponsePayloadError]}: ${payload.reason}`);
                }
            } else {
                return Promise.reject(`${Strings[StringId.MotifServicesResponseStatusError]}: ${response.status}: ${response.statusText}`);
            }
        } catch (reason) {
            return Promise.reject(`${Strings[StringId.MotifServicesFetchError]}: ${reason}`);
        }
    }

    async getKeysEndingWith(searchKey: string, overrideApplicationEnvironment?: string): Promise<string | undefined> {
        const endpointPath = MotifServicesService.EndpointPath.getKeysEndingWith;
        const credentials = 'include';
        const method = 'POST';
        const headers = new Headers({
            Authorization: this._getAuthorizationHeaderValue(),
            'Content-Type': 'application/json'
        });

        const applicationEnvironment = overrideApplicationEnvironment ?? this._applicationEnvironment;
        const request: MotifServicesService.SearchKeyRequestPayload = {
            ApplicationFlavour: this._applicationFlavour,
            ApplicationEnvironment: applicationEnvironment,
            SearchKey: searchKey,
        };
        const body = JSON.stringify(request);

        const url = new URL(endpointPath, this._baseUrl);
        try {
            const response = await fetch(url.href, { credentials, headers, method, body });
            if (response.status === 200) {
                const payloadText = await response.text();
                let payload: MotifServicesService.GetResponsePayload;
                try {
                    payload = JSON.parse(payloadText);
                } catch (e) {
                    throw new MotifServicesError(ExternalError.Code.ParseMotifServicesServiceGetResponsePayload, payloadText);
                }
                if (payload.successful) {
                    return Promise.resolve(payload.data);
                } else {
                    return Promise.reject(`${Strings[StringId.MotifServicesResponsePayloadError]}: ${payload.reason}`);
                }
            } else {
                return Promise.reject(`${Strings[StringId.MotifServicesResponseStatusError]}: ${response.status}: ${response.statusText}`);
            }
        } catch (reason) {
            return Promise.reject(`${Strings[StringId.MotifServicesFetchError]}: ${reason}`);
        }
    }

    async getKeysContaining(searchKey: string, overrideApplicationEnvironment?: string): Promise<string | undefined> {
        const endpointPath = MotifServicesService.EndpointPath.getKeysContaining;
        const credentials = 'include';
        const method = 'POST';
        const headers = new Headers({
            Authorization: this._getAuthorizationHeaderValue(),
            'Content-Type': 'application/json'
        });

        const applicationEnvironment = overrideApplicationEnvironment ?? this._applicationEnvironment;
        const request: MotifServicesService.SearchKeyRequestPayload = {
            ApplicationFlavour: this._applicationFlavour,
            ApplicationEnvironment: applicationEnvironment,
            SearchKey: searchKey,
        };
        const body = JSON.stringify(request);

        const url = new URL(endpointPath, this._baseUrl);
        try {
            const response = await fetch(url.href, { credentials, headers, method, body });
            if (response.status === 200) {
                const payloadText = await response.text();
                let payload: MotifServicesService.GetResponsePayload;
                try {
                    payload = JSON.parse(payloadText);
                } catch (e) {
                    throw new MotifServicesError(ExternalError.Code.ParseMotifServicesServiceGetResponsePayload, payloadText);
                }
                if (payload.successful) {
                    return Promise.resolve(payload.data);
                } else {
                    return Promise.reject(`${Strings[StringId.MotifServicesResponsePayloadError]}: ${payload.reason}`);
                }
            } else {
                return Promise.reject(`${Strings[StringId.MotifServicesResponseStatusError]}: ${response.status}: ${response.statusText}`);
            }
        } catch (reason) {
            return Promise.reject(`${Strings[StringId.MotifServicesFetchError]}: ${reason}`);
        }
    }

    private handleMasterSettingsChangedEvent() {
        // do not update applicationEnvironment. A restart is required for this.
        return this.saveMasterSettings();
    }

    private notifyLog(time: Date, logLevelId: Logger.LevelId, text: string) {
        const handlers = this._logEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](time, logLevelId, text);
        }
    }

    private log(logLevelId: Logger.LevelId, text: string) {
        this.notifyLog(new Date(), logLevelId, text);
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

    private async loadMasterSettings() {
        const masterSettings = this._settingsService.master;
        const masterSettingsValue = await this.getUserSetting(AppStorageService.Key.MasterSettings,
            MotifServicesService.masterApplicationEnvironment);
        if (masterSettingsValue === undefined) {
            this.logWarning('Master Settings not found. Using defaults');
            masterSettings.load(undefined);
            this.saveMasterSettings();
        } else {
            this.logInfo('Loading Master Settings');
            const rootElement = new JsonElement();
            const success = rootElement.parse(masterSettingsValue, 'Load Master Settings');
            if (success) {
                masterSettings.load(rootElement);
            } else {
                this.logWarning('Could not parse saved settings. Using defaults');
                masterSettings.load(undefined);
                this.saveMasterSettings();
            }
        }
    }

    private async saveMasterSettings() {
        const rootElement = new JsonElement();
        this._settingsService.master.save(rootElement);
        const settingsAsJsonString = rootElement.stringify();
        this.setUserSetting(AppStorageService.Key.MasterSettings, settingsAsJsonString, MotifServicesService.masterApplicationEnvironment);
    }

    private updateApplicationEnvironment(exchangeEnvironmentId: ExchangeEnvironmentId) {
        const selectorId = this._settingsService.master.applicationEnvironmentSelectorId;
        const applicationEnvironmentId =
            MotifServicesService.ApplicationEnvironment.idFromApplicationEnvironmentSelectorId(selectorId, exchangeEnvironmentId);
        this._applicationEnvironment = MotifServicesService.ApplicationEnvironment.idToValue(applicationEnvironmentId);
    }
}

export namespace MotifServicesService {
    export type GetAuthorizationHeaderValueCallback = (this: void) => string;
    export interface RequestPayload {
    }

    export interface KeyRequestPayload extends RequestPayload {
        applicationFlavour: string;
        applicationEnvironment: string;
        key: string;
    }

    export interface GetRequestPayload extends KeyRequestPayload {
    }

    export interface SetRequestPayload extends KeyRequestPayload {
        value: string;
    }

    export interface DeleteRequestPayload extends KeyRequestPayload {
    }

    export interface SearchKeyRequestPayload extends RequestPayload {
        ApplicationFlavour: string;
        ApplicationEnvironment: string;
        SearchKey: string;
    }

    export interface ResponsePayload {
        readonly successful: boolean;
        readonly reason: string;
    }

    export interface GetResponsePayload extends ResponsePayload {
        data: string;
    }

    export interface SetResponsePayload extends ResponsePayload {
    }

    export interface DeleteResponsePayload extends ResponsePayload {
    }

    export namespace EndpointPath {
        export const getUserSetting = '/api/Settings/GetUserSetting';
        export const setUserSetting = '/api/Settings/SetUserSetting';
        export const deleteUserSetting = '/api/Settings/DeleteUserSetting';
        export const getKeysBeginningWith = '/api/Settings/SearchForKey/BeginsWith';
        export const getKeysEndingWith = '/api/Settings/SearchForKey/EndsWith';
        export const getKeysContaining = '/api/Settings/SearchForKey/Contains';
    }

    export const defaultApplicationFlavour = 'motif';
    export const defaultApplicationEnvironment = 'default';
    export const masterApplicationEnvironment = 'master';
    export const applicationEnvironmentSelectorKey = 'applicationEnvironmentSelector';

    export type LogEvent = (time: Date, logLevelId: Logger.LevelId, text: string) => void;

    export namespace ApplicationEnvironment {
        export const enum Id {
            Default,
            ExchangeEnvironment_Demo,
            ExchangeEnvironment_DelayedProduction,
            ExchangeEnvironment_Production,
            Test,
        }

        export const defaultId = Id.Default;

        interface Info {
            readonly id: Id;
            readonly value: string;
            readonly displayId: StringId;
            readonly titleId: StringId;
        }

        type InfosObject = { [id in keyof typeof Id]: Info };

        const infosObject: InfosObject = {
            Default: {
                id: Id.Default,
                value: 'default',
                displayId: StringId.ApplicationEnvironmentDisplay_Default,
                titleId: StringId.ApplicationEnvironmentTitle_Default,
            },
            ExchangeEnvironment_Demo: {
                id: Id.ExchangeEnvironment_Demo,
                value: 'exchangeEnvironment_Demo',
                displayId: StringId.ApplicationEnvironmentDisplay_ExchangeEnvironment_Demo,
                titleId: StringId.ApplicationEnvironmentTitle_ExchangeEnvironment_Demo,
            },
            ExchangeEnvironment_DelayedProduction: {
                id: Id.ExchangeEnvironment_DelayedProduction,
                value: 'exchangeEnvironment_Delayed',
                displayId: StringId.ApplicationEnvironmentDisplay_ExchangeEnvironment_Delayed,
                titleId: StringId.ApplicationEnvironmentTitle_ExchangeEnvironment_Delayed,
            },
            ExchangeEnvironment_Production: {
                id: Id.ExchangeEnvironment_Production,
                value: 'exchangeEnvironment_Production',
                displayId: StringId.ApplicationEnvironmentDisplay_ExchangeEnvironment_Production,
                titleId: StringId.ApplicationEnvironmentTitle_ExchangeEnvironment_Production,
            },
            Test: {
                id: Id.Test,
                value: 'test',
                displayId: StringId.ApplicationEnvironmentDisplay_Test,
                titleId: StringId.ApplicationEnvironmentTitle_Test,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('ApplicationEnvironment', outOfOrderIdx, Strings[infos[outOfOrderIdx].displayId]);
            }
        }

        export function idToValue(id: Id) {
            return infos[id].value;
        }

        export function tryValueToId(value: string) {
            const foundInfo = infos.find((info) => info.value === value);
            return foundInfo?.id;
        }

        export function idFromApplicationEnvironmentSelectorId(selectorId: MasterSettings.ApplicationEnvironmentSelector.SelectorId,
            exchangeEnvironmentId: ExchangeEnvironment.Id) {
            switch (selectorId) {
                case MasterSettings.ApplicationEnvironmentSelector.SelectorId.Default:
                    return ApplicationEnvironment.Id.Default;
                case MasterSettings.ApplicationEnvironmentSelector.SelectorId.ExchangeEnvironment:
                    switch (exchangeEnvironmentId) {
                        case ExchangeEnvironmentId.Production: return ApplicationEnvironment.Id.ExchangeEnvironment_Production;
                        case ExchangeEnvironmentId.DelayedProduction:
                            return ApplicationEnvironment.Id.ExchangeEnvironment_DelayedProduction;
                        case ExchangeEnvironmentId.Demo: return ApplicationEnvironment.Id.ExchangeEnvironment_Demo;
                        default: throw new UnreachableCaseError('MHSAESITAEEE398558', exchangeEnvironmentId);
                    }
                case MasterSettings.ApplicationEnvironmentSelector.SelectorId.ExchangeEnvironment_Demo:
                    return ApplicationEnvironment.Id.ExchangeEnvironment_Demo;
                case MasterSettings.ApplicationEnvironmentSelector.SelectorId.ExchangeEnvironment_DelayedProduction:
                    return ApplicationEnvironment.Id.ExchangeEnvironment_DelayedProduction;
                case MasterSettings.ApplicationEnvironmentSelector.SelectorId.ExchangeEnvironment_Production:
                    return ApplicationEnvironment.Id.ExchangeEnvironment_Production;
                case MasterSettings.ApplicationEnvironmentSelector.SelectorId.Test:
                    return ApplicationEnvironment.Id.Test;
                default:
                    throw new UnreachableCaseError('MHSAESITAED2905661', selectorId);
            }
        }
    }
}

export namespace MotifServicesServiceModule {
    export function initialiseStatic() {
        MotifServicesService.ApplicationEnvironment.initialise();
    }
}
