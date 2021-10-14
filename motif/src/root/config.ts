/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExchangeEnvironmentId, ExchangeId, LitIvemId, ZenithPublisherSubscriptionManager } from 'src/adi/internal-api';
import { ExtensionsService } from 'src/extensions/internal-api';

export interface Config {
    readonly service: Config.Service;
    readonly exchange: Config.Exchange;
    readonly endpoints: Config.Endpoints;
    readonly openId: Config.OpenId;
    readonly defaultLayout: Config.DefaultLayout;
    readonly bundledExtensions: Config.BundledExtensions;
    readonly diagnostics: Config.Diagnostics;
    readonly features: Config.Features;
    readonly branding: Config.Branding;
}

export namespace Config {
    export interface Service {
        readonly name: string;
        readonly description: string | undefined;
    }

    export interface Exchange {
        readonly environmentId: ExchangeEnvironmentId;
        readonly bannerOverrideEnvironmentId: ExchangeEnvironmentId | undefined;
        readonly defaultDefaultExchangeId: ExchangeId;
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
        readonly linkedSymbol: LitIvemId | undefined;
        readonly watchlist: LitIvemId[] | undefined;
    }

    export type BundledExtensions = readonly ExtensionsService.BundledExtension[];

    export interface Diagnostics {
        readonly appNotifyErrors: boolean;
        readonly telemetryEnabled: boolean;
        readonly zenithLogLevelId: ZenithPublisherSubscriptionManager.LogLevelId;
        readonly dataSubscriptionCachingDisabled: boolean;
        readonly motifServicesBypass: Diagnostics.MotifServicesBypass;
    }

    export namespace Diagnostics {
        export const defaultAppNotifyErrors = true;
        export const defaultTelemetryEnabled = true;
        export const defaultDataSubscriptionCachingDisabled = false;

        export namespace ZenithLog {
            export const defaultLevelId = ZenithPublisherSubscriptionManager.LogLevelId.Off;
        }

        export interface MotifServicesBypass {
            readonly useZenithAuthOwnerAuthentication: boolean;
            readonly useLocalStateStorage: boolean;
        }

        export namespace MotifServicesBypass {
            export const defaultUseZenithAuthOwnerAuthentication = false;
            export const defaultUseLocalStateStorage = false;
        }
    }

    export interface Features {
        readonly preview: boolean;
    }

    export namespace Features {
        export const defaultPreview = false;
    }

    export interface Branding {
        readonly startupTopSplashImageUrl: string | undefined;
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
