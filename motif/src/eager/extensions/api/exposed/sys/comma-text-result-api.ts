/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Err, Ok } from './result-api';

/** @public */
export type CommaTextResult<T, E = string> = Ok<T, E> | CommaTextErr<T, E>;

/** @public */
export interface CommaTextErr<T = undefined, E = string> extends Err<T, E> {
    readonly code: CommaTextErr.Code;
}

export namespace CommaTextErr {
    export const enum CodeEnum {
        UnexpectedCharAfterQuotedElement = 'UnexpectedCharAfterQuotedElement',
        QuotesNotClosedInLastElement = 'QuotesNotClosedInLastElement',
        InvalidIntegerString = 'InvalidIntegerString',
    }

    export type Code = keyof typeof CodeEnum;
}
