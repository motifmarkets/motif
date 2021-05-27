/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from './decimal-api';
import { Guid, Integer, Json, JsonValue, JsonValueArray } from './types-api';

/** @public */
export interface JsonElement {
    readonly json: Json;
    clear(): void;

    shallowAssign(element: JsonElement | undefined): void;
    deepExtend(other: Json): void;

    stringify(): string;
    parse(jsonText: string, context?: string): boolean;

    tryGetElement(name: string, context?: string): JsonElement | undefined;
    tryGetJsonValue(name: string): JsonValue | undefined;
    // eslint-disable-next-line @typescript-eslint/ban-types
    tryGetNativeObject(name: string, context?: string): object | undefined;
    tryGetJsonObject(name: string, context?: string): Json | undefined;

    tryGetString(name: string, context?: string): string | undefined;
    getString(name: string, defaultValue: string, context?: string): string;
    tryGetNumber(name: string, context?: string): number | undefined;
    getNumber(name: string, defaultValue: number, context?: string): number;
    tryGetBoolean(name: string, context?: string): boolean | undefined;
    getBoolean(name: string, defaultValue: boolean, context?: string): boolean;

    tryGetElementArray(name: string, context?: string): JsonElement[] | undefined;
    tryGetJsonObjectArray(name: string, context?: string): Json[] | undefined;
    tryGetStringArray(name: string, context?: string): string[] | undefined;
    tryGetNumberArray(name: string, context?: string): number[] | undefined;
    tryGetBooleanArray(name: string, context?: string): boolean[] | undefined;
    tryGetAnyJsonValueTypeArray(name: string, context?: string): JsonValueArray | undefined;

    tryGetInteger(name: string, context?: string): Integer | undefined;
    getInteger(name: string, defaultValue: Integer, context?: string): Integer;
    tryGetDate(name: string, context?: string): Date | undefined;
    getDate(name: string, defaultValue: Date, context?: string): Date;
    tryGetDateTime(name: string, context?: string): Date | undefined;
    getDateTime(name: string, defaultValue: Date, context?: string): Date;
    tryGetGuid(name: string, context?: string): Guid | undefined;
    getGuid(name: string, defaultValue: Guid, context?: string): Guid;
    tryGetDecimal(name: string, context?: string): Decimal | undefined;
    getDecimal(name: string, defaultValue: Decimal, context?: string): Decimal;

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
