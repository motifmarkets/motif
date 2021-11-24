/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from 'decimal.js-light';
import { I18nStrings, StringId } from 'res-internal-api';
import { Logger } from './logger';
import { Guid, Integer, Json, JsonValue, JsonValueArray } from './types';
import { dateToDateOnlyIsoString, deepExtendObject } from './utils';

export class JsonElement {
    private _json: Json;

    constructor(jsonObject?: Json, private readonly _errorHandlingActive = true) {
        this._json = jsonObject ?? {};
    }

    get json() { return this._json; }

    getState(): Json {
        return this._json;
    }

    clear() {
        this._json = {};
    }

    shallowAssign(element: JsonElement | undefined) {
        if (element === undefined) {
            this._json = {};
        } else {
            const json = element.json;
            if (json === undefined) {
                this._json = {};
            } else {
                this._json = element.json;
            }
        }
    }

    deepExtend(other: Json) {
        deepExtendObject(this._json, other);
    }

    stringify(): string {
        return JSON.stringify(this._json);
    }

    parse(jsonText: string, context?: string): boolean {
        try {
            this._json = JSON.parse(jsonText);
            return true;
        } catch (e) {
            if (!this._errorHandlingActive) {
                throw e;
            } else {
                const errorText = JsonElement.generateErrorText('JsonElement.Parse', StringId.InvalidJsonText, jsonText, context);
                Logger.logError(errorText);
                if (!JsonElement.isJsonExceptionHandlable(e)) {
                    throw e;
                } else {
                    this.clear();
                    return false;
                }
            }
        }
    }

    tryGetElement(name: string, context?: string): JsonElement | undefined {
        const objectValue = this.tryGetJsonObject(name, context);
        if (objectValue === undefined) {
            return undefined;
        } else {
            const result = new JsonElement(objectValue);
            return result;
        }
    }

    tryGetJsonValue(name: string) {
        return this._json[name];
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    tryGetNativeObject(name: string, context?: string): object | undefined {
        const jsonValue = this._json[name];
        if (jsonValue === undefined || jsonValue === null) {
            return undefined;
        } else {
            if (typeof jsonValue !== 'object' || jsonValue === null) {
                const errorText = JsonElement.generateGetErrorText(StringId.NotObject, jsonValue, context);
                if (!this._errorHandlingActive) {
                    throw new TypeError(errorText);
                } else {
                    Logger.logError(errorText);
                    return undefined;
                }
            } else {
                // eslint-disable-next-line @typescript-eslint/ban-types
                return jsonValue as object;
            }
        }
    }

    tryGetJsonObject(name: string, context?: string): Json | undefined {
        const jsonValue = this._json[name];
        if (jsonValue === undefined || jsonValue === null) {
            return undefined;
        } else {
            if (typeof (jsonValue) !== 'object') {
                const errorText = JsonElement.generateGetErrorText(StringId.NotObject, jsonValue, context);
                if (!this._errorHandlingActive) {
                    throw new TypeError(errorText);
                } else {
                    Logger.logError(errorText);
                    return undefined;
                }
            } else {
                try {
                    return jsonValue as Json;
                } catch (e) {
                    if (!this._errorHandlingActive) {
                        throw e;
                    } else {
                        const errorText = JsonElement.generateGetErrorText(StringId.InvalidJsonObject, jsonValue, context);
                        Logger.logError(errorText);
                        if (JsonElement.isJsonExceptionHandlable(e)) {
                            return undefined;
                        } else {
                            throw e;
                        }
                    }
                }
            }
        }
    }

    tryGetString(name: string, context?: string): string | undefined {
        const jsonValue = this._json[name];
        if (jsonValue === undefined || jsonValue === null) {
            return undefined;
        } else {
            if (typeof (jsonValue) !== 'string') {
                const errorText = JsonElement.generateGetErrorText(StringId.NotString, jsonValue, context);
                if (!this._errorHandlingActive) {
                    throw new TypeError(errorText);
                } else {
                    Logger.logError(errorText);
                    return undefined;
                }
            } else {
                return jsonValue;
            }
        }
    }

    getString(name: string, defaultValue: string, context?: string) {
        const tryResult = this.tryGetString(name, context);
        return (tryResult === undefined) ? defaultValue : tryResult;
    }

    tryGetNumber(name: string, context?: string) {
        const jsonValue = this._json[name];
        if (jsonValue === undefined || jsonValue === null) {
            return undefined;
        } else {
            if (typeof (jsonValue) !== 'number') {
                const errorText = JsonElement.generateGetErrorText(StringId.NotNumber, jsonValue, context);
                if (!this._errorHandlingActive) {
                    throw new TypeError(errorText);
                } else {
                    Logger.logError(errorText);
                    return undefined;
                }
            } else {
                return jsonValue;
            }
        }
    }

    getNumber(name: string, defaultValue: number, context?: string) {
        const tryResult = this.tryGetNumber(name, context);
        return (tryResult === undefined) ? defaultValue : tryResult;
    }

    tryGetBoolean(name: string, context?: string): boolean | undefined {
        const jsonValue = this._json[name];
        if (jsonValue === undefined || jsonValue === null) {
            return undefined;
        } else {
            if (typeof (jsonValue) !== 'boolean') {
                const errorText = JsonElement.generateGetErrorText(StringId.NotBoolean, jsonValue, context);
                if (!this._errorHandlingActive) {
                    throw new TypeError(errorText);
                } else {
                    Logger.logError(errorText);
                    return undefined;
                }
            } else {
                return jsonValue;
            }
        }
    }

    getBoolean(name: string, defaultValue: boolean, context?: string) {
        const tryResult = this.tryGetBoolean(name, context);
        return tryResult === undefined ? defaultValue : tryResult;
    }

    tryGetElementArray(name: string, context?: string): Array<JsonElement> | undefined {
        const jsonValue = this._json[name];
        if (jsonValue === undefined || jsonValue === null) {
            return undefined;
        } else {
            if (!Array.isArray(jsonValue)) {
                const errorText = JsonElement.generateGetErrorText(StringId.NotArray, jsonValue, context);
                if (!this._errorHandlingActive) {
                    throw new TypeError(errorText);
                } else {
                    Logger.logError(errorText);
                    return undefined;
                }
            } else {
                let objArray: Array<Json>;
                try {
                    objArray = jsonValue as Array<Json>;
                } catch (e) {
                    if (!this._errorHandlingActive) {
                        throw e;
                    } else {
                        const errorText = JsonElement.generateGetErrorText(StringId.InvalidJsonObjectArray, jsonValue, context);
                        Logger.logError(errorText);
                        if (JsonElement.isJsonExceptionHandlable(e)) {
                            return undefined;
                        } else {
                            throw e;
                        }
                    }
                }

                const result = new Array<JsonElement>(objArray.length);
                for (let i = 0; i < objArray.length; i++) {
                    result[i] = new JsonElement(objArray[i]);
                }
                return result;
            }
        }
    }

    tryGetJsonObjectArray(name: string, context?: string): Array<Json> | undefined {
        const jsonValue = this._json[name];
        if (jsonValue === undefined) {
            return undefined;
        } else {
            if (!Array.isArray(jsonValue)) {
                const errorText = JsonElement.generateGetErrorText(StringId.NotArray, jsonValue, context);
                if (!this._errorHandlingActive) {
                    throw new TypeError(errorText);
                } else {
                    Logger.logError(errorText);
                    return undefined;
                }
            } else {
                try {
                    return jsonValue as Array<Json>;
                } catch (e) {
                    if (!this._errorHandlingActive) {
                        throw e;
                    } else {
                        const errorText = JsonElement.generateGetErrorText(StringId.InvalidJsonObjectArray, jsonValue, context);
                        Logger.logError(errorText);
                        if (JsonElement.isJsonExceptionHandlable(e)) {
                            return undefined;
                        } else {
                            throw e;
                        }
                    }
                }
            }
        }
    }

    tryGetStringArray(name: string, context?: string): Array<string> | undefined {
        const jsonValue = this._json[name];
        if (jsonValue === undefined || jsonValue === null) {
            return undefined;
        } else {
            if (!Array.isArray(jsonValue)) {
                const errorText = JsonElement.generateGetErrorText(StringId.NotArray, jsonValue, context);
                if (!this._errorHandlingActive) {
                    throw new TypeError(errorText);
                } else {
                    Logger.logError(errorText);
                    return undefined;
                }
            } else {
                try {
                    return jsonValue as Array<string>;
                } catch (e) {
                    if (!this._errorHandlingActive) {
                        throw e;
                    } else {
                        const errorText = JsonElement.generateGetErrorText(StringId.InvalidStringArray, jsonValue, context);
                        Logger.logError(errorText);
                        if (JsonElement.isJsonExceptionHandlable(e)) {
                            return undefined;
                        } else {
                            throw e;
                        }
                    }
                }
            }
        }
    }

    tryGetNumberArray(name: string, context?: string): Array<number> | undefined {
        const jsonValue = this._json[name];
        if (jsonValue === undefined || jsonValue === null) {
            return undefined;
        } else {
            if (!Array.isArray(jsonValue)) {
                const errorText = JsonElement.generateGetErrorText(StringId.NotArray, jsonValue, context);
                if (!this._errorHandlingActive) {
                    throw new TypeError(errorText);
                } else {
                    Logger.logError(errorText);
                    return undefined;
                }
            } else {
                try {
                    return jsonValue as Array<number>;
                } catch (e) {
                    if (!this._errorHandlingActive) {
                        throw e;
                    } else {
                        const errorText = JsonElement.generateGetErrorText(StringId.InvalidNumberArray, jsonValue, context);
                        Logger.logError(errorText);
                        if (JsonElement.isJsonExceptionHandlable(e)) {
                            return undefined;
                        } else {
                            throw e;
                        }
                    }
                }
            }
        }
    }

    tryGetBooleanArray(name: string, context?: string): Array<boolean> | undefined {
        const jsonValue = this._json[name];
        if (jsonValue === undefined || jsonValue === null) {
            return undefined;
        } else {
            if (!Array.isArray(jsonValue)) {
                const errorText = JsonElement.generateGetErrorText(StringId.NotArray, jsonValue, context);
                if (!this._errorHandlingActive) {
                    throw new TypeError(errorText);
                } else {
                    Logger.logError(errorText);
                    return undefined;
                }
            } else {
                try {
                    return jsonValue as Array<boolean>;
                } catch (e) {
                    if (!this._errorHandlingActive) {
                        throw e;
                    } else {
                        const errorText = JsonElement.generateGetErrorText(StringId.InvalidBooleanArray, jsonValue, context);
                        Logger.logError(errorText);
                        if (JsonElement.isJsonExceptionHandlable(e)) {
                            return undefined;
                        } else {
                            throw e;
                        }
                    }
                }
            }
        }
    }

    tryGetAnyJsonValueTypeArray(name: string, context?: string): JsonValueArray | undefined {
        const jsonValue = this._json[name];
        if (jsonValue === undefined || jsonValue === null) {
            return undefined;
        } else {
            if (!Array.isArray(jsonValue)) {
                const errorText = JsonElement.generateGetErrorText(StringId.NotArray, jsonValue, context);
                if (!this._errorHandlingActive) {
                    throw new TypeError(errorText);
                } else {
                    Logger.logError(errorText);
                    return undefined;
                }
            } else {
                try {
                    return jsonValue as JsonValueArray;
                } catch (e) {
                    if (!this._errorHandlingActive) {
                        throw e;
                    } else {
                        const errorText = JsonElement.generateGetErrorText(StringId.InvalidAnyJsonValueTypeArray, jsonValue, context);
                        Logger.logError(errorText);
                        if (JsonElement.isJsonExceptionHandlable(e)) {
                            return undefined;
                        } else {
                            throw e;
                        }
                    }
                }
            }
        }
    }

    tryGetInteger(name: string, context?: string): Integer | undefined {
        return this.tryGetNumber(name, context);
    }

    getInteger(name: string, defaultValue: Integer, context?: string) {
        const tryResult = this.tryGetInteger(name, context);
        return (tryResult === undefined) ? defaultValue : tryResult;
    }

    tryGetDate(name: string, context?: string): Date | undefined {
        const value = this.tryGetString(name, context);
        if (value === undefined) {
            return undefined;
        } else {
            // value should have format YYYY-MM-DD
            return new Date(value);
        }
    }

    getDate(name: string, defaultValue: Date, context?: string) {
        const tryResult = this.tryGetDate(name, context);
        return (tryResult === undefined) ? defaultValue : tryResult;
    }

    tryGetDateTime(name: string, context?: string): Date | undefined {
        const value = this.tryGetString(name, context);
        if (value === undefined) {
            return undefined;
        } else {
            // value should have ISO format
            return new Date(value);
        }
    }

    getDateTime(name: string, defaultValue: Date, context?: string) {
        const tryResult = this.tryGetDateTime(name, context);
        return (tryResult === undefined) ? defaultValue : tryResult;
    }

    tryGetGuid(name: string, context?: string): Guid | undefined {
        return this.tryGetString(name, context);
    }

    getGuid(name: string, defaultValue: Guid, context?: string) {
        const tryResult = this.tryGetGuid(name, context);
        return (tryResult === undefined) ? defaultValue : tryResult;
    }

    tryGetDecimal(name: string, context?: string): Decimal | undefined {
        const jsonValue = this._json[name];
        if (jsonValue === undefined || jsonValue === null) {
            return undefined;
        } else {
            if (typeof (jsonValue) !== 'string') {
                const errorText = JsonElement.generateGetErrorText(StringId.DecimalNotJsonString, jsonValue, context);
                if (!this._errorHandlingActive) {
                    throw new TypeError(errorText);
                } else {
                    Logger.logError(errorText);
                    return undefined;
                }
            } else {
                try {
                    return new Decimal(jsonValue);
                } catch (e) {
                    if (!this._errorHandlingActive) {
                        throw e;
                    } else {
                        const errorText = JsonElement.generateGetErrorText(StringId.InvalidDecimal, jsonValue, context);
                        Logger.logError(errorText);
                        if (JsonElement.isJsonExceptionHandlable(e)) {
                            return undefined;
                        } else {
                            throw e;
                        }
                    }
                }
            }
        }
    }

    getDecimal(name: string, defaultValue: Decimal, context?: string) {
        const tryResult = this.tryGetDecimal(name, context);
        return (tryResult === undefined) ? defaultValue : tryResult;
    }

    newElement(name: string): JsonElement {
        const result = new JsonElement();
        this._json[name] = result._json;
        return result;
    }

    setElement(name: string, value: JsonElement | undefined) {
        if (value !== undefined) {
            this._json[name] = value._json;
        }
    }

    setJson(name: string, value: Json | undefined) {
        if (value !== undefined && value !== {}) {
            this._json[name] = value;
        }
    }

    setJsonValue(name: string, value: JsonValue | undefined) {
        if (value !== undefined) {
            this._json[name] = value;
        }
    }

    setString(name: string, value: string | undefined) {
        if (value !== undefined) {
            this._json[name] = value;
        }
    }

    setNumber(name: string, value: number | undefined) {
        if (value !== undefined) {
            this._json[name] = value;
        }
    }

    setBoolean(name: string, value: boolean | undefined) {
        if (value !== undefined) {
            this._json[name] = value;
        }
    }

    setElementArray(name: string, value: JsonElement[] | undefined) {
        if (value !== undefined && value.length > 0) {
            const valueObjArray = new Array<Json>(value.length);
            for (let i = 0; i < value.length; i++) {
                valueObjArray[i] = value[i]._json;
               }
            this._json[name] = valueObjArray;
        }
    }

    setObjectArray(name: string, value: Array<Json> | undefined) {
        if (value !== undefined) {
            this._json[name] = value;
        }
    }

    setStringArray(name: string, value: Array<string> | undefined) {
        if (value !== undefined) {
            this._json[name] = value;
        }
    }

    setNumberArray(name: string, value: Array<number> | undefined) {
        if (value !== undefined) {
            this._json[name] = value;
        }
    }

    setBooleanArray(name: string, value: Array<boolean> | undefined) {
        if (value !== undefined) {
            this._json[name] = value;
        }
    }

    setInteger(name: string, value: Integer | undefined) {
        if (value !== undefined) {
            this.setNumber(name, value);
        }
    }

    setDate(name: string, value: Date | undefined) {
        if (value !== undefined) {
            const jsonValue = dateToDateOnlyIsoString(value);
            this.setString(name, jsonValue);
        }
    }

    setDateTime(name: string, value: Date | undefined) {
        if (value !== undefined) {
            this.setString(name, value.toISOString());
        }
    }

    setGuid(name: string, value: Guid | undefined) {
        if (value !== undefined) {
            this.setString(name, value);
        }
    }

    setDecimal(name: string, value: Decimal | undefined) {
        if (value !== undefined) {
            this._json[name] = value.toJSON();
        }
    }

    forEach(callback: JsonElement.ForEachCallback) {
        Object.entries(this._json).forEach((nameValue: [string, JsonValue], index: number) => {
            const [name, value] = nameValue;
            callback(name, value, index);
        });
    }

    forEachElement(callback: JsonElement.ForEachElementCallback) {
        Object.entries(this._json).forEach((nameValue: [string, JsonValue], index: number) => {
            const [name, value] = nameValue;
            if (typeof value === 'object') {
                let valueAsJsonObject: Json | undefined;
                try {
                    valueAsJsonObject = value as Json;
                } catch (e) {
                    if (JsonElement.isJsonExceptionHandlable(e)) {
                        valueAsJsonObject = undefined;
                    } else {
                        throw e;
                    }
                }

                if (valueAsJsonObject !== undefined) {
                    callback(name, new JsonElement(valueAsJsonObject), index);
                }
            }
        });
    }

    forEachValue(callback: JsonElement.ForEachValueCallback) {
        Object.entries(this._json).forEach((nameValue: [string, JsonValue], index: number) => {
            const [name, value] = nameValue;
            if (typeof value === 'object') {
                let valueAsJsonObject: Json | undefined;
                try {
                    valueAsJsonObject = value as Json;
                } catch (e) {
                    if (JsonElement.isJsonExceptionHandlable(e)) {
                        valueAsJsonObject = undefined;
                    } else {
                        throw e;
                    }
                }

                if (valueAsJsonObject !== undefined) {
                    callback(name, valueAsJsonObject, index);
                }
            }
        });
    }

    forEachString(callback: JsonElement.ForEachStringCallback) {
        Object.entries(this._json).forEach((nameValue: [string, JsonValue], index: number) => {
            const [name, value] = nameValue;
            if (typeof value === 'string') {
                callback(name, value, index);
            }
        });
    }

    forEachNumber(callback: JsonElement.ForEachNumberCallback) {
        Object.entries(this._json).forEach((nameValue: [string, JsonValue], index: number) => {
            const [name, value] = nameValue;
            if (typeof value === 'number') {
                callback(name, value, index);
            }
        });
    }

    forEachBoolean(callback: JsonElement.ForEachBooleanCallback) {
        Object.entries(this._json).forEach((nameValue: [string, JsonValue], index: number) => {
            const [name, value] = nameValue;
            if (typeof value === 'boolean') {
                callback(name, value, index);
            }
        });
    }
}

export namespace JsonElement {
    export type ForEachCallback = (this: void, name: string, value: JsonValue, idx: Integer) => void;
    export type ForEachElementCallback = (this: void, name: string, value: JsonElement, idx: Integer) => void;
    export type ForEachValueCallback = (this: void, name: string, value: JsonValue, idx: Integer) => void;
    export type ForEachStringCallback = (this: void, name: string, value: string, idx: Integer) => void;
    export type ForEachNumberCallback = (this: void, name: string, value: number, idx: Integer) => void;
    export type ForEachBooleanCallback = (this: void, name: string, value: boolean, idx: Integer) => void;

    export function createRootElement(rootJson: Json) {
        return new JsonElement(rootJson);
    }

    export function tryGetChildElement(parentElement: JsonElement | undefined, childName: string, context?: string) {
        if (parentElement === undefined) {
            return undefined;
        } else {
            return parentElement.tryGetElement(childName, context);
        }
    }

    export function generateErrorText(functionName: string, stringId: StringId, jsonValue: unknown, context?: string): string {
        let errorText = functionName + ': ' + I18nStrings.getStringPlusEnglish(stringId) + ': ';
        if (context !== undefined) {
            errorText += context + ': ';
        }
        errorText += `${jsonValue}`.substring(0, 200); // make sure not too long
        return errorText;
    }

    export function generateGetErrorText(stringId: StringId, jsonValue: unknown, context?: string): string {
        return generateErrorText('JsonElement.Get', stringId, jsonValue, context);
    }

    export function isJsonExceptionHandlable(e: unknown) {
        return typeof e === 'object' && (e instanceof TypeError || e instanceof SyntaxError);
    }
}
