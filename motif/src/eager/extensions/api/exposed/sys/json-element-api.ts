/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from './decimal-api';
import { JsonElementResult } from './json-element-result-api';
import { Guid, Integer, Json, JsonValue } from './types-api';

/** @public */
export interface JsonElement {
    readonly json: Json;
    clear(): void;

    shallowAssign(element: JsonElement | undefined): void;
    deepExtend(other: Json): void;

    stringify(): string;
    parse(jsonText: string): JsonElementResult<void>;

    tryGetElement(name: string): JsonElementResult<JsonElement>;
    tryGetJsonValue(name: string): JsonValue | undefined;
    // eslint-disable-next-line @typescript-eslint/ban-types
    tryGetNativeObject(name: string): JsonElementResult<object>;
    tryGetJsonObject(name: string): JsonElementResult<Json>;

    tryGetString(name: string): JsonElementResult<string>;
    getString(name: string, defaultValue: string): string;
    tryGetNumber(name: string): JsonElementResult<number>;
    getNumber(name: string, defaultValue: number): number;
    tryGetBoolean(name: string): JsonElementResult<boolean>;
    getBoolean(name: string, defaultValue: boolean): boolean;

    tryGetElementArray(name: string): JsonElementResult<JsonElement[]>;
    tryGetJsonObjectArray(name: string): JsonElementResult<Json[]>;
    tryGetStringArray(name: string): JsonElementResult<string[]>;
    tryGetNumberArray(name: string): JsonElementResult<number[]>;
    tryGetBooleanArray(name: string): JsonElementResult<boolean[]>;
    tryGetAnyJsonValueTypeArray(name: string): JsonElementResult<JsonValue[]>;

    tryGetInteger(name: string): JsonElementResult<Integer>;
    getInteger(name: string, defaultValue: Integer): Integer;
    tryGetDate(name: string): JsonElementResult<Date>;
    getDate(name: string, defaultValue: Date): Date;
    tryGetDateTime(name: string): JsonElementResult<Date>;
    getDateTime(name: string, defaultValue: Date): Date;
    tryGetGuid(name: string): JsonElementResult<Guid>;
    getGuid(name: string, defaultValue: Guid): Guid;
    tryGetDecimal(name: string): JsonElementResult<Decimal>;
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
