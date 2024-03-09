/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Err } from '@motifmarkets/motif-core';
import {
    Err as ErrApi,
    Ok as OkApi,
} from '../../../api/extension-api';

export class OkImplementation<T, E> implements OkApi<T, E> {
    constructor(readonly value: T) {
    }

    public isOk(): this is OkApi<T, E> {
        return true;
    }

    public isErr(): this is ErrApi<T, E> {
        return false;
    }
}

/** @public */
export class ErrImplementation<T = undefined, E = string> implements ErrApi<T, E> {
    constructor(readonly error: E) {}

    public isOk(): this is OkApi<T, E> {
        return false;
    }

    public isErr(): this is ErrApi<T, E> {
        return true;
    }

    createOuter<OuterT = undefined>(outerError: string): ErrApi<OuterT> {
        const err = new Err(this.error);
        const outerErr = err.createOuter<OuterT>(outerError);
        return new ErrImplementation<OuterT>(outerErr.error);
    }
}
