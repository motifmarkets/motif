/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer } from './types';
import { isDigit, mSecsPerHour, mSecsPerMin, parseIntStrict, parseNumberStrict } from './utils';

export namespace Iso8601 {
    const datePartLength = 10;
    const hoursMinutesSecondsPartLength = 8;
    const nonZeroOffsetPartLength = 5;
    const timeAnnouncerChar = 'T';
    const millisecondsAnnouncerChar = '.';
    const yearMonthDaySeparator = '-';
    const hoursMonthsSecondsSeparatorChar = ':';
    const utcOffsetChar = 'Z';
    const positiveOffsetChar = '+';
    const negativeOffsetChar = '-';

    interface ParseResult {
        utcDate: Date;
        offset: Integer;
    }

    /** Similar to Extended but with some limitations */
    export function parseZenith(value: string): ParseResult | undefined {
        const valueLength = value.length;
        let hours: number;
        let minutes: number;
        let seconds: number;
        let milliseconds: number;
        let offset: Integer;
        const { nextIdx: afterDateNextIdx, year, month, date } = parseDate(value);
        let nextIdx = afterDateNextIdx;
        if (nextIdx < 0) {
            return undefined;
        } else {
            if (nextIdx === valueLength) {
                hours = 0;
                minutes = 0;
                seconds = 0;
                milliseconds = 0;
                offset = 0;
            } else {
                if (value[nextIdx] !== timeAnnouncerChar) {
                    hours = 0;
                    minutes = 0;
                    seconds = 0;
                    milliseconds = 0;
                    offset = 0;
                } else {
                    const hoursMinutesSecondsParseResult = parseHoursMinutesSeconds(value, nextIdx + 1);
                    nextIdx = hoursMinutesSecondsParseResult.nextIdx;
                    if (nextIdx < 0) {
                        return undefined;
                    } else {
                        hours = hoursMinutesSecondsParseResult.hours;
                        minutes = hoursMinutesSecondsParseResult.minutes;
                        seconds = hoursMinutesSecondsParseResult.seconds;
                    }

                    if (nextIdx === valueLength) {
                        milliseconds = 0;
                    } else {
                        if (value[nextIdx] !== millisecondsAnnouncerChar) {
                            milliseconds = 0;
                        } else {
                            const millisecondsParseResult = parseMilliseconds(value, nextIdx + 1);
                            nextIdx = millisecondsParseResult.nextIdx;
                            if (nextIdx < 0) {
                                return undefined;
                            } else {
                                milliseconds = millisecondsParseResult.milliseconds;
                            }
                        }
                    }
                }

                if (nextIdx === valueLength) {
                    offset = 0;
                } else {
                    const offsetParseResult = parseOffset(value, nextIdx);
                    nextIdx = offsetParseResult.nextIdx;
                    if (nextIdx < 0) {
                        return undefined;
                    } else {
                        offset = offsetParseResult.offset;

                        if (nextIdx !== valueLength) {
                            value.trimRight();
                            if (nextIdx !== value.length) {
                                return undefined;
                            }
                        }
                    }
                }
            }
        }

        // got required values
        const dateMilliseconds = Date.UTC(year, month - 1, date, hours, minutes, seconds, milliseconds);

        return {
            utcDate: new Date(dateMilliseconds - offset), // Note that dateMilliseconds is actually in offset timezone
            offset,
        };
    }

    interface DateParseResult {
        nextIdx: Integer;
        year: Integer;
        month: Integer;
        date: Integer;
    }

    function parseDate(value: string): DateParseResult {
        const nextIdx = datePartLength;
        if (value.length < nextIdx || value[4] !== yearMonthDaySeparator || value[7] !== yearMonthDaySeparator) {
            return {
                nextIdx: -1,
                year: 0,
                month: 0,
                date: 0
            };
        } else {
            const yearStr = value.substr(0, 4);
            const year = parseIntStrict(yearStr);
            const monthStr = value.substr(5, 2);
            const month = parseIntStrict(monthStr);
            const dayStr = value.substr(8, 2);
            const day = parseIntStrict(dayStr);

            if (year === undefined || month === undefined || day === undefined) {
                return {
                    nextIdx: -1,
                    year: 0,
                    month: 0,
                    date: 0
                };
            } else {
                return {
                    nextIdx,
                    year,
                    month,
                    date: day
                };
            }
        }
    }

    interface HoursMinutesSecondsParseResult {
        nextIdx: Integer;
        hours: Integer;
        minutes: Integer;
        seconds: Integer;
    }

    function parseHoursMinutesSeconds(value: string, idx: Integer): HoursMinutesSecondsParseResult {
        const nextIdx = idx + hoursMinutesSecondsPartLength;
        if (value.length < nextIdx ||
                value[idx + 2] !== hoursMonthsSecondsSeparatorChar ||
                value[idx + 5] !== hoursMonthsSecondsSeparatorChar) {
            return {
                nextIdx: -1,
                hours: 0,
                minutes: 0,
                seconds: 0,
            };
        } else {
            const hoursStr = value.substr(idx, 2);
            const hours = parseIntStrict(hoursStr);
            const minutesStr = value.substr(idx + 3, 2);
            const minutes = parseIntStrict(minutesStr);
            const secondsStr = value.substr(idx + 6, 2);
            const seconds = parseIntStrict(secondsStr);

            if (hours === undefined || minutes === undefined || seconds === undefined) {
                return {
                    nextIdx: -1,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                };
            } else {
                return {
                    nextIdx,
                    hours,
                    minutes,
                    seconds,
                };
            }
        }
    }

    interface MillisecondsParseResult {
        nextIdx: Integer;
        milliseconds: number;
    }

    function parseMilliseconds(value: string, idx: Integer): MillisecondsParseResult {
        const valueLength = value.length;
        let nextIdx = valueLength;
        for (let i = idx; i < valueLength; i++) {
            const charCode = value.charCodeAt(i);
            if (!isDigit(charCode)) {
                nextIdx = i;
                break;
            }
        }

        const secondsStr = '0.' + value.substr(idx, nextIdx - idx);
        const seconds = parseNumberStrict(secondsStr);
        if (seconds === undefined) {
            return {
                nextIdx: -1,
                milliseconds: 0,
            };
        } else {
            return {
                nextIdx,
                milliseconds: seconds * 1000,
            };
        }
    }

    interface OffsetParseResult {
        nextIdx: Integer;
        offset: Integer;
    }

    function parseOffset(value: string, idx: Integer): OffsetParseResult {
        if (value.length <= idx) {
            return {
                nextIdx: -1,
                offset: 0,
            };
        } else {
            switch (value[idx]) {
                case utcOffsetChar:
                    return {
                        nextIdx: idx + 1,
                        offset: 0,
                    };
                case positiveOffsetChar:
                    return parseNonZeroOffset(value, idx + 1);
                case negativeOffsetChar:
                    const negativeOffsetResult = parseNonZeroOffset(value, idx + 1);
                    negativeOffsetResult.offset = negativeOffsetResult.offset * -1;
                    return negativeOffsetResult;
                default:
                    return {
                        nextIdx: -1,
                        offset: 0,
                    };
            }
        }
    }

    function parseNonZeroOffset(value: string, idx: Integer): OffsetParseResult {
        const nextIdx = idx + nonZeroOffsetPartLength;
        if (value.length < nextIdx || value[idx + 2] !== hoursMonthsSecondsSeparatorChar) {
            return {
                nextIdx: -1,
                offset: 0,
            };
        } else {
            const hoursStr = value.substr(idx, 2);
            const hours = parseIntStrict(hoursStr);
            const minutesStr = value.substr(idx + 3, 2);
            const minutes = parseIntStrict(minutesStr);

            if (hours === undefined || hours < 0 || hours >= 24 || minutes === undefined || minutes < 0 || minutes >= 60) {
                return {
                    nextIdx: -1,
                    offset: 0,
                };
            } else {
                const offset = hours * mSecsPerHour + minutes * mSecsPerMin;
                return {
                    nextIdx,
                    offset,
                };
            }
        }
    }
}
