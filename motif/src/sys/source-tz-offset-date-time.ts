/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from 'src/res/internal-api';
import { EnumInfoOutOfOrderError, UnreachableCaseError } from './internal-error';
import { Iso8601 } from './iso8601';
import { Integer } from './types';
import { compareDate, isDateEqual, mSecsPerMin, nullDate } from './utils';

export interface SourceTzOffsetDateTime {
    readonly utcDate: Date;
    readonly offset: Integer;
}

export namespace SourceTzOffsetDateTime {
    export const nullDateTime: SourceTzOffsetDateTime = {
        utcDate: nullDate,
        offset: 0,
    };

    export const enum TimezoneModeId {
        Utc,
        Local,
        Source,
    }

    /** The Date.toLocale.. functions will set date to local timezone.  So the adjustments need to take this into account */
    export function getTimezonedDate(value: SourceTzOffsetDateTime, adjustment: TimezoneModeId) {
        const utcDate = value.utcDate;
        switch (adjustment) {
            case TimezoneModeId.Utc:
                return new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * mSecsPerMin);
            case TimezoneModeId.Local:
                return utcDate;
            case TimezoneModeId.Source:
                return new Date(value.utcDate.getTime() + utcDate.getTimezoneOffset() * mSecsPerMin + value.offset);
            default:
                throw new UnreachableCaseError('STODTTALRD45992844', adjustment);
        }
    }

    export function createCopy(value: SourceTzOffsetDateTime): SourceTzOffsetDateTime {
        return {
            utcDate: value.utcDate,
            offset: value.offset,
        };
    }

    export function createFromIso8601(value: string): SourceTzOffsetDateTime | undefined {
        return Iso8601.parseZenith(value);
    }

    export function newUndefinable(value: SourceTzOffsetDateTime | undefined) {
        if (value === undefined) {
            return undefined;
        } else {
            return createCopy(value);
        }
    }

    export function isEqual(left: SourceTzOffsetDateTime, right: SourceTzOffsetDateTime) {
        return isDateEqual(left.utcDate, right.utcDate) && left.offset === right.offset;
    }

    export function isUndefinableEqual(left: SourceTzOffsetDateTime | undefined, right: SourceTzOffsetDateTime | undefined) {
        if (left === undefined) {
            return right === undefined;
        } else {
            return right === undefined ? false : isEqual(left, right);
        }
    }

    export function compare(left: SourceTzOffsetDateTime, right: SourceTzOffsetDateTime) {
        return compareDate(left.utcDate, right.utcDate);
    }

    export function compareUndefinable(left: SourceTzOffsetDateTime | undefined,
            right: SourceTzOffsetDateTime | undefined,
            undefinedIsLowest: boolean) {
        if (left === undefined) {
            if (right === undefined) {
                return 0;
            } else {
                return undefinedIsLowest ? -1 : 1;
            }
        } else {
            if (right === undefined) {
                return undefinedIsLowest ? 1 : -1;
            } else {
                return compare(left, right);
            }
        }
    }

    export namespace TimezoneMode {
        export type Id = TimezoneModeId;

        interface Info {
            readonly id: Id;
            readonly jsonValue: string;
            readonly displayId: StringId;
            readonly descriptionId: StringId;
        }

        type InfosObject = { [id in keyof typeof TimezoneModeId]: Info };

        const infosObject: InfosObject = {
            Utc: {
                id: TimezoneModeId.Utc,
                jsonValue: 'Utc',
                displayId: StringId.SourceTzOffsetDateTimeTimezoneModeDisplay_Utc,
                descriptionId: StringId.SourceTzOffsetDateTimeTimezoneModeDescription_Utc,
            },
            Local: {
                id: TimezoneModeId.Local,
                jsonValue: 'Local',
                displayId: StringId.SourceTzOffsetDateTimeTimezoneModeDisplay_Local,
                descriptionId: StringId.SourceTzOffsetDateTimeTimezoneModeDescription_Local,
            },
            Source: {
                id: TimezoneModeId.Source,
                jsonValue: 'Source',
                displayId: StringId.SourceTzOffsetDateTimeTimezoneModeDisplay_Source,
                descriptionId: StringId.SourceTzOffsetDateTimeTimezoneModeDescription_Source,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);
        export const allIds = new Array<TimezoneModeId>(idCount);

        export function initialise() {
            for (let id = 0; id < idCount; id++) {
                if (id !== infos[id].id) {
                    throw new EnumInfoOutOfOrderError('SourceTzOffsetDateTime.TimezoneModeId', id, idToJsonValue(id));
                } else {
                    allIds[id] = id;
                }
            }
        }

        export function idToJsonValue(id: Id) {
            return infos[id].jsonValue;
        }

        export function tryJsonValueToId(value: string) {
            for (let id = 0; id < idCount; id++) {
                if (infos[id].jsonValue === value) {
                    return id;
                }
            }
            return undefined;
        }

        export function idToDisplayId(id: Id) {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id) {
            return Strings[idToDisplayId(id)];
        }

        export function idToDescriptionId(id: Id) {
            return infos[id].descriptionId;
        }

        export function idToDescription(id: Id) {
            return Strings[idToDescriptionId(id)];
        }
    }
}

export namespace SourceTzOffsetTimeRenderValueModule {
    export function initaliseStatic() {
        SourceTzOffsetDateTime.TimezoneMode.initialise();
    }
}
