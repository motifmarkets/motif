/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { assert, defined } from './utils';

// Dates on the GUI are strings. This unit provides functions to check date strings match expected formats.
export namespace DateText {
    // Valid date formats are:
    // - yyyy-mm-dd
    // - an empty string to specify "no date".
    export function isValidDateText(text: string): boolean {
        if (text === '') {
            return true;
        } else {
            const re = /[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}/;
            if (!re.test(text)) {
                return false;
            }
            const dateParts = text.split('-');
            const monthPart = parseInt(dateParts[1], 10);
            const dayPart = parseInt(dateParts[2], 10);
            return isValidMonthAndDayValue(monthPart, dayPart);
        }
    }

    function isValidMonthAndDayValue(month: number, day: number): boolean {
        return (month >= 1 && month <= 12 && day >= 1 && day <= 31);
    }

    export function toDate(text: string): Date | undefined {
        assert(isValidDateText(text), 'ID:2821111713');
        if (text !== '') {
            return new Date(text);
        } else {
            return undefined;
        }
    }

    export function toStr(date: Date | undefined): string {
        // TODO:MED Is it possible to use Date.toLocaleString() to convert the date to a string?
        //
        // #CodeLink:3729104804
        if (defined(date)) {
            return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        } else {
            return '';
        }
    }

    export function tryParseDate(value: string): Date | undefined {
        const ms = Date.parse(value);
        return defined(ms) && !isNaN(ms) ? new Date(ms) : undefined;
    }
}

