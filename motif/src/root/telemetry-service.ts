/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import Rollbar from 'rollbar';
import { Version } from 'src/generated/internal-api';
import { ProductionSecrets } from 'src/res/production-secrets';
import { getObjectPropertyValue, Logger, UnreachableCaseError } from 'src/sys/internal-api';
import { Config } from './config';

export class TelemetryService {
    private _rollbar: Rollbar;
    private _enabled = false;
    private _enablable: boolean;
    private _configServiceName = 'Not configured yet';

    constructor() {
        const rollbarConfig = TelemetryService.rollbarConfig;
        rollbarConfig.accessToken = ProductionSecrets.rollbarAccessToken;
        this._enablable = rollbarConfig.accessToken !== ProductionSecrets.invalidRollbarAccessToken;

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
        this._enabled = this._enablable && config.diagnostics.telemetryEnabled;
        this._configServiceName = config.service.name;
        this._rollbar.configure({
            enabled: this._enabled,
            code_version: Version.commit,
            payload: {
                environment: this._configServiceName,
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
        if (this._enabled) {
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
