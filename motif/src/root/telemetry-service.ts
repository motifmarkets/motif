/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Version } from 'generated-internal-api';
import Rollbar from 'rollbar';
import { environment } from 'src/environments/environment';
import { EnvironmentSecrets } from 'src/environments/environment-secrets';
import { getObjectPropertyValue, Logger, UnreachableCaseError } from 'sys-internal-api';
import { Config } from './config';

export class TelemetryService {
    private _rollbar: Rollbar;
    private _enabled = false;
    private _enablable: boolean;
    private _configServiceName = 'Not configured yet';
    private _maxErrorCount = 1;
    private _errorCount = 0;

    constructor() {
        const rollbarConfig = TelemetryService.rollbarConfig;
        rollbarConfig.accessToken = environment.rollbarAccessToken;
        this._enablable = rollbarConfig.accessToken !== EnvironmentSecrets.invalidRollbarAccessToken;

        this._rollbar = new Rollbar(TelemetryService.rollbarConfig);

        this._rollbar.configure({
            enabled: this._enabled,
            code_version: Version.commit,
            payload: {
                environment: this._configServiceName,
            }
        });

        Logger.telemetryLogEvent = (levelId, text, extraData) => this.handleLoggerEvent(levelId, text, extraData);
    }

    applyConfig(config: Config) {
        this._enabled = this._enablable && config.diagnostics.telemetry.enabled;
        this._maxErrorCount = config.diagnostics.telemetry.maxErrorCount;
        this._configServiceName = config.service.name;
        this._rollbar.configure({
            enabled: this._enabled,
            payload: {
                environment: this._configServiceName,
                client: {
                    javascript: {
                        code_version: Version.commit,
                        source_map_enabled: true,
                        guess_uncaught_frames: true,
                    }
                }
            }
        });
    }

    setUser(id: string, username: string | undefined) {
        this._rollbar.configure({
            enabled: this._enabled,
            payload: {
                person: {
                    id,
                    username
                }
            }
        });
    }

    error(err: unknown) {
        if (this._enabled && this._errorCount < this._maxErrorCount) {
            this._errorCount++;
            if (typeof err === 'object' && err !== null) {
                const originalErr = getObjectPropertyValue(err, 'originalError');
                if (originalErr !== undefined) {
                    err = originalErr;
                }
            }
            this._rollbar.error(err as Rollbar.LogArgument);
        }
    }

    private handleLoggerEvent(levelId: Logger.LevelId, text: string, extraData: string | undefined) {
        switch (levelId) {
            case Logger.LevelId.Debug:
                if (extraData === undefined) {
                    this._rollbar.debug(text);
                } else {
                    this._rollbar.debug(text, extraData);
                }
                break;
            case Logger.LevelId.Info:
                if (extraData === undefined) {
                    this._rollbar.info(text);
                } else {
                    this._rollbar.info(text, extraData);
                }
                break;
            case Logger.LevelId.Warning:
                if (extraData === undefined) {
                    this._rollbar.warning(text);
                } else {
                    this._rollbar.warning(text, extraData);
                }
                break;
            case Logger.LevelId.Error:
                if (extraData === undefined) {
                    this._rollbar.error(text);
                } else {
                    this._rollbar.error(text, extraData);
                }
                break;
            case Logger.LevelId.Severe:
                if (extraData === undefined) {
                    this._rollbar.critical(text);
                } else {
                    this._rollbar.critical(text, extraData);
                }
                break;
            default:
                throw new UnreachableCaseError('THLED33938667', levelId);
        }
    }
}

export namespace TelemetryService {
    export const rollbarConfig: Rollbar.Configuration = {
        accessToken: '',
        captureUncaught: true,
        captureUnhandledRejections: true,
    };
}
