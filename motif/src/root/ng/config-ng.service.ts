/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
    ConfigError,
    createRandomUrlSearch,
    DataEnvironment,
    DataEnvironmentId,
    ExchangeInfo,
    ExternalError,
    LitIvemId,
    Logger,
    ZenithPublisherSubscriptionManager
} from '@motifmarkets/motif-core';
import { ExtensionInfo, PersistableExtensionInfo } from 'content-internal-api';
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
    export function getLoadFtn(domSanitizer: DomSanitizer, configService: ConfigNgService) {
        return (): Promise<boolean> => load(domSanitizer, configService);
    }

    export async function load(domSanitizer: DomSanitizer, configService: ConfigNgService): Promise<boolean> {
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
                return loadText(domSanitizer, configService, configText, configFolderPath);
            }
        }
    }

    const acceptedConfigFormatVersion = '2';

    export interface ConfigJson {
        readonly configFormatVersion: string;
        readonly configComment?: string;
        readonly environment: Environment.Json;
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

    export namespace Environment {
        export interface Json {
            readonly defaultDataEnvironment: DataEnvironmentEnum;
            readonly bannerOverrideDataEnvironment: DataEnvironmentEnum | '' | undefined;
        }

        export const enum DataEnvironmentEnum {
            Production = 'production',
            DelayedProduction = 'delayedProduction',
            Demo = 'demo',
            Sample = 'sample',
        }

        export function tryDataEnvironmentToId(value: DataEnvironmentEnum): DataEnvironmentId | undefined {
            switch (value) {
                case DataEnvironmentEnum.Production: return DataEnvironmentId.Production;
                case DataEnvironmentEnum.DelayedProduction: return DataEnvironmentId.DelayedProduction;
                case DataEnvironmentEnum.Demo: return DataEnvironmentId.Demo;
                case DataEnvironmentEnum.Sample: return DataEnvironmentId.Sample;
                default: return undefined;
            }
        }

        export function parseJson(json: Json, serviceName: string) {
            if (json === undefined) {
                throw new ConfigError(ExternalError.Code.ConfigMissingEnvironment, serviceName, '');
            } else {
                const defaultDataEnvironment = json.defaultDataEnvironment;
                if (defaultDataEnvironment === undefined) {
                    throw new ConfigError(ExternalError.Code.ConfigEnvironmentMissingDefaultData, serviceName, '');
                } else {
                    const defaultDataEnvironmentId = tryDataEnvironmentToId(defaultDataEnvironment);
                    if (defaultDataEnvironmentId === undefined) {
                        throw new ConfigError(ExternalError.Code.CSEPJET9072322185564, serviceName, defaultDataEnvironment);
                    } else {
                        let bannerOverrideDataEnvironmentId: DataEnvironmentId | undefined;
                        const bannerOverrideDataEnvironment = json.bannerOverrideDataEnvironment;
                        if (bannerOverrideDataEnvironment === undefined || bannerOverrideDataEnvironment === '') {
                            bannerOverrideDataEnvironmentId = undefined;
                        } else {
                            bannerOverrideDataEnvironmentId = tryDataEnvironmentToId(bannerOverrideDataEnvironment);

                            if (bannerOverrideDataEnvironmentId === undefined) {
                                throw new ConfigError(ExternalError.Code.CSEPJOE9072322185564, serviceName, defaultDataEnvironment);
                            }
                        }
                        const environment: Config.Environment = {
                            defaultDataEnvironmentId,
                            bannerOverrideDataEnvironmentId,
                        };
                        return environment;
                    }
                }
            }
        }
    }

    export namespace Service {
        export interface Json {
            readonly name: string;
            readonly description?: string;
        }

        export function parseJson(json: Json, jsonText: string) {
            if (json === undefined) {
                throw new ConfigError(ExternalError.Code.ConfigMissingService, '?', jsonText);
            } else {
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
    }

    export namespace Exchange {
        export interface Json {
            readonly defaultDefault: string;
            readonly options?: Json.Option[];
        }

        export namespace Json {
            export interface Option {
                readonly exchange: string;
                readonly overriddenDefaultDataEnvironment?: Environment.DataEnvironmentEnum;
            }
        }

        export function parseJson(json: Json, serviceName: string) {
            if (json === undefined) {
                throw new ConfigError(ExternalError.Code.ConfigMissingExchange, serviceName, '');
            } else {
                const defaultDefault = json.defaultDefault;
                if (defaultDefault === undefined) {
                    throw new ConfigError(ExternalError.Code.CSEPJDDU97222185554, serviceName, '');
                } else {
                    const defaultDefaultExchangeId = ExchangeInfo.tryJsonValueToId(defaultDefault);
                    if (defaultDefaultExchangeId === undefined) {
                        throw new ConfigError(ExternalError.Code.CSLEPJDDEIU2248883843, serviceName, defaultDefault);
                    } else {
                        const optionsJson = json.options;
                        let options: Config.Exchange.Option[] | undefined;
                        if (optionsJson !== undefined) {
                            if (!Array.isArray(optionsJson)) {
                                Logger.logConfigError('CNSEPJA24988', serviceName);
                            } else {
                                const count = optionsJson.length;
                                options = new Array<Config.Exchange.Option>(count);
                                for (let i = 0; i < count; i++) {
                                    const optionJson = optionsJson[i];
                                    const option = parseOptionJson(optionJson, serviceName);
                                    options[i] = option;
                                }
                            }
                        }
                        const exchange: Config.Exchange = {
                            defaultDefaultExchangeId,
                            options,
                        };
                        return exchange;
                    }
                }
            }
        }

        function parseOptionJson(optionJson: Json.Option, serviceName: string): Config.Exchange.Option {
            const exchangeJson = optionJson.exchange;
            const exchangeId = ExchangeInfo.tryJsonValueToId(exchangeJson);
            if (exchangeId === undefined) {
                throw new ConfigError(ExternalError.Code.CSLEPJDDEIU2248883844, serviceName, exchangeJson);
            } else {
                const overriddenDefaultDataEnvironmentJson = optionJson.overriddenDefaultDataEnvironment;
                let overriddenDefaultDataEnvironmentId: DataEnvironmentId | undefined;
                if (overriddenDefaultDataEnvironmentJson !== undefined) {
                    overriddenDefaultDataEnvironmentId = DataEnvironment.tryJsonToId(overriddenDefaultDataEnvironmentJson);
                    if (overriddenDefaultDataEnvironmentId === undefined) {
                        throw new ConfigError(ExternalError.Code.CSLEPOJDDEIU2248883845, serviceName, overriddenDefaultDataEnvironmentJson);
                    }
                }

                const result: Config.Exchange.Option = {
                    exchangeId,
                    overriddenDefaultDataEnvironmentId,
                };

                return result;
            }
        }
    }

    export namespace Endpoints {
        export interface Json {
            readonly motifServices: readonly string[];
            readonly zenith: readonly string[];
        }

        export function parseJson(json: Json, serviceName: string) {
            if (json === undefined) {
                throw new ConfigError(ExternalError.Code.ConfigMissingEndpoints, serviceName, '');
            } else {
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
            if (json === undefined) {
                throw new ConfigError(ExternalError.Code.ConfigMissingOpenId, serviceName, '');
            } else {
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
    }

    export namespace DefaultLayout {
        export interface Json {
            readonly internalName: string | undefined;
            readonly instanceName: string | undefined;
            readonly linkedSymbol: LitIvemId.Json | undefined;
            readonly watchlist: LitIvemId.Json[] | undefined;
        }

        export function parseJson(json: Json | undefined) {
            let defaultLayout: Config.DefaultLayout;
            if (json === undefined) {
                defaultLayout = {
                    internalName: undefined,
                    instanceName: undefined,
                    linkedSymbolJson: undefined,
                    watchlistJson: undefined,
                };
            } else {
                defaultLayout = {
                    internalName: json.internalName,
                    instanceName: json.instanceName,
                    linkedSymbolJson: json.linkedSymbol,
                    watchlistJson: json.watchlist,
                };
            }
            return defaultLayout;
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
            readonly telemetry?: Telemetry.Json;
            readonly zenithLogLevel?: ZenithLog.Level;
            readonly dataSubscriptionCachingDisabled?: boolean;
            readonly motifServicesBypass?: MotifServicesBypass.Json;
        }

        export function parseJson(json: Json | undefined, serviceName: string) {
            if (json === undefined) {
                const diagnostics: Config.Diagnostics = {
                    appNotifyErrors: Config.Diagnostics.defaultAppNotifyErrors,
                    telemetry: Telemetry.parseJson(undefined, serviceName),
                    zenithLogLevelId: Config.Diagnostics.ZenithLog.defaultLevelId,
                    dataSubscriptionCachingDisabled: Config.Diagnostics.defaultDataSubscriptionCachingDisabled,
                    motifServicesBypass: MotifServicesBypass.parseJson(undefined),
                };

                return diagnostics;
            } else {
                const diagnostics: Config.Diagnostics = {
                    appNotifyErrors: json.appNotifyErrors ?? Config.Diagnostics.defaultAppNotifyErrors,
                    telemetry: Telemetry.parseJson(json.telemetry, serviceName),
                    zenithLogLevelId: ZenithLog.parseJson(json.zenithLogLevel, serviceName),
                    dataSubscriptionCachingDisabled: json.dataSubscriptionCachingDisabled ??
                        Config.Diagnostics.defaultDataSubscriptionCachingDisabled,
                    motifServicesBypass: MotifServicesBypass.parseJson(json.motifServicesBypass),
                };

                return diagnostics;
            }
        }

        export namespace Telemetry {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            export interface Json {
                enabled?: boolean;
                itemsPerMinute?: number;
                maxErrorCount?: number;
                itemIgnores?: Config.Diagnostics.Telemetry.ItemIgnore[];
            }

            // eslint-disable-next-line @typescript-eslint/no-shadow
            export function parseJson(json: Json | undefined, serviceName: string) {
                let enabled: boolean;
                let itemsPerMinute: number;
                let maxErrorCount: number;
                let itemIgnores: Config.Diagnostics.Telemetry.ItemIgnore[];

                if (json === undefined) {
                    enabled = Config.Diagnostics.Telemetry.defaultEnabled;
                    itemsPerMinute = Config.Diagnostics.Telemetry.defaultItemsPerMinute;
                    maxErrorCount = Config.Diagnostics.Telemetry.defaultMaxErrorCount;
                    itemIgnores = Config.Diagnostics.Telemetry.defaultItemIgnores;
                } else {
                    enabled = json.enabled ?? Config.Diagnostics.Telemetry.defaultEnabled;
                    itemsPerMinute = json.itemsPerMinute ?? Config.Diagnostics.Telemetry.defaultItemsPerMinute;
                    maxErrorCount = json.maxErrorCount ?? Config.Diagnostics.Telemetry.defaultMaxErrorCount;
                    itemIgnores = parseItemIgnoresJson(json.itemIgnores, serviceName);
                }
                const telemetry: Config.Diagnostics.Telemetry = {
                    enabled,
                    itemsPerMinute,
                    maxErrorCount,
                    itemIgnores,
                };

                return telemetry;
            }

            export function parseItemIgnoresJson(json: Config.Diagnostics.Telemetry.ItemIgnore[] | undefined, serviceName: string) {
                if (json !== undefined) {
                    if (!Array.isArray(json)) {
                        Logger.logConfigError('CNSDTPIIJA13300911', serviceName);
                    } else {
                        let invalid = false;
                        for (const itemIgnore of json) {
                            if (typeof itemIgnore !== 'object' || itemIgnore === null) {
                                Logger.logConfigError('CNSDTPIIJO13300911', serviceName);
                                invalid = true;
                                break;
                            } else {
                                const typeId = itemIgnore.typeId;
                                if (typeof typeId !== 'string') {
                                    Logger.logConfigError('CNSDTPIIJS13300911', serviceName);
                                    invalid = true;
                                    break;
                                } else {
                                    if (!Config.Diagnostics.Telemetry.ItemIgnore.Type.isValidId(typeId)) {
                                        Logger.logConfigError('CNSDTPIIJTU13300911', `${serviceName}: ${typeId}`);
                                        invalid = true;
                                        break;
                                    }
                                }
                            }
                        }

                        if (!invalid) {
                            return json;
                        }
                    }
                }
                return Config.Diagnostics.Telemetry.defaultItemIgnores;
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
                readonly useLocalStateStorage?: boolean;
            }

            // eslint-disable-next-line @typescript-eslint/no-shadow
            export function parseJson(json: Json | undefined) {
                let useLocalStateStorage: boolean;

                if (json === undefined) {
                    useLocalStateStorage = Config.Diagnostics.MotifServicesBypass.defaultUseLocalStateStorage;
                } else {
                    useLocalStateStorage = json.useLocalStateStorage ?? Config.Diagnostics.MotifServicesBypass.defaultUseLocalStateStorage;
                }

                const motifServicesBypass: Config.Diagnostics.MotifServicesBypass = {
                    useLocalStateStorage,
                };

                return motifServicesBypass;
            }
        }
    }

    export namespace Features {
        export interface Json {
            readonly preview?: boolean;
            readonly advertising?: boolean;
        }

        export function parseJson(json: Json | undefined) {
            const preview = json?.preview ?? Config.Features.defaultPreview;
            const advertising = json?.advertising ?? Config.Features.defaultAdvertising;

            const features: Config.Features = {
                preview,
                advertising,
            };

            return features;
        }
    }

    export namespace Branding {
        export interface Json {
            readonly startupSplashWebPageUrl?: string;
            readonly desktopBarLeftImageUrl?: string;
        }

        export function parseJson(sanitizer: DomSanitizer, json: Json | undefined, configFolderPath: string): Config.Branding {
            if (json === undefined) {
                return {
                    startupSplashWebPageSafeResourceUrl: undefined,
                    desktopBarLeftImageUrl: undefined,
                };
            } else {
                let startupSplashWebPageSafeResourceUrl: SafeResourceUrl | undefined;
                let startupSplashWebPageUrl = json.startupSplashWebPageUrl;
                if (startupSplashWebPageUrl === undefined) {
                    startupSplashWebPageSafeResourceUrl = undefined;
                } else {
                    if (startupSplashWebPageUrl.indexOf('http://') !== 0 && startupSplashWebPageUrl.indexOf('https://') !== 0) {
                        startupSplashWebPageUrl = '/' + configFolderPath + '/' + startupSplashWebPageUrl;
                    }
                    startupSplashWebPageSafeResourceUrl = sanitizer.bypassSecurityTrustResourceUrl(startupSplashWebPageUrl);
                }

                let desktopBarLeftImageUrl = json.desktopBarLeftImageUrl;
                if (desktopBarLeftImageUrl !== undefined) {
                    if (desktopBarLeftImageUrl.indexOf('http://') !== 0 && desktopBarLeftImageUrl.indexOf('https://') !== 0) {
                        desktopBarLeftImageUrl = '/' + configFolderPath + '/' + desktopBarLeftImageUrl;
                    }
                }

                return {
                    startupSplashWebPageSafeResourceUrl,
                    desktopBarLeftImageUrl,
                };
            }
        }
    }

    function logConfigError(code: string, jsonText: string) {
        Logger.logConfigError(code, jsonText, 500);
    }

    function loadText(
        sanitizer: DomSanitizer,
        configService: ConfigNgService,
        jsonText: string,
        configFolderPath: string,
    ): Promise<boolean> {
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
            const environment = ConfigNgService.Environment.parseJson(configJson.environment, service.name);
            const exchange = ConfigNgService.Exchange.parseJson(configJson.exchange, service.name);
            const endpoints = ConfigNgService.Endpoints.parseJson(configJson.endpoints, service.name);
            const openId = ConfigNgService.OpenId.parseJson(configJson.openId, service.name);
            const defaultLayout = ConfigNgService.DefaultLayout.parseJson(configJson.defaultLayout);
            const bundledExtensions = ConfigNgService.BundledExtensions.parseJson(configJson.bundledExtensions, service.name);
            const diagnostics = ConfigNgService.Diagnostics.parseJson(configJson.diagnostics, service.name);
            const features = ConfigNgService.Features.parseJson(configJson.features);
            const branding = ConfigNgService.Branding.parseJson(sanitizer, configJson.branding, configFolderPath);
            const config: Config = {
                environment,
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
