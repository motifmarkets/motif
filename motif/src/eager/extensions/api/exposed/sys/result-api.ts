/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

/** @public */
export type Result<T, E = string> = Ok<T, E> | Err<T, E>;

/** @public */
export interface Ok<T, E> {
    readonly value: T;

    isOk(): this is Ok<T, E>;
    isErr(): this is Err<T, E>;
}

/** @public */
export interface Err<T = undefined, E = string> {
    readonly error: E;

    isOk(): this is Ok<T, E>;
    isErr(): this is Err<T, E>;
    createOuter<OuterT = undefined>(outerError: string): Err<OuterT>;
}
