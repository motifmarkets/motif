/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { ExchangeEnvironmentId, ExchangeInfo, LitIvemId, ZenithPublisherSubscriptionManager } from 'src/adi/internal-api';
import { ExtensionInfo, PersistableExtensionInfo } from 'src/content/internal-api';
import { ConfigError, createRandomUrlSearch, ExternalError, Logger } from 'src/sys/internal-api';
import { Config } from '../config';

@Injectable({
    providedIn: 'root'
})
export class ConfigNgService {
    version: string;
    config: Config;

    constructor() { }
}

export namespace ConfigNgService {
    export function getLoadFtn(configService: ConfigNgService) {
        return (): Promise<boolean> => load(configService);
    }

    export async function load(configService: ConfigNgService): Promise<boolean> {
        const versionFileName = 'version.txt';

        const configFolderPath = '_config-do-not-delete';
        const configJsonFileName = 'config.json';
        const randomUrlSearch = createRandomUrlSearch();

        const versionUri = `./${versionFileName}${randomUrlSearch}`;
        const configJsonUri = `./${configFolderPath}/${configJsonFileName}${randomUrlSearch}`;
        const [versionResponse, configResponse] = await Promise.all([fetch(versionUri), fetch(configJsonUri)]);

        if (versionResponse.status !== 200) {
            throw new ConfigError(ExternalError.Code.CSL23230003998, 'VersionHTTP',
                `${versionResponse.status}: "${versionResponse.statusText}" Uri: ${versionResponse}`);
        } else {
            const versionText = await versionResponse.text();
            configService.version = versionText.trim();

            if (configResponse.status !== 200) {
                throw new ConfigError(ExternalError.Code.CSL23230003998, 'ConfigHTTP',
                    `${configResponse.status}: "${configResponse.statusText}" Uri: ${configJsonUri}`);
            } else {
                const configText = await configResponse.text();
                return loadText(configService, configText, configFolderPath);
            }
        }
    }

    const acceptedConfigFormatVersion = '2';

    export interface ConfigJson {
        readonly configFormatVersion: string;
        readonly configComment?: string;
        readonly service: Service.Json;
        readonly exchange: Exchange.Json;
        readonly endpoints: Endpoints.Json;
        readonly openId: OpenId.Json;
        readonly defaultLayout?: DefaultLayout.Json;
        readonly bundledExtensions?: BundledExtensions.Json;
        readonly diagnostics?: Diagnostics.Json;
        readonly features?: Features.Json;
        readonly branding?: Branding.Json;
    }

    export namespace Service {
        export interface Json {
            readonly name: string;
            readonly description?: string;
        }

        export function parseJson(json: Json, jsonText: string) {
            const name = json.name;
            if (name === undefined) {
                throw new ConfigError(ExternalError.Code.CSSPJN14499232322, '?', jsonText);
            } else {
                const description = json.description;

                const service: Config.Service = {
                    name,
                    description,
                };

                return service;
            }
        }
    }

    export namespace Exchange {
        export interface Json {
            readonly environment: Environment;
            readonly bannerOverrideEnvironment: Environment | '' | undefined;
            readonly defaultDefault: string;
        }

        export const enum Environment {
            Production = 'production',
            DelayedProduction = 'delayedProduction',
            Demo = 'demo',
        }

        export function tryEnvironmentToId(value: Environment): ExchangeEnvironmentId | undefined {
            switch (value) {
                case Environment.Production: return ExchangeEnvironmentId.Production;
                case Environment.DelayedProduction: return ExchangeEnvironmentId.DelayedProduction;
                case Environment.Demo: return ExchangeEnvironmentId.Demo;
            }
        }

        export function parseJson(json: Json, serviceName: string) {
            const defaultDefault = json.defaultDefault;
            if (defaultDefault === undefined) {
                throw new ConfigError(ExternalError.Code.CSEPJDDU97222185554, serviceName, '');
            } else {
                const defaultDefaultExchangeId = ExchangeInfo.tryJsonValueToId(defaultDefault);
                if (defaultDefaultExchangeId === undefined) {
                    throw new ConfigError(ExternalError.Code.CSLEPJDDEIU2248883843, serviceName, defaultDefault);
                } else {
                    const environment = json.environment;
                    if (environment === undefined) {
                        throw new ConfigError(ExternalError.Code.CSEPJEU907222185554, serviceName, '');
                    } else {
                        const environmentId = tryEnvironmentToId(environment);
                        if (environmentId === undefined) {
                            throw new ConfigError(ExternalError.Code.CSEPJET9072322185564, serviceName, environment);
                        } else {
                            let bannerOverrideEnvironmentId: ExchangeEnvironmentId | undefined;
                            const bannerOverrideEnvironment = json.bannerOverrideEnvironment;
                            if (bannerOverrideEnvironment === undefined || bannerOverrideEnvironment === '') {
                                bannerOverrideEnvironmentId = undefined;
                            } else {
                                bannerOverrideEnvironmentId = tryEnvironmentToId(bannerOverrideEnvironment);

                                if (bannerOverrideEnvironmentId === undefined) {
                                    throw new ConfigError(ExternalError.Code.CSEPJOE9072322185564, serviceName, environment);
                                }
                            }
                            const exchange: Config.Exchange = {
                                defaultDefaultExchangeId,
                                environmentId,
                                bannerOverrideEnvironmentId,
                            };
                            return exchange;
                        }
                    }
                }
            }
        }
    }

    export namespace Endpoints {
        export interface Json {
            readonly motifServices: readonly string[];
            readonly zenith: readonly string[];
        }

        export function parseJson(json: Json, serviceName: string) {
            const motifServices = json.motifServices;
            if (motifServices === undefined) {
                throw new ConfigError(ExternalError.Code.CSEPPMSU00831852399, serviceName, '');
            } else {
                if (motifServices.length === 0) {
                    throw new ConfigError(ExternalError.Code.CSEPPMSL00831852399, serviceName, '');
                } else {
                    if (motifServices[0].length === 0) {
                        throw new ConfigError(ExternalError.Code.CSEPPMSE00831852399, serviceName, '');
                    } else {
                        const zenith = json.zenith;
                        if (zenith === undefined) {
                            throw new ConfigError(ExternalError.Code.CSEPPZU00831852399, serviceName, '');
                        } else {
                            if (zenith.length === 0) {
                                throw new ConfigError(ExternalError.Code.CSEPPZL00831852399, serviceName, '');
                            } else {
                                if (zenith[0].length === 0) {
                                    throw new ConfigError(ExternalError.Code.CSEPPZE00831852399, serviceName, '');
                                } else {
                                    const endpoints: Config.Endpoints = {
                                        motifServices,
                                        zenith,
                                    };

                                    return endpoints;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    export namespace OpenId {
        export interface Json {
            readonly authority: string;
            readonly clientId: string;
            readonly redirectUri: string;
            readonly silentRedirectUri: string;
            readonly scope: string;
        }

        export function parseJson(json: Json, serviceName: string) {
            const authority = json.authority;
            if (authority === undefined) {
                throw new ConfigError(ExternalError.Code.CSOIPJA0831852399, serviceName, '');
            } else {
                const clientId = json.clientId;
                if (clientId === undefined) {
                    throw new ConfigError(ExternalError.Code.CSOIPJCI100194724, serviceName, '');
                } else {
                    const redirectUri = json.redirectUri;
                    if (redirectUri === undefined) {
                        throw new ConfigError(ExternalError.Code.CSOIPJRU33448829, serviceName, '');
                    } else {
                        const silentRedirectUri = json.silentRedirectUri;
                        if (silentRedirectUri === undefined) {
                            throw new ConfigError(ExternalError.Code.CSOIPJSR12120987, serviceName, '');
                        } else {
                            const scope = json.scope;
                            if (scope === undefined) {
                                throw new ConfigError(ExternalError.Code.CSOIPJSC67773223, serviceName, '');
                            } else {
                                const openId: Config.OpenId = {
                                    authority,
                                    clientId,
                                    redirectUri,
                                    silentRedirectUri,
                                    scope,
                                };

                                return openId;
                            }
                        }
                    }
                }
            }
        }
    }

    export namespace DefaultLayout {
        export interface Json {
            readonly internalName: string | undefined;
            readonly instanceName: string | undefined;
            readonly linkedSymbol: LitIvemId.Json | undefined;
            readonly watchlist: LitIvemId.Json[] | undefined;
        }

        export function parseJson(json: Json | undefined, serviceName: string, exchangeEnvironmentId: ExchangeEnvironmentId) {
            if (json === undefined) {
                const defaultLayout: Config.DefaultLayout = {
                    internalName: undefined,
                    instanceName: undefined,
                    linkedSymbol: undefined,
                    watchlist: undefined,
                };
                return defaultLayout;
            } else {
                // Since ExchangeEnvironment is not yet set up with defaultEnvironmentId, make sure all LitIvemId JSON have
                // a defined environment
                const linkedSymbolJson = json.linkedSymbol;
                let linkedSymbol: LitIvemId | undefined;
                if (linkedSymbolJson === undefined) {
                    linkedSymbol = undefined;
                } else {
                    const environmentedLinkedSymbolJson = LitIvemId.Json.ensureEnvironmented(linkedSymbolJson, exchangeEnvironmentId);
                    linkedSymbol = LitIvemId.tryCreateFromJson(environmentedLinkedSymbolJson);
                    if (linkedSymbol === undefined) {
                        Logger.logConfigError('CNSDLPJL3555588', JSON.stringify(linkedSymbolJson), 200);
                    }
                }
                const watchlistJson = json.watchlist;
                let watchlist: LitIvemId[] | undefined;
                if (watchlistJson === undefined) {
                    watchlist = undefined;
                } else {
                    const count = watchlistJson.length;
                    const environmentedWatchlistJson = new Array<LitIvemId.EnvironmentedJson>(count);
                    for (let i = 0; i < count; i++) {
                        const symbolJson = watchlistJson[i];
                        environmentedWatchlistJson[i] = LitIvemId.Json.ensureEnvironmented(symbolJson, exchangeEnvironmentId);
                    }
                    watchlist = LitIvemId.tryCreateArrayFromJson(environmentedWatchlistJson);
                    if (watchlist === undefined) {
                        Logger.logConfigError('CNSDLPJW3555588', JSON.stringify(watchlistJson), 400);
                    }
                }
                const defaultLayout: Config.DefaultLayout = {
                    internalName: json.internalName,
                    instanceName: json.instanceName,
                    linkedSymbol,
                    watchlist,
                };
                return defaultLayout;
            }
        }
    }

    export namespace BundledExtensions {
        export interface BundledExtension {
            readonly info: ExtensionInfo;
            readonly install: boolean;
        }

        export interface BundledExtensionJson {
            readonly info: PersistableExtensionInfo;
            readonly install: boolean;
        }
        export type Json = BundledExtensionJson[];

        export function parseJson(json: Json | undefined, serviceName: string): Config.BundledExtensions {
            if (json !== undefined) {
                if (!Array.isArray(json)) {
                    Logger.logConfigError('CNSDEPJA23300911', serviceName);
                } else {
                    const maxCount = json.length;
                    const result = new Array<BundledExtension>(maxCount);
                    let count = 0;
                    for (let i = 0; i < maxCount; i++) {
                        const bundledExtensionJson = json[i];
                        const bundledExtension = parseBundledExtensionJson(bundledExtensionJson, serviceName);
                        if (bundledExtension !== undefined) {
                            result[count++] = bundledExtension;
                        }
                    }
                    result.length = count;
                    return result;
                }
            }

            return [];
        }

        export function parseBundledExtensionJson(json: BundledExtensionJson | undefined, serviceName: string) {
            if (json === undefined) {
                Logger.logConfigError('CNSPJU13300911', serviceName);
            } else {
                if (!checkBoolean(json.install)) {
                    Logger.logConfigError('CNSPJI13300911', serviceName);
                } else {
                    const fromResult = ExtensionInfo.fromPersistable(json.info);
                    const errorText = fromResult.errorText;
                    if (errorText !== undefined) {
                        Logger.logConfigError('CNSPJU13300911', `"${serviceName}": ${errorText}`);
                    } else {
                        const result: BundledExtension = {
                            info: fromResult.info,
                            install: json.install,
                        };
                        return result;
                    }
                }
            }
            return undefined;
        }
        function checkBoolean(value: boolean) {
            return value !== undefined && typeof value === 'boolean';
        }
    }

    export namespace Diagnostics {
        export interface Json {
            readonly appNotifyErrors?: boolean;
            readonly telemetryEnabled?: boolean;
            readonly zenithLogLevel?: ZenithLog.Level;
            readonly dataSubscriptionCachingDisabled?: boolean;
            readonly motifServicesBypass?: MotifServicesBypass.Json;
        }

        export function parseJson(json: Json | undefined, serviceName: string) {
            if (json === undefined) {
                const diagnostics: Config.Diagnostics = {
                    appNotifyErrors: Config.Diagnostics.defaultAppNotifyErrors,
                    telemetryEnabled: Config.Diagnostics.defaultTelemetryEnabled,
                    zenithLogLevelId: Config.Diagnostics.ZenithLog.defaultLevelId,
                    dataSubscriptionCachingDisabled: Config.Diagnostics.defaultDataSubscriptionCachingDisabled,
                    motifServicesBypass: MotifServicesBypass.parseJson(undefined),
                };

                return diagnostics;
            } else {
                const diagnostics: Config.Diagnostics = {
                    appNotifyErrors: json.appNotifyErrors ?? Config.Diagnostics.defaultAppNotifyErrors,
                    telemetryEnabled: json.telemetryEnabled ?? Config.Diagnostics.defaultTelemetryEnabled,
                    zenithLogLevelId: ZenithLog.parseJson(json.zenithLogLevel, serviceName),
                    dataSubscriptionCachingDisabled: json.dataSubscriptionCachingDisabled ??
                        Config.Diagnostics.defaultDataSubscriptionCachingDisabled,
                    motifServicesBypass: MotifServicesBypass.parseJson(json.motifServicesBypass),
                };

                return diagnostics;
            }
        }

        export namespace ZenithLog {
            export const enum Level {
                Off = 'off',
                Partial = 'partial',
                Full = 'full'
            }

            function tryLevelToId(value: Level): ZenithPublisherSubscriptionManager.LogLevelId | undefined {
                switch (value) {
                    case Level.Off: return ZenithPublisherSubscriptionManager.LogLevelId.Off;
                    case Level.Partial: return ZenithPublisherSubscriptionManager.LogLevelId.Partial;
                    case Level.Full: return ZenithPublisherSubscriptionManager.LogLevelId.Full;
                }
            }

            // eslint-disable-next-line @typescript-eslint/no-shadow
            export function parseJson(level: Level | undefined, serviceName: string) {
                if (level === undefined) {
                    return Config.Diagnostics.ZenithLog.defaultLevelId;
                } else {
                    const levelId = tryLevelToId(level);
                    if (levelId === undefined) {
                        throw new ConfigError(ExternalError.Code.CSDZLPJ788831131, serviceName, level);
                    } else {
                        return levelId;
                    }
                }
            }
        }

        export namespace MotifServicesBypass {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            export interface Json {
                readonly useZenithAuthOwnerAuthentication?: boolean;
                readonly useLocalStateStorage?: boolean;
            }

            // eslint-disable-next-line @typescript-eslint/no-shadow
            export function parseJson(json: Json | undefined) {
                let useZenithAuthOwnerAuthentication: boolean;
                let useLocalStateStorage: boolean;

                if (json === undefined) {
                    useZenithAuthOwnerAuthentication = Config.Diagnostics.MotifServicesBypass.defaultUseZenithAuthOwnerAuthentication;
                    useLocalStateStorage = Config.Diagnostics.MotifServicesBypass.defaultUseLocalStateStorage;
                } else {
                    useZenithAuthOwnerAuthentication = json.useZenithAuthOwnerAuthentication ??
                        Config.Diagnostics.MotifServicesBypass.defaultUseZenithAuthOwnerAuthentication;
                    useLocalStateStorage = json.useLocalStateStorage ?? Config.Diagnostics.MotifServicesBypass.defaultUseLocalStateStorage;
                }

                const motifServicesBypass: Config.Diagnostics.MotifServicesBypass = {
                    useZenithAuthOwnerAuthentication,
                    useLocalStateStorage,
                };

                return motifServicesBypass;
            }
        }
    }

    export namespace Features {
        export interface Json {
            readonly preview?: boolean;
        }

        export function parseJson(json: Json | undefined) {
            const preview = json?.preview ?? Config.Features.defaultPreview;

            const features: Config.Features = {
                preview,
            };

            return features;
        }
    }

    export namespace Branding {
        export interface Json {
            readonly startupTopSplashImageUrl?: string;
            readonly desktopBarLeftImageUrl?: string;
        }

        export function parseJson(json: Json | undefined, configFolderPath: string): Config.Branding {
            if (json === undefined) {
                return {
                    startupTopSplashImageUrl: undefined,
                    desktopBarLeftImageUrl: undefined,
                }
            } else {
                let startupTopSplashImageUrl = json.startupTopSplashImageUrl;
                if (startupTopSplashImageUrl !== undefined) {
                    if (startupTopSplashImageUrl.indexOf('http://') !== 0 && startupTopSplashImageUrl.indexOf('https://') !== 0) {
                        startupTopSplashImageUrl = '/' + configFolderPath + '/' + startupTopSplashImageUrl;
                    }
                }

                let desktopBarLeftImageUrl = json.desktopBarLeftImageUrl;
                if (desktopBarLeftImageUrl !== undefined) {
                    if (desktopBarLeftImageUrl.indexOf('http://') !== 0 && desktopBarLeftImageUrl.indexOf('https://') !== 0) {
                        desktopBarLeftImageUrl = '/' + configFolderPath + '/' + desktopBarLeftImageUrl;
                    }
                }

                return {
                    startupTopSplashImageUrl,
                    desktopBarLeftImageUrl,
                }
            }
        }
    }

    function logConfigError(code: string, jsonText: string) {
        Logger.logConfigError(code, jsonText, 500);
    }

    function loadText(configService: ConfigNgService, jsonText: string, configFolderPath: string): Promise<boolean> {
        let configJson: ConfigJson;
        try {
            configJson = JSON.parse(jsonText);
        } catch (e) {
            logConfigError('CSLTP988871038839', jsonText);
            throw (e);
        }

        if (configJson.configFormatVersion !== acceptedConfigFormatVersion) {
            throw new ConfigError(ExternalError.Code.CSLTF1988871038839, '?', jsonText);
        } else {
            const service = ConfigNgService.Service.parseJson(configJson.service, jsonText);
            const exchange = ConfigNgService.Exchange.parseJson(configJson.exchange, service.name);
            const endpoints = ConfigNgService.Endpoints.parseJson(configJson.endpoints, service.name);
            const openId = ConfigNgService.OpenId.parseJson(configJson.openId, service.name);
            const defaultLayout = ConfigNgService.DefaultLayout.parseJson(configJson.defaultLayout, service.name,
                exchange.environmentId
            );
            const bundledExtensions = ConfigNgService.BundledExtensions.parseJson(configJson.bundledExtensions,
                service.name
            );
            const diagnostics = ConfigNgService.Diagnostics.parseJson(configJson.diagnostics, service.name);
            const features = ConfigNgService.Features.parseJson(configJson.features);
            const branding = ConfigNgService.Branding.parseJson(configJson.branding, configFolderPath);
            const config: Config = {
                service,
                exchange,
                endpoints,
                openId,
                defaultLayout,
                bundledExtensions,
                diagnostics,
                features,
                branding,
            };

            const validationError = Config.checkForValidationError(config);
            if (validationError !== undefined) {
                throw new ConfigError(ExternalError.Code.CSLTV777333999, service.name, validationError);
            } else {
                configService.config = config;
                return Promise.resolve(true);
            }
        }
    }
}
