/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId } from 'src/res/internal-api';
import { compareString, ComparisonResult, Json, JsonElement, Logger, MapKey } from 'src/sys/internal-api';
import { ExchangeId, ExchangeInfo } from './data-types';

export class IvemId {
    private _mapKey: MapKey;

    get code(): string { return this._code; }
    get exchangeId(): ExchangeId { return this._exchangeId; }

    get mapKey() {
        if (this._mapKey === undefined) {
            this._mapKey = IvemId.generateMapKey(this._code, this._exchangeId);
        }
        return this._mapKey;
    }

    constructor(private _code: string, private _exchangeId: ExchangeId) { }

    static isUndefinableEqual(Left: IvemId | undefined, Right: IvemId | undefined): boolean {
        if (Left === undefined) {
            return Right === undefined;
        } else {
            if (Right === undefined) {
                return false;
            } else {
                return this.isEqual(Left, Right);
            }
        }
    }

    static isEqual(Left: IvemId, Right: IvemId): boolean {
        return (Left.code === Right.code) && (Left._exchangeId === Right._exchangeId);
    }

    createCopy() {
        return new IvemId(this.code, this.exchangeId);
    }

    get name(): string {
        return this._code + '.' + ExchangeInfo.idToName(this._exchangeId);
    }

    toJson(): IvemId.PersistJson {
        const result: IvemId.PersistJson = {
            code: this._code,
            exchange: ExchangeInfo.idToJsonValue(this._exchangeId)
        } as const;
        return result;
    }
}

export namespace IvemId {
    export interface PersistJson extends Json {
        code: string;
        exchange: string;
    }

    export function compare(left: IvemId, right: IvemId): ComparisonResult {
        let result = ExchangeInfo.compareId(left.exchangeId, right.exchangeId);
        if (result === 0) {
            result = compareString(left.code, right.code);
        }
        return result;
    }

    export function priorityExchangeCompare(left: IvemId, right: IvemId, priorityExchangeId: ExchangeId): ComparisonResult {
        let result = ExchangeInfo.priorityCompareId(left.exchangeId, right.exchangeId, priorityExchangeId);
        if (result === 0) {
            result = compareString(left.code, right.code);
        }
        return result;
    }

    export function generateMapKey(code: string, exchangeId: ExchangeId): MapKey {
        return ExchangeInfo.idToName(exchangeId) + ',' + code;
    }

    export function tryCreateFromJson(value: PersistJson): IvemId | undefined {
        const { code, exchange } = value;
        if (code === undefined) {
            return undefined;
        } else {
            if (code === '') {
                return undefined;
            } else {
                if (exchange === undefined) {
                    return undefined;
                } else {
                    const exchangeId = ExchangeInfo.tryJsonValueToId(exchange);
                    if (exchangeId === undefined) {
                        return undefined;
                    } else {
                        return new IvemId(code, exchangeId);
                    }
                }
            }
        }
    }

    export function tryCreateArrayFromJson(jsonArray: PersistJson[]) {
        const count = jsonArray.length;
        const resultArray = new Array<IvemId>(count);
        for (let I = 0; I < count; I++) {
            const ivemId = tryCreateFromJson(jsonArray[I]);
            if (ivemId === undefined) {
                return undefined;
            } else {
                resultArray[I] = ivemId;
            }
        }

        return resultArray;
    }

    export function tryGetFromJsonElement(element: JsonElement, name: string, context?: string): IvemId | undefined {
        const jsonValue = element.tryGetNativeObject(name);
        if (jsonValue === undefined || jsonValue === null) {
            return undefined;
        } else {
            const result = IvemId.tryCreateFromJson(jsonValue as IvemId.PersistJson);
            if (result !== undefined) {
                return result;
            } else {
                const errorText = JsonElement.generateGetErrorText(StringId.InvalidIvemIdJson, jsonValue, context);
                Logger.logError(errorText);
                return undefined;
            }
        }
    }

    export function getFromJsonElement(element: JsonElement, name: string, defaultValue: IvemId, context?: string) {
        const tryResult = tryGetFromJsonElement(element, name, context);
        return (tryResult === undefined) ? defaultValue : tryResult;
    }

    // export class List extends TList<IvemId> {
    //     private getAsJsonValue(): string {
    //         const ivemIdJsonArray = new Array<string>(this.count);
    //         for (let i = 0; i < this.count; i++) {
    //             ivemIdJsonArray[i] = this.getItem(i).asJsonElement();
    //         }
    //         return CommaText.fromStringArray(ivemIdJsonArray);
    //     }

    //     get asJsonValue(): string {
    //         return this.getAsJsonValue();
    //     }

    //     tryLoadFromJsonValue(Value: string): boolean {
    //         super.clear();
    //         const commaTextToResult = CommaText.toStringArrayWithResult(Value);
    //         if (!commaTextToResult.success) {
    //             return false;
    //         } else {
    //             const ivemIdJsonArray = commaTextToResult.array;
    //             this.capacity = ivemIdJsonArray.length;
    //             for (const ivemIdJsonValue of ivemIdJsonArray) {
    //                 const ivemId = new IvemId();
    //                 if (ivemId.tryLoadFromJsonValue(ivemIdJsonValue)) {
    //                     super.add(ivemId);
    //                 } else {
    //                     super.clear();
    //                     return false;
    //                 }
    //             }
    //         }
    //         return true;
    //     }
    // }

    // export interface TryToArrayResult {
    //     success: boolean;
    //     array: IvemId[];
    // }
}
