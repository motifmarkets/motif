/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings, UnreachableCaseError } from '@motifmarkets/motif-core';
import { Logger, checkLimitTextLength, logger } from '@xilytix/sysutils';
import { TelemetryService } from './telemetry-service';

export class LogService {
    constructor(private readonly _telemetryService: TelemetryService) {
        logger.setLogEventer((logEvent) => this.processLogEvent(logEvent));
    }

    private processLogEvent(logEvent: Logger.LogEvent) {
        // Note that currently LogEvent.errorTypeId is ignored
        switch (logEvent.levelId) {
            case Logger.LevelId.Debug:
                this.logDebug(logEvent);
                break;
            case Logger.LevelId.Info:
                this.logInfo(logEvent);
                break;
            case Logger.LevelId.Warning:
                this.logWarning(logEvent);
                break;
            case Logger.LevelId.Error:
                this.logError(logEvent);
                break;
            case Logger.LevelId.Severe:
                this.logSevere(logEvent);
                break;
            default:
                throw new UnreachableCaseError('LSPLE66812', logEvent.levelId);
        }
    }

    private logDebug(logEvent: Logger.LogEvent) {
        const text = this.prepareLogText(logEvent.text, logEvent.maxTextLength, undefined);
        // eslint-disable-next-line no-console
        console.debug(text);
        this.checkNotifyTelemetry(Logger.LevelId.Debug, text, logEvent.telemetryAndExtra);
    }

    private logInfo(logEvent: Logger.LogEvent) {
        const text = this.prepareLogText(logEvent.text, undefined, logEvent.telemetryAndExtra);
        // console.info(text);
        this.checkNotifyTelemetry(Logger.LevelId.Info, text, logEvent.telemetryAndExtra);
    }

    private logWarning(logEvent: Logger.LogEvent) {
        const text = this.prepareLogText(logEvent.text, undefined, logEvent.telemetryAndExtra);
        console.warn(text);
        this.checkNotifyTelemetry(Logger.LevelId.Warning, text, logEvent.telemetryAndExtra);
    }

    private logError(logEvent: Logger.LogEvent) {
        const text = this.prepareLogText(logEvent.text, logEvent.maxTextLength, logEvent.telemetryAndExtra);
        console.error(text);
        this.checkNotifyTelemetry(Logger.LevelId.Error, text, logEvent.telemetryAndExtra);
    }

    private logSevere(logEvent: Logger.LogEvent) {
        const text = this.prepareLogText(logEvent.text, logEvent.maxTextLength, logEvent.telemetryAndExtra);
        console.error(text);
        this.checkNotifyTelemetry(Logger.LevelId.Severe, text, logEvent.telemetryAndExtra);
    }

    private prepareLogText(text: string, maxTextLength: number | undefined, extra: string | undefined) {
        if (extra !== undefined && extra.length > 0) {
            text += ': ' + extra;
        }

        if (maxTextLength === undefined) {
            maxTextLength = 1000;
        }

        return checkLimitTextLength(text, maxTextLength);
    }

    private checkNotifyTelemetry(levelId: Logger.LevelId, text: string, telemetryAndExtra: string | undefined) {
        if (telemetryAndExtra !== undefined) {
            if (telemetryAndExtra === '') {
                this._telemetryService.sendLogEvent(levelId, text, undefined);
            } else {
                this._telemetryService.sendLogEvent(levelId, text, telemetryAndExtra);
            }
        }
    }

}
export namespace LogService {
    export namespace Level {
        export type Id = Logger.LevelId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly displayId: StringId;
        }

        type InfosObject = { [id in keyof typeof Logger.LevelId]: Info };

        const infosObject: InfosObject = {
            Debug: {
                id: Logger.LevelId.Debug,
                name: 'Debug',
                displayId: StringId.LogLevel_Debug,
            },
            Info: {
                id: Logger.LevelId.Info,
                name: 'Info',
                displayId: StringId.LogLevel_Info,
            },
            Warning: {
                id: Logger.LevelId.Warning,
                name: 'Warning',
                displayId: StringId.LogLevel_Warning,
            },
            Error: {
                id: Logger.LevelId.Error,
                name: 'Error',
                displayId: StringId.LogLevel_Error,
            },
            Severe: {
                id: Logger.LevelId.Severe,
                name: 'Severe',
                displayId: StringId.LogLevel_Severe,
            },
        };

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: number) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new Error(`Log.Level out of order Error ${outOfOrderIdx}: ${infos[outOfOrderIdx].name}`);
            }
        }

        export function idToName(id: Id): string {
            return infos[id].name;
        }

        export function idToDisplayId(id: Id): StringId {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id): string {
            return Strings[idToDisplayId(id)];
        }
    }
}

export namespace LogServiceModule {
    export function initialiseStatic() {
        LogService.Level.initialise();
    }
}
