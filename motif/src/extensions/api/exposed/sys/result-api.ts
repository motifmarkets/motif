/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

/** @public */
export type Result<T, E = string> = Ok<T, E> | Err<T, E>;

/** @public */
export class Ok<T, E> {
    constructor(public readonly value: T) {}

    public isOk(): this is Ok<T, E> {
        return true;
    }

    public isErr(): this is Err<T, E> {
        return false;
    }
}

/** @public */
export class Err<T, E = string> {
    constructor(public readonly error: E) {}

    public isOk(): this is Ok<T, E> {
        return false;
    }

    public isErr(): this is Err<T, E> {
        return true;
    }

    createOuter<OuterT>(outerError: string) {
        return new Err<OuterT>(outerError + ': ' + this.error);
    }
}
