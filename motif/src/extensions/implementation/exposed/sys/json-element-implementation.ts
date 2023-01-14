/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Err, JsonElement } from '@motifmarkets/motif-core';
import {
    Decimal as DecimalApi,
    Guid as GuidApi,
    Integer as IntegerApi,
    Json as JsonApi,
    JsonElement as JsonElementApi,
    JsonValue as JsonValueApi,
    JsonValueArray as JsonValueArrayApi,
    Ok as OkApi,
    Result as ResultApi
} from '../../../api/extension-api';

export class JsonElementImplementation implements JsonElementApi {
    constructor(private readonly _actual: JsonElement) { }

    get actual() { return this._actual; }
    get json() { return this.actual.json; }

    clear(): void {
        this.actual.clear();
    }

    shallowAssign(elementApi: JsonElementApi | undefined): void {
        if (elementApi !== undefined) {
            const element = JsonElementImplementation.fromApi(elementApi);
            this._actual.shallowAssign(element);
        }
    }

    deepExtend(otherApi: JsonApi): void {
        this._actual.deepExtend(otherApi);
    }

    stringify(): string {
        return this._actual.stringify();
    }

    parse(jsonText: string): ResultApi<void, string> {
        return this._actual.parse(jsonText);
    }

    tryGetElement(name: string): ResultApi<JsonElementApi, string> {
        const result = this._actual.tryGetElementType(name);
        if (result.isErr()) {
            return new Err(result.error);
        } else {
            const jsonElement = new JsonElementImplementation(result.value);
            return new OkApi(jsonElement);
        }
    }

    tryGetJsonValue(name: string): JsonValueApi | undefined {
        return this._actual.tryGetJsonValue(name);
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    tryGetNativeObject(name: string): ResultApi<object, string> {
        const result = this._actual.tryGetNativeObjectType(name);
        if (result.isErr()) {
            return new Err(result.error);
        } else {
            return new OkApi(result.value);
        }
    }

    tryGetJsonObject(name: string): ResultApi<JsonApi, string> {
        const result = this._actual.tryGetJsonObjectType(name);
        if (result.isErr()) {
            return new Err(result.error);
        } else {
            return new OkApi(result.value);
        }
    }

    tryGetString(name: string): ResultApi<string, string> {
        const result = this._actual.tryGetStringType(name);
        if (result.isErr()) {
            return new Err(result.error);
        } else {
            return new OkApi(result.value);
        }
    }

    getString(name: string, defaultValue: string): string {
        return this._actual.getString(name, defaultValue);
    }

    tryGetNumber(name: string): ResultApi<number, string> {
        const result = this._actual.tryGetNumberType(name);
        if (result.isErr()) {
            return new Err(result.error);
        } else {
            return new OkApi(result.value);
        }
    }

    getNumber(name: string, defaultValue: number): number {
        return this._actual.getNumber(name, defaultValue);
    }

    tryGetBoolean(name: string, context?: string): ResultApi<boolean, string> {
        const result = this._actual.tryGetBooleanType(name);
        if (result.isErr()) {
            return new Err(result.error);
        } else {
            return new OkApi(result.value);
        }
    }

    getBoolean(name: string, defaultValue: boolean): boolean {
        return this._actual.getBoolean(name, defaultValue);
    }

    tryGetElementArray(name: string): ResultApi<JsonElementApi[], IntegerApi> {
        const result = this._actual.tryGetElementArray(name);
        if (result.isErr()) {
            return new Err(result.error);
        } else {
            const value = JsonElementImplementation.arrayToApi(result.value);
            return new OkApi(value);
        }
    }

    tryGetJsonObjectArray(name: string): ResultApi<JsonApi[], number> {
        return this._actual.tryGetJsonObjectArray(name);
    }

    tryGetStringArray(name: string): ResultApi<string[], number> {
        return this._actual.tryGetStringArray(name);
    }

    tryGetNumberArray(name: string): ResultApi<number[], number> {
        return this._actual.tryGetNumberArray(name);
    }

    tryGetBooleanArray(name: string): ResultApi<boolean[], number> {
        return this._actual.tryGetBooleanArray(name);
    }

    tryGetAnyJsonValueTypeArray(name: string): ResultApi<JsonValueArrayApi, number> {
        return this._actual.tryGetAnyJsonValueTypeArray(name);
    }

    tryGetInteger(name: string): ResultApi<IntegerApi, string> {
        const result = this._actual.tryGetIntegerType(name);
        if (result.isErr()) {
            return new Err(result.error);
        } else {
            return new OkApi(result.value);
        }
    }

    getInteger(name: string, defaultValue: IntegerApi): IntegerApi {
        return this._actual.getInteger(name, defaultValue);
    }

    tryGetDate(name: string): ResultApi<Date, string> {
        const result = this._actual.tryGetDateType(name);
        if (result.isErr()) {
            return new Err(result.error);
        } else {
            return new OkApi(result.value);
        }
    }

    getDate(name: string, defaultValue: Date): Date {
        return this._actual.getDate(name, defaultValue);
    }

    tryGetDateTime(name: string): ResultApi<Date, string> {
        const result = this._actual.tryGetDateTimeType(name);
        if (result.isErr()) {
            return new Err(result.error);
        } else {
            return new OkApi(result.value);
        }
    }

    getDateTime(name: string, defaultValue: Date): Date {
        return this._actual.getDateTime(name, defaultValue);
    }

    tryGetGuid(name: string): ResultApi<GuidApi, string> {
        const result = this._actual.tryGetGuidType(name);
        if (result.isErr()) {
            return new Err(result.error);
        } else {
            return new OkApi(result.value);
        }
    }

    getGuid(name: string, defaultValue: GuidApi): GuidApi {
        return this._actual.getGuid(name, defaultValue);
    }

    tryGetDecimal(name: string): ResultApi<DecimalApi, string> {
        const result = this._actual.tryGetDecimalType(name);
        if (result.isErr()) {
            return new Err(result.error);
        } else {
            return new OkApi(result.value);
        }
    }

    getDecimal(name: string, defaultValue: DecimalApi): DecimalApi {
        return this._actual.getDecimal(name, defaultValue);
    }

    newElement(name: string): JsonElementApi {
        const element = this._actual.newElement(name);
        return JsonElementImplementation.toApi(element);
    }

    setElement(name: string, valueApi: JsonElementApi | undefined): void {
        const value = valueApi === undefined ? undefined : JsonElementImplementation.fromApi(valueApi);
        this._actual.setElement(name, value);
    }

    setJson(name: string, value: JsonApi | undefined): void {
        this._actual.setJson(name, value);
    }

    setJsonValue(name: string, value: JsonValueApi | undefined): void {
        this._actual.setJsonValue(name, value);
    }

    setString(name: string, value: string | undefined): void {
        this._actual.setString(name, value);
    }

    setNumber(name: string, value: number | undefined): void {
        this._actual.setNumber(name, value);
    }

    setBoolean(name: string, value: boolean | undefined): void {
        this._actual.setBoolean(name, value);
    }

    setElementArray(name: string, valueApi: JsonElementApi[] | undefined): void {
        const value = valueApi === undefined ? undefined : JsonElementImplementation.arrayFromApi(valueApi);
        this._actual.setElementArray(name, value);
    }

    setObjectArray(name: string, value: JsonApi[] | undefined): void {
        this._actual.setObjectArray(name, value);
    }

    setStringArray(name: string, value: string[] | undefined): void {
        this._actual.setStringArray(name, value);
    }

    setNumberArray(name: string, value: number[] | undefined): void {
        this._actual.setNumberArray(name, value);
    }

    setBooleanArray(name: string, value: boolean[] | undefined): void {
        this._actual.setBooleanArray(name, value);
    }

    setInteger(name: string, value: IntegerApi | undefined): void {
        this._actual.setInteger(name, value);
    }

    setDate(name: string, value: Date | undefined): void {
        this._actual.setDate(name, value);
    }

    setDateTime(name: string, value: Date | undefined): void {
        this._actual.setDateTime(name, value);
    }

    setGuid(name: string, value: GuidApi | undefined): void {
        this._actual.setGuid(name, value);
    }

    setDecimal(name: string, value: DecimalApi | undefined): void {
        this._actual.setDecimal(name, value);
    }

    forEach(callback: JsonElementApi.ForEachCallback): void {
        this._actual.forEach(callback);
    }

    forEachElement(callback: JsonElementApi.ForEachElementCallback): void {
        function actualCallback(name: string, value: JsonElement, idx: IntegerApi) {
            const valueApi = JsonElementImplementation.toApi(value);
            callback(name, valueApi, idx);
        }
        this._actual.forEachElement(actualCallback);
    }

    forEachValue(callback: JsonElementApi.ForEachValueCallback): void {
        this._actual.forEachValue(callback);
    }

    forEachString(callback: JsonElementApi.ForEachStringCallback): void {
        this._actual.forEachString(callback);
    }

    forEachNumber(callback: JsonElementApi.ForEachNumberCallback): void {
        this._actual.forEachNumber(callback);
    }

    forEachBoolean(callback: JsonElementApi.ForEachBooleanCallback): void {
        this._actual.forEachBoolean(callback);
    }
}

export namespace JsonElementImplementation {
    export function toApi(value: JsonElement): JsonElementApi {
        return new JsonElementImplementation(value);
    }

    export function fromApi(value: JsonElementApi): JsonElement {
        const implementation = value as JsonElementImplementation;
        return implementation.actual;
    }

    export function arrayToApi(value: readonly JsonElement[]): JsonElementApi[] {
        const count = value.length;
        const result = new Array<JsonElementApi>(count);
        for (let i = 0; i < count; i++) {
            result[i] = toApi(value[i]);
        }
        return result;
    }

    export function arrayFromApi(value: JsonElementApi[]) {
        const count = value.length;
        const result = new Array<JsonElement>(count);
        for (let i = 0; i < count; i++) {
            const elementApi = value[i];
            result[i] = fromApi(elementApi);
        }
        return result;
    }
}
