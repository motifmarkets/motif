/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId } from 'src/res/internal-api';
import { ComparableList, compareString, Integer, JsonElement, Logger } from 'src/sys/internal-api';
import { ExchangeEnvironment, ExchangeEnvironmentId, ExchangeId, ExchangeInfo, MarketId, MarketInfo } from './data-types';
import { IvemId } from './ivem-id';

export class LitIvemId {

    // Normally this is left undefined.  If undefined then default Exchange EnvironmentId is used.
    // Only use in scenarios where (for example), default is delayed and you want a real time price for trading
    // Do not persist _environmentId so that persisted can move between environment.  Persist _explicitEnvironmentId
    private _explicitEnvironmentId: ExchangeEnvironmentId | undefined;
    private _persistKey: string;

    constructor(private _code: string, private _litId: MarketId, private _environmentId: ExchangeEnvironmentId) { }

    get code() { return this._code; }
    get litId() { return this._litId; }
    get environmentId() { return this._environmentId; }

    get persistKey() {
        if (this._persistKey === undefined) {
            this._persistKey = LitIvemId.generatePersistKey(this);
        }
        return this._persistKey;
    }

    get mapKey() { return this.persistKey; } // do same thing

    get name(): string {
        return this.code + '.' + MarketInfo.idToName(this.litId);
    }

    get exchangeId(): ExchangeId {
        return MarketInfo.idToExchangeId(this.litId);
    }

    get ivemId() {
        return new IvemId(this.code, this.exchangeId);
    }

    get explicitEnvironmentId() { return this._explicitEnvironmentId; }
    set explicitEnvironmentId(value: ExchangeEnvironmentId | undefined) {
        this.explicitEnvironmentId = value;
        if (value === undefined) {
            this._environmentId = ExchangeInfo.getDefaultEnvironmentId();
        } else {
            this._environmentId = value;
        }
    }

    createCopy() {
        return new LitIvemId(this.code, this.litId, this.environmentId);
    }

    toJson(): LitIvemId.Json {
        if (this.explicitEnvironmentId !== undefined) {
            const result: LitIvemId.EnvironmentedJson = {
                code: this.code,
                market: MarketInfo.idToJsonValue(this.litId),
                environment: ExchangeEnvironment.idToJsonValue(this.explicitEnvironmentId),
            };
            return result;
        } else {
            const result: LitIvemId.UnenvironmentedJson = {
                code: this.code,
                market: MarketInfo.idToJsonValue(this.litId),
            };
            return result;
        }

    }
}

export namespace LitIvemId {

    export const enum JsonName {
        Code = 'code',
        Market = 'market',
        Environment = 'environment',
    }

    export interface BaseJson {
        [name: string]: string;
    }

    export interface UnenvironmentedJson extends BaseJson {
        code: string;
        market: string;
    }

    export interface EnvironmentedJson extends BaseJson {
        code: string;
        market: string;
        environment: string;
    }

    export type Json = UnenvironmentedJson | EnvironmentedJson;

    export namespace Json {
        export function isEnvironmented(value: Json): value is EnvironmentedJson {
            return (value as EnvironmentedJson).environment !== undefined;
        }

        export function ensureEnvironmented(value: Json, environmentId: ExchangeEnvironmentId) {
            const environmentedValue = value as EnvironmentedJson;
            if (environmentedValue.environment === undefined) {
                environmentedValue.environment = ExchangeEnvironment.idToJsonValue(environmentId);
            }
            return environmentedValue;
        }
    }

    export const nullCode = '';

    export function createFromCodeMarket(code: string, litId: MarketId) {
        const result = new LitIvemId(code, litId, ExchangeInfo.getDefaultEnvironmentId());
        return result;
    }

    export function generatePersistKey(litIvemId: LitIvemId) {
        if (litIvemId.code === nullCode) {
            return '';
        } else {
            let environmentPart: string;
            if (litIvemId.explicitEnvironmentId === undefined) {
                environmentPart = '';
            } else {
                environmentPart = ExchangeEnvironment.idToJsonValue(litIvemId.explicitEnvironmentId);
            }
            const marketPart = MarketInfo.idToJsonValue(litIvemId.litId);
            const codePart = litIvemId.code.toUpperCase();

            return environmentPart + '|' + marketPart + '|' + codePart;
        }
    }

    export function isUndefinableEqual(left: LitIvemId | undefined, right: LitIvemId | undefined): boolean {
        if (left === undefined) {
            return right === undefined;
        } else {
            if (right === undefined) {
                return false;
            } else {
                return isEqual(left, right);
            }
        }
    }

    export function isEqual(left: LitIvemId, right: LitIvemId): boolean {
        return (left.code === right.code) && (left.litId === right.litId) && (left.environmentId === right.environmentId);
    }

    export function compare(left: LitIvemId, right: LitIvemId): number {
        let Result = MarketInfo.compareId(left.litId, right.litId);
        if (Result === 0) {
            Result = compareString(left.code, right.code);
        }
        return Result;
    }

    export function tryCreateFromJson(json: Json, configErrorLoggingActive = true): LitIvemId | undefined {
        function checkLogConfigError(code: string, text: string, maxTextLength: Integer) {
            if (configErrorLoggingActive) {
                Logger.logConfigError(code, text, maxTextLength);
            }
        }

        const marketJsonValue = json[JsonName.Market];
        if (marketJsonValue === undefined) {
            checkLogConfigError('LIITCFJMU23300192993', JSON.stringify(json), 200);
            return undefined;
        } else {
            const marketId = MarketInfo.tryJsonValueToId(marketJsonValue);
            if (marketId === undefined) {
                checkLogConfigError('LIITCFJM2300192993', JSON.stringify(json), 200);
                return undefined;
            } else {
                const code = json[JsonName.Code];
                if (code === undefined || code === '') {
                    checkLogConfigError('LIITCFJC2300192994', JSON.stringify(json), 200);
                    return undefined;
                } else {
                    const environmentJsonValue = json[JsonName.Environment];
                    if (environmentJsonValue === undefined) {
                        return createFromCodeMarket(code, marketId); // no explicit environmentId
                    } else {
                        const environmentId = ExchangeEnvironment.tryJsonToId(environmentJsonValue);
                        if (environmentId === undefined) {
                            checkLogConfigError('LIITCFJE2300192995', JSON.stringify(json), 200);
                            return undefined;
                        } else {
                            return new LitIvemId(code, marketId, environmentId);
                        }
                    }
                }
            }
        }
    }

    export function arrayToJson(arrayValue: LitIvemId[]) {
        const count = arrayValue.length;
        const jsonArray = new Array<Json>(count);
        for (let i = 0; i < count; i++) {
            jsonArray[i] = arrayValue[i].toJson();
        }

        return jsonArray;
    }

    export function tryCreateArrayFromJson(jsonArray: Json[], configErrorLoggingActive = true) {
        const count = jsonArray.length;
        const resultArray = new Array<LitIvemId>(count);
        for (let I = 0; I < count; I++) {
            const litIvemId = tryCreateFromJson(jsonArray[I], configErrorLoggingActive);
            if (litIvemId === undefined) {
                return undefined;
            } else {
                resultArray[I] = litIvemId;
            }
        }

        return resultArray;
    }

    export class List extends ComparableList<LitIvemId> {
        // private _getAsJsonValue(): string {
        //     const ivemIdJsonArray = new Array<string>(this.count);
        //     for (let i = 0; i < this.count; i++) {
        //         ivemIdJsonArray[i] = this.getItem(i).toJsonValue();
        //     }
        //     return CommaText.fromStringArray(ivemIdJsonArray);
        // }

        // get asJsonValue(): string {
        //     return this._getAsJsonValue();
        // }

        constructor() {
            super(List.compareItems);
        }

        // tryLoadFromJsonValue(value: string): boolean {
        //     super.clear();
        //     const commaTextToResult = CommaText.toStringArrayWithResult(value);
        //     if (!commaTextToResult.success) {
        //         return false;
        //     } else {
        //         const ivemIdJsonArray = commaTextToResult.array;
        //         this.capacity = ivemIdJsonArray.length;
        //         for (const ivemIdJsonValue of ivemIdJsonArray) {
        //             const litId = new LitIvemId();
        //             if (litId.tryLoadFromJsonValue(ivemIdJsonValue)) {
        //                 super.add(litId);
        //             } else {
        //                 super.clear();
        //                 return false;
        //             }
        //         }
        //     }
        //     return true;
        // }
    }

    // export interface TryToArrayResult {
    //     success: boolean;
    //     array: LitIvemId[];
    // }
    export namespace List {
        export function compareItems(left: LitIvemId, right: LitIvemId) {
            return LitIvemId.compare(left, right);
        }
    }

    export function tryGetFromJsonElement(element: JsonElement, name: string, context?: string): LitIvemId | undefined {
        const jsonValue = element.tryGetNativeObject(name);
        if (jsonValue === undefined || jsonValue === null) {
            return undefined;
        } else {
            if (typeof (jsonValue) !== 'object' || Array.isArray(jsonValue)) {
                const errorText = JsonElement.generateGetErrorText(StringId.LitIvemIdNotJsonObject, jsonValue, context);
                Logger.logError(errorText);
                return undefined;
            } else {
                const jsonObject = jsonValue as LitIvemId.Json;
                const result = LitIvemId.tryCreateFromJson(jsonObject);
                if (result !== undefined) {
                    return result;
                } else {
                    const errorText = JsonElement.generateGetErrorText(StringId.InvalidLitIvemIdJson, jsonValue, context);
                    Logger.logError(errorText);
                    return undefined;
                }
            }
        }
    }

    export function getFromJsonElement(element: JsonElement, name: string, defaultValue: LitIvemId, context?: string) {
        const tryResult = tryGetFromJsonElement(element, name, context);
        return (tryResult === undefined) ? defaultValue : tryResult;
    }
}
