/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { JsonElement } from 'src/sys/internal-api';
import {
    Decimal as DecimalApi,
    Guid as GuidApi,
    Integer as IntegerApi,
    Json as JsonApi,
    JsonElement as JsonElementApi,
    JsonValue as JsonValueApi,
    JsonValueArray as JsonValueArrayApi
} from '../../../api/extension-api';

export class JsonElementImplementation implements JsonElementApi {
    get actual() { return this._actual; }
    get json() { return this.actual.json; }

    constructor(private readonly _actual: JsonElement) { }

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

    parse(jsonText: string, context?: string): boolean {
        return this._actual.parse(jsonText, context);
    }

    tryGetElement(name: string, context?: string): JsonElement | undefined {
        return this._actual.tryGetElement(name, context);
    }

    tryGetJsonValue(name: string): JsonValueApi | undefined {
        return this._actual.tryGetJsonValue(name);
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    tryGetNativeObject(name: string, context?: string): object | undefined {
        return this._actual.tryGetNativeObject(name, context);
    }

    tryGetJsonObject(name: string, context?: string): JsonApi | undefined {
        return this._actual.tryGetJsonObject(name, context);
    }

    tryGetString(name: string, context?: string): string | undefined {
        return this._actual.tryGetString(name, context);
    }

    getString(name: string, defaultValue: string, context?: string): string {
        return this._actual.getString(name, defaultValue, context);
    }

    tryGetNumber(name: string, context?: string): number | undefined {
        return this._actual.tryGetNumber(name, context);
    }

    getNumber(name: string, defaultValue: number, context?: string): number {
        return this._actual.getNumber(name, defaultValue, context);
    }

    tryGetBoolean(name: string, context?: string): boolean | undefined {
        return this._actual.tryGetBoolean(name, context);
    }

    getBoolean(name: string, defaultValue: boolean, context?: string): boolean {
        return this._actual.getBoolean(name, defaultValue, context);
    }

    tryGetElementArray(name: string, context?: string): JsonElementApi[] | undefined {
        return this._actual.tryGetElementArray(name, context);
    }

    tryGetJsonObjectArray(name: string, context?: string): JsonApi[] | undefined {
        return this._actual.tryGetJsonObjectArray(name, context);
    }

    tryGetStringArray(name: string, context?: string): string[] | undefined {
        return this._actual.tryGetStringArray(name, context);
    }

    tryGetNumberArray(name: string, context?: string): number[] | undefined {
        return this._actual.tryGetNumberArray(name, context);
    }

    tryGetBooleanArray(name: string, context?: string): boolean[] | undefined {
        return this._actual.tryGetBooleanArray(name, context);
    }

    tryGetAnyJsonValueTypeArray(name: string, context?: string): JsonValueArrayApi | undefined {
        return this._actual.tryGetAnyJsonValueTypeArray(name, context);
    }

    tryGetInteger(name: string, context?: string): IntegerApi | undefined {
        return this._actual.tryGetInteger(name, context);
    }

    getInteger(name: string, defaultValue: IntegerApi, context?: string): IntegerApi {
        return this._actual.getInteger(name, defaultValue, context);
    }

    tryGetDate(name: string, context?: string): Date | undefined {
        return this._actual.tryGetDate(name, context);
    }

    getDate(name: string, defaultValue: Date, context?: string): Date {
        return this._actual.getDate(name, defaultValue, context);
    }

    tryGetDateTime(name: string, context?: string): Date | undefined {
        return this._actual.tryGetDateTime(name, context);
    }

    getDateTime(name: string, defaultValue: Date, context?: string): Date {
        return this._actual.getDateTime(name, defaultValue, context);
    }

    tryGetGuid(name: string, context?: string): GuidApi | undefined {
        return this._actual.tryGetGuid(name, context);
    }

    getGuid(name: string, defaultValue: GuidApi, context?: string): GuidApi {
        return this._actual.getGuid(name, defaultValue, context);
    }

    tryGetDecimal(name: string, context?: string): DecimalApi | undefined {
        return this._actual.tryGetDecimal(name, context);
    }

    getDecimal(name: string, defaultValue: DecimalApi, context?: string): DecimalApi {
        return this._actual.getDecimal(name, defaultValue, context);
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

    forEach(callback: JsonElement.ForEachCallback): void {
        this._actual.forEach(callback);
    }

    forEachElement(callback: JsonElement.ForEachElementCallback): void {
        this._actual.forEachElement(callback);
    }

    forEachValue(callback: JsonElement.ForEachValueCallback): void {
        this._actual.forEachValue(callback);
    }

    forEachString(callback: JsonElement.ForEachStringCallback): void {
        this._actual.forEachString(callback);
    }

    forEachNumber(callback: JsonElement.ForEachNumberCallback): void {
        this._actual.forEachNumber(callback);
    }

    forEachBoolean(callback: JsonElement.ForEachBooleanCallback): void {
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
