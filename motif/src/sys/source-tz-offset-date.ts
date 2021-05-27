/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Iso8601 } from './iso8601';
import { Integer } from './types';
import { compareDate, isDateEqual, mSecsPerMin, newDate } from './utils';

export interface SourceTzOffsetDate {
    readonly utcMidnight: Date; // This must always be midnight
    readonly offset: Integer;
}

export namespace SourceTzOffsetDate {
    /** The Date.toLocale.. functions will set date to local timezone.  So the adjustment needs to take this into account */
    export function getUtcTimezonedDate(value: SourceTzOffsetDate) {
        const utcDate = value.utcMidnight;
        return new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * mSecsPerMin);
    }

    export function createCopy(value: SourceTzOffsetDate): SourceTzOffsetDate {
        return {
            utcMidnight: value.utcMidnight,
            offset: value.offset,
        };
    }

    export function createFromIso8601(value: string) {
        const parseResult = Iso8601.parseZenith(value);
        if (parseResult === undefined) {
            return undefined;
        } else {
            const result: SourceTzOffsetDate = {
                utcMidnight: parseResult.utcDate,
                offset: parseResult.offset,
            };
            return result;
        }

    }

    export function createFromLocalDate(value: Date): SourceTzOffsetDate {
        const midnightDate = newDate(value);
        midnightDate.setHours(0, 0, 0, 0);
        const offset = -(value.getTimezoneOffset() * mSecsPerMin);
        const utcMidnightDate = new Date(midnightDate.getTime() - offset);
        return {
            utcMidnight: utcMidnightDate, // Internally dates are always utc
            offset,
        };
    }

    export function newUndefinable(value: SourceTzOffsetDate | undefined) {
        if (value === undefined) {
            return undefined;
        } else {
            return createCopy(value);
        }
    }

    export function isEqual(left: SourceTzOffsetDate, right: SourceTzOffsetDate) {
        // assumes that utcDates are always midnight
        return isDateEqual(left.utcMidnight, right.utcMidnight) && left.offset === right.offset;
    }

    export function isUndefinableEqual(left: SourceTzOffsetDate | undefined, right: SourceTzOffsetDate | undefined) {
        if (left === undefined) {
            return right === undefined;
        } else {
            return right === undefined ? false : isEqual(left, right);
        }
    }

    export function compare(left: SourceTzOffsetDate, right: SourceTzOffsetDate) {
        // assumes that utcDates are always midnight
        return compareDate(left.utcMidnight, right.utcMidnight);
    }

    export function compareUndefinable(left: SourceTzOffsetDate | undefined,
            right: SourceTzOffsetDate | undefined,
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
}
