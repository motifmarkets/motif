/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import Decimal from 'decimal.js-light';

export type Integer = number;

export type Guid = string;
export type BooleanOrUndefined = boolean | undefined;

export type DateOrDateTime = Date;
export type TimeSpan = number;

export type PriceOrRemainder = Decimal | null;

// eslint-disable-next-line @typescript-eslint/ban-types
export type JsonValue = string | number | boolean | null | Json | object | JsonValueArray;
// export type JsonValue = string | number | boolean | null | Json | JsonValueArray;
export interface Json {
    [name: string]: JsonValue;
}
export type JsonValueArray = Array<JsonValue>;
export namespace JsonValue {
    export function isJson(value: JsonValue): value is Json {
        return isJsonObject(value);
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    export function isJsonObject(value: JsonValue): value is Json | object {
        return !Array.isArray(value) && value !== null && typeof value === 'object';
    }
}

// MapKey is key type used for maps (content of objects cannot be used as keys in maps)
export type MapKey = string;
export interface Mappable {
    readonly mapKey: MapKey;
}

export type Handle = Integer;
export const invalidHandle = 0;
export type ExtensionHandle = Handle;

export const enum DayOfWeek {
    Sunday = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6,
}

export const enum ComparisonResult {
    LeftLessThanRight = -1,
    LeftEqualsRight = 0,
    LeftGreaterThanRight = 1,
}

export const enum ListChangeTypeId {
    Insert,
    Remove,
    Clear,
}

export const enum UsableListChangeTypeId {
    Unusable,
    PreUsableAdd,
    PreUsableClear,
    Usable,
    Insert,
    Remove,
    Clear,
}

export type SuccessOrErrorText = undefined | string;

export const SuccessOrErrorText_Success: SuccessOrErrorText = undefined;
export type ErrorSuccessOrErrorText = string;

export interface Rect {
    left: number;
    top: number;
    width: number;
    height: number;
}

export interface Line {
    beginX: number;
    beginY: number;
    endX: number;
    endY: number;
}

export interface RGB {
    r: number;
    g: number;
    b: number;
}

export type IndexSignatureHack<T> = { [K in keyof T]: IndexSignatureHack<T[K]> };
