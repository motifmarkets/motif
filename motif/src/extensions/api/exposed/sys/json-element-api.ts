/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from './decimal-api';
import { Result } from './result-api';
import { Guid, Integer, Json, JsonValue } from './types-api';

/** @public */
export interface JsonElement {
    readonly json: Json;
    clear(): void;

    shallowAssign(element: JsonElement | undefined): void;
    deepExtend(other: Json): void;

    stringify(): string;
    parse(jsonText: string, context?: string): boolean;

    tryGetElement(name: string): Result<JsonElement, string>;
    tryGetJsonValue(name: string): JsonValue | undefined;
    // eslint-disable-next-line @typescript-eslint/ban-types
    tryGetNativeObject(name: string): Result<object, string>;
    tryGetJsonObject(name: string): Result<Json, string>;

    tryGetString(name: string): Result<string, string>;
    getString(name: string, defaultValue: string): string;
    tryGetNumber(name: string): Result<number, string>;
    getNumber(name: string, defaultValue: number): number;
    tryGetBoolean(name: string): Result<boolean, string>;
    getBoolean(name: string, defaultValue: boolean): boolean;

    tryGetElementArray(name: string): Result<JsonElement[], Integer>;
    tryGetJsonObjectArray(name: string): Result<Json[], Integer>;
    tryGetStringArray(name: string): Result<string[], Integer>;
    tryGetNumberArray(name: string): Result<number[], Integer>;
    tryGetBooleanArray(name: string): Result<boolean[], Integer>;
    tryGetAnyJsonValueTypeArray(name: string): Result<JsonValue[], Integer>;

    tryGetInteger(name: string): Result<Integer, string>;
    getInteger(name: string, defaultValue: Integer): Integer;
    tryGetDate(name: string): Result<Date, string>;
    getDate(name: string, defaultValue: Date): Date;
    tryGetDateTime(name: string): Result<Date, string>;
    getDateTime(name: string, defaultValue: Date): Date;
    tryGetGuid(name: string): Result<Guid, string>;
    getGuid(name: string, defaultValue: Guid): Guid;
    tryGetDecimal(name: string): Result<Decimal, string>;
    getDecimal(name: string, defaultValue: Decimal): Decimal;

    newElement(name: string): JsonElement;
    setElement(name: string, value: JsonElement | undefined): void;

    setJson(name: string, value: Json | undefined): void;
    setJsonValue(name: string, value: JsonValue | undefined): void;
    setString(name: string, value: string | undefined): void;
    setNumber(name: string, value: number | undefined): void;
    setBoolean(name: string, value: boolean | undefined): void;

    setElementArray(name: string, value: JsonElement[] | undefined): void;
    setObjectArray(name: string, value: Json[] | undefined): void;
    setStringArray(name: string, value: string[] | undefined): void;
    setNumberArray(name: string, value: number[] | undefined): void;
    setBooleanArray(name: string, value: boolean[] | undefined): void;

    setInteger(name: string, value: Integer | undefined): void;
    setDate(name: string, value: Date | undefined): void;
    setDateTime(name: string, value: Date | undefined): void;
    setGuid(name: string, value: Guid | undefined): void;
    setDecimal(name: string, value: Decimal | undefined): void;

    forEach(callback: JsonElement.ForEachCallback): void;
    forEachElement(callback: JsonElement.ForEachElementCallback): void;
    forEachValue(callback: JsonElement.ForEachValueCallback): void;
    forEachString(callback: JsonElement.ForEachStringCallback): void;
    forEachNumber(callback: JsonElement.ForEachNumberCallback): void;
    forEachBoolean(callback: JsonElement.ForEachBooleanCallback): void;
}

/** @public */
export namespace JsonElement {
    export type ForEachCallback = (this: void, name: string, value: JsonValue, idx: Integer) => void;
    export type ForEachElementCallback = (this: void, name: string, value: JsonElement, idx: Integer) => void;
    export type ForEachValueCallback = (this: void, name: string, value: JsonValue, idx: Integer) => void;
    export type ForEachStringCallback = (this: void, name: string, value: string, idx: Integer) => void;
    export type ForEachNumberCallback = (this: void, name: string, value: number, idx: Integer) => void;
    export type ForEachBooleanCallback = (this: void, name: string, value: boolean, idx: Integer) => void;
}
