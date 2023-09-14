/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { SafeResourceUrl } from '@angular/platform-browser';
import { DataEnvironmentId, ExchangeId, LitIvemId, ServiceOperatorId, ZenithPublisherSubscriptionManager } from '@motifmarkets/motif-core';
import { ExtensionsService } from 'src/extensions/internal-api';

export interface Config {
    readonly environment: Config.Environment;
    readonly service: Config.Service;
    readonly exchange: Config.Exchange;
    readonly endpoints: Config.Endpoints;
    readonly openId: Config.OpenId;
    readonly defaultLayout: Config.DefaultLayout;
    readonly bundledExtensions: Config.BundledExtensions;
    readonly diagnostics: Config.Diagnostics;
    readonly capabilities: Config.Capabilities;
    readonly branding: Config.Branding;
}

export namespace Config {
    export interface Environment {
        readonly defaultDataEnvironmentId: DataEnvironmentId;
        readonly bannerOverrideDataEnvironmentId: DataEnvironmentId | undefined;
    }

    export interface Service {
        readonly name: string;
        readonly description: string | undefined;
        readonly operatorId: ServiceOperatorId;
    }

    export interface Exchange {
        readonly defaultDefaultExchangeId: ExchangeId;
        readonly options: Exchange.Option[] | undefined;
    }

    export namespace Exchange {
        export interface Option {
            exchangeId: ExchangeId;
            overriddenDefaultDataEnvironmentId?: DataEnvironmentId;
        }
    }

    export interface Endpoints {
        readonly motifServices: readonly string[];
        readonly zenith: readonly string[];
    }

    export interface OpenId {
        readonly authority: string;
        readonly clientId: string;
        readonly redirectUri: string;
        readonly silentRedirectUri: string;
        readonly scope: string;
    }

    export interface DefaultLayout {
        readonly internalName: string | undefined;
        readonly instanceName: string | undefined;
        readonly linkedSymbolJson: LitIvemId.Json | undefined;
        readonly watchlistJson: LitIvemId.Json[] | undefined;
    }

    export type BundledExtensions = readonly ExtensionsService.BundledExtension[];

    export interface Diagnostics {
        readonly appNotifyErrors: boolean;
        readonly telemetry: Diagnostics.Telemetry;
        readonly zenithLogLevelId: ZenithPublisherSubscriptionManager.LogLevelId;
        readonly dataSubscriptionCachingDisabled: boolean;
        readonly motifServicesBypass: Diagnostics.MotifServicesBypass;
    }

    export namespace Diagnostics {
        export const defaultAppNotifyErrors = true;
        export const defaultDataSubscriptionCachingDisabled = false;

        export interface Telemetry {
            enabled: boolean;
            itemsPerMinute: number;
            maxErrorCount: number;
            itemIgnores: Telemetry.ItemIgnore[];
        }

        export namespace Telemetry {
            export const defaultEnabled = true;
            export const defaultItemsPerMinute = 3;
            export const defaultMaxErrorCount = 1;
            export const defaultItemIgnores = [];

            export interface ItemIgnore {
                typeId: ItemIgnore.TypeId;
                message?: string;
            }

            export namespace ItemIgnore {
                export const enum TypeId {
                    Message = 'Message',
                    Exception = 'Exception',
                }

                export namespace Type {
                    export function isValidId(id: TypeId) {
                        return [TypeId.Message, TypeId.Exception].includes(id);
                    }
                }

                export function isMessage(itemIgnore: ItemIgnore): itemIgnore is MessageItemIgnore {
                    return itemIgnore.typeId === ItemIgnore.TypeId.Message;
                }

                export function isException(itemIgnore: ItemIgnore): itemIgnore is ExceptionItemIgnore {
                    return itemIgnore.typeId === ItemIgnore.TypeId.Exception;
                }
            }

            export interface MessageItemIgnore extends ItemIgnore {
                typeId: ItemIgnore.TypeId.Message;
            }

            export interface ExceptionItemIgnore extends ItemIgnore {
                typeId: ItemIgnore.TypeId.Exception;
                exceptionName?: string;
            }
        }

        export namespace ZenithLog {
            export const defaultLevelId = ZenithPublisherSubscriptionManager.LogLevelId.Off;
        }

        export interface MotifServicesBypass {
            readonly useLocalStateStorage: boolean;
        }

        export namespace MotifServicesBypass {
            export const defaultUseLocalStateStorage = false;
        }
    }

    export interface Capabilities {
        readonly advertising: boolean;
        readonly dtr: boolean;
    }

    export namespace Capabilities {
        export const defaultAdvertising = false;
        export const defaultDtr = false;
    }

    export interface Branding {
        readonly startupSplashWebPageSafeResourceUrl: SafeResourceUrl | undefined;
        readonly desktopBarLeftImageUrl: string | undefined;
    }

    export function checkForValidationError(config: Config) {
        return undefined;
        // switch (config.exchange.environmentId) {
        //     case ExchangeEnvironmentId.Production:
        //         if (!hasDemoZenithEndpoint(config)) {
        //             return undefined;
        //         } else {
        //             return 'Production Config has demo Zenith endpoint(s)';
        //         }
        //     case ExchangeEnvironmentId.DelayedProduction:
        //         if (!hasDemoZenithEndpoint(config)) {
        //             return undefined;
        //         } else {
        //             return 'Delayed Production Config has Zenith demo endpoint(s)';
        //         }
        //     case ExchangeEnvironmentId.Demo:
        //         if (hasOnlyDemoZenithEndpoints(config)) {
        //             return undefined;
        //         } else {
        //             return 'Demo Config does has one or more Zenith endpoints which are not demo';
        //         }
        //     default:
        //         throw new UnreachableCaseError('CCFVE999331127', config.exchange.environmentId);
        // }
    }

    function hasDemoZenithEndpoint(config: Config) {
        const endpoints = config.endpoints;
        const zenithEndpoints = endpoints.zenith;
        for (const endpoint of zenithEndpoints) {
            const demo = isDemoEndpoint(endpoint);
            if (demo) {
                return true;
            }
        }

        return false;
    }

    function hasOnlyDemoZenithEndpoints(config: Config) {
        const endpoints = config.endpoints;
        const zenithEndpoints = endpoints.zenith;
        for (const endpoint of zenithEndpoints) {
            const demo = isDemoEndpoint(endpoint);
            if (!demo) {
                return false;
            }
        }

        return true;
    }

    function isDemoEndpoint(endpoint: string) {
        const demoUpperSubStrings: string[] = [
            'STAGING',
            'DEMO',
            'CTE',
            'TEST',
        ];
        const upperEndpoint = endpoint.toUpperCase();

        for (const demoUpperSubString of demoUpperSubStrings) {
            if (upperEndpoint.includes(demoUpperSubString)) {
                return true;
            }
        }

        return false;
    }
}
