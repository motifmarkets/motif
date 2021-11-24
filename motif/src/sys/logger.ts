/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { I18nStrings, StringId, Strings } from 'res-internal-api';

export class Logger {
    static telemetryLogEvent: Logger.LogEvent;

    static notifyTelemetry(levelId: Logger.LevelId, text: string, extraData: string | undefined) {
        if (this.telemetryLogEvent !== undefined) {
            this.telemetryLogEvent(levelId, text, extraData);
        }
    }

    static log(levelId: Logger.LevelId, text: string) {
        switch (levelId) {
            case Logger.LevelId.Debug:
                Logger.logDebug(text);
                break;
            case Logger.LevelId.Info:
                Logger.logInfo(text);
                break;
            case Logger.LevelId.Warning:
                Logger.logWarning(text);
                break;
            case Logger.LevelId.Error:
                Logger.logError(text);
                break;
            case Logger.LevelId.Severe:
                Logger.logSevere(text);
                break;
            default:
                throw new Logger.UnreachableCaseError('LLD8762298', levelId);
        }
    }

    static logDebug(text: string, maxTextLength?: number, telemetryAndExtra?: string) {
        text = Logger.prepareLogText(text, maxTextLength, undefined);

        // eslint-disable-next-line no-console
        console.debug(text);
        Logger.checkNotifyTelemetry(Logger.LevelId.Debug, text, telemetryAndExtra);
    }

    static logInfo(text: string, telemetryAndExtra?: string) {
        text = Logger.prepareLogText(text, undefined, telemetryAndExtra);
        // console.info(text);
        Logger.checkNotifyTelemetry(Logger.LevelId.Info, text, telemetryAndExtra);
    }

    static logWarning(text: string, telemetryExtra = '') {
        text = Logger.prepareLogText(text, undefined, telemetryExtra);
        console.warn(text);
        Logger.checkNotifyTelemetry(Logger.LevelId.Warning, text, telemetryExtra);
    }

    static logError(text: string, maxTextLength?: number, telemetryExtra = '') {
        text = Logger.prepareLogText(text, maxTextLength, telemetryExtra);
        console.error(text);
        Logger.checkNotifyTelemetry(Logger.LevelId.Error, text, telemetryExtra);
    }

    static logInternalError(code: string, text: string, maxTextLength?: number, telemetryExtra = '') {
        text = Logger.prepareLogText(text, maxTextLength, telemetryExtra);
        const message = I18nStrings.getStringPlusEnglish(StringId.InternalError) + `: ${code}: ${text}`;
        console.error(message);
        Logger.checkNotifyTelemetry(Logger.LevelId.Error, text, telemetryExtra);
    }

    static logPersistError(code: string, text?: string, maxTextLength?: number, telemetryExtra = '') {
        if (text === undefined) {
            text = '';
        } else {
            if (maxTextLength === undefined) {
                maxTextLength = 1000;
            }
            text = Logger.prepareLogText(text, maxTextLength, telemetryExtra);
        }
        const message = I18nStrings.getStringPlusEnglish(StringId.PersistError) + `: ${code}: ${text}`;
        console.error(message);
        Logger.checkNotifyTelemetry(Logger.LevelId.Error, text, telemetryExtra);
        return undefined;
    }

    static logExternalError(code: string, text: string, maxTextLength?: number, telemetryExtra = '') {
        this.logInternalError(code, text, maxTextLength, telemetryExtra);
    }

    static logDataError(code: string, text: string, maxTextLength?: number, telemetryExtra = '') {
        this.logInternalError(code, text, maxTextLength, telemetryExtra);
    }

    static logConfigError(code: string, text: string, maxTextLength?: number, telemetryExtra = '') {
        this.logInternalError(code, text, maxTextLength, telemetryExtra);
    }

    static logLayoutError(code: string, text: string, maxTextLength?: number, telemetryExtra = '') {
        this.logInternalError(code, text, maxTextLength, telemetryExtra);
    }

    static logSevere(text: string, maxTextLength?: number, telemetryExtra = '') {
        text = Logger.prepareLogText(text, maxTextLength, telemetryExtra);
        console.error(text);
        Logger.checkNotifyTelemetry(Logger.LevelId.Severe, text, telemetryExtra);
    }

    static assert(condition: boolean, text: string) {
        if (condition) {
            this.logError(text);
        }
    }

    static assertError(text: string) {
        this.logError(text);
    }

    private static prepareLogText(text: string, maxTextLength: number | undefined, extra: string | undefined) {
        if (extra !== undefined && extra.length > 0) {
            text += ': ' + extra;
        }

        if (maxTextLength === undefined) {
            return text;
        } else {
            return Logger.checkLimitTextLength(text, maxTextLength);
        }
    }

    private static checkNotifyTelemetry(levelId: Logger.LevelId, text: string, telemetryAndExtra: string | undefined) {
        if (telemetryAndExtra !== undefined) {
            if (telemetryAndExtra === '') {
                Logger.notifyTelemetry(levelId, text, undefined);
            } else {
                Logger.notifyTelemetry(levelId, text, telemetryAndExtra);
            }
        }
    }

    private static checkLimitTextLength(text: string, maxTextLength: number | undefined) {
        if (maxTextLength !== undefined) {
            if (text.length > maxTextLength) {
                text = text.substr(0, maxTextLength) + ' ...';
            }
        }
        return text;
    }
}

export namespace Logger {
    export type LogEvent = (this: void, levelId: LevelId, text: string, extraData: string | undefined) => void;

    export const enum LevelId {
        Debug,
        Info,
        Warning,
        Error,
        Severe,
    }

    export namespace Level {
        export type Id = LevelId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly displayId: StringId;
        }

        type InfosObject = { [id in keyof typeof LevelId]: Info };

        const infosObject: InfosObject = {
            Debug: {
                id: LevelId.Debug,
                name: 'Debug',
                displayId: StringId.LogLevel_Debug,
            },
            Info: {
                id: LevelId.Info,
                name: 'Info',
                displayId: StringId.LogLevel_Info,
            },
            Warning: {
                id: LevelId.Warning,
                name: 'Warning',
                displayId: StringId.LogLevel_Warning,
            },
            Error: {
                id: LevelId.Error,
                name: 'Error',
                displayId: StringId.LogLevel_Error,
            },
            Severe: {
                id: LevelId.Severe,
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

    // do not use InternalErrors as causes circular loop
    export class UnreachableCaseError extends Error {
        constructor(code: string, value: never) {
            super(`Logger Unreachable error. Code: ${code} Value: ${value}`);
        }
    }
}

export namespace LoggerModule {
    export function initialiseStatic() {
        Logger.Level.initialise();
    }
}
