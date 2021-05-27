/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer, Json, MapKey } from 'src/sys/internal-api';
import { IvemId, OrderRoute, OrderTypeId, SideId, TimeInForceId } from './common/internal-api';

export class RoutedIvemId {
    private _mapKey: MapKey;

    /*get SourceId(): TSymbolSourceId { return TMarketId.IdToSourceId(this.LitId); }
    get RootSourceId(): TSymbolSourceId { return TSymbolSourceId.IdToRoot(this.SourceId); }*/

    get mapKey() {
        if (this._mapKey === undefined) {
            this._mapKey = RoutedIvemId.generateMapKey(this.ivemId, this.route);
        }
        return this._mapKey;
    }

    constructor(public ivemId: IvemId, public route: OrderRoute) { }

    static isUndefinableEqual(left: RoutedIvemId | undefined, right: RoutedIvemId | undefined): boolean {
        if (left === undefined) {
            return right === undefined;
        } else {
            if (right === undefined) {
                return false;
            } else {
                return this.isEqual(left, right);
            }
        }
    }

    static isEqual(left: RoutedIvemId, right: RoutedIvemId): boolean {
        return IvemId.isEqual(left.ivemId, right.ivemId) && (OrderRoute.isEqual(left.route, right.route));
    }

    // static compare(left: RoutedIvemId, right: RoutedIvemId): number {
    //     let result = IvemId.compareNotNull(left.ivemId, right.ivemId);
    //     if (result === 0) {
    //         result = OrderRequest.Route.compare(left.route, right.route);
    //     }
    //     return result;
    // }

    // static arrayToJsonValue(ArrayValue: RoutedIvemId[]): string {
    //     const count = ArrayValue.length;
    //     const jsonArray = new Array<string>(count);
    //     for (let i = 0; i < count; i++) {
    //         jsonArray[i] = ArrayValue[i].asJsonValue();
    //     }

    //     return CommaText.fromStringArray(jsonArray);
    // }

    // static tryJsonToArray(XmlValue: string): RoutedIvemId.TryToArrayResult {
    //     const commaTextToResult = CommaText.toStringArrayWithResult(XmlValue);
    //     if (!commaTextToResult.success) {
    //         return {
    //             success: false,
    //             array: []
    //         };
    //     } else {
    //         const toArray = commaTextToResult.array;
    //         const count = toArray.length;
    //         const resultArray = new Array<RoutedIvemId>(count);
    //         for (let I = 0; I < count; I++) {
    //             const routedIvemId = RoutedIvemId.createFromJsonValue(toArray[I]);
    //             if (!routedIvemId.tryLoadFromJsonValue(toArray[I])) {
    //                 return {
    //                     success: false,
    //                     array: []
    //                 };
    //             } else {
    //                 resultArray[I] = routedIvemId;
    //             }
    //         }

    //         return {
    //             success: true,
    //             array: resultArray
    //         };
    //     }
    // }

    // static arrayToTransferStr(ArrayValue: RoutedIvemId[]): string {
    //     // use if not persistent
    //     return this.arrayToJsonValue(ArrayValue);
    // }

    // static tryTransferStrToArray(StrValue: string): RoutedIvemId.TryToArrayResult {
    //     // use if not persistent
    //     return this.tryJsonToArray(StrValue);
    // }

    createCopy() {
        return new RoutedIvemId(this.ivemId.createCopy(), this.route.createCopy());
    }

    get name(): string {
        return this.ivemId.name + '@' + this.route.name;
    }

    toJson() {
        const result: RoutedIvemId.PersistJson = {
            ivemId: this.ivemId.toJson(),
            route: this.route.toJson(),
        };
        return result;
    }

    // asJsonValue(): string {
    //     const array = this.ivemId.asJsonStringArray();

    //     return CommaText.from2Values(this.code, OrderDestination.IdToJsonValue(this.destId));
    // }

    // tryLoadFromJsonValue(Value: string): boolean {
    //     const commaTextToResult = CommaText.toStringArrayWithResult(Value);
    //     if (!commaTextToResult.success) {
    //         return false;
    //     } else {
    //         const array = commaTextToResult.array;
    //         if (array.length < 2) {
    //             return false;
    //         } else {
    //             // first element is code. second element is marketid as json
    //             const tryDestId = OrderDestination.TryJsonValueToId(array[1]);
    //             if (tryDestId === undefined) {
    //                 return false;
    //             } else {
    //                 this.code = array[0];
    //                 if (this.code === '') {
    //                     return false;
    //                 } else {
    //                     this.destId = tryDestId;
    //                     return true;
    //                 }
    //             }
    //         }
    //     }
    // }

    /*get AsIvemId() {
        return new TIvemId(this.Code, this.SourceId);
    }*/

    /*set AsIvemId(value: TIvemId) {
        this.Code = value.Code;
        this.LitId = TSymbolSourceId.IdToDefaultMarketId(value.SourceId);
    }*/

    getAllowedOrderTypes() {
        return this.route.getAllowedOrderTypeIds();
    }

    isOrderTypeAllowed(orderTypeId: OrderTypeId) {
        return this.route.isOrderTypeAllowed(orderTypeId);
    }

    getAllowedSideIds() {
        return this.route.getAllowedSideIds();
    }

    getAllowedTriggerTypeIds() {
        return this.route.getAllowedTriggerTypeIds();
    }

    isSideAllowed(sideId: SideId) {
        return this.route.isSideAllowed(sideId);
    }

    isQuantityAllowed(value: Integer) {
        return this.route.isQuantityAllowed(value);
    }

    getAllowedTimeInForcesForOrderType(orderTypeId: OrderTypeId) {
        return this.route.getAllowedTimeInForceIdsForOrderType(orderTypeId);
    }

    isTimeInForceForOrderTypeAllowed(orderTypeId: OrderTypeId, timeInForceId: TimeInForceId) {
        return this.route.isTimeInForceForOrderTypeAllowed(orderTypeId, timeInForceId);
    }
}

export namespace RoutedIvemId {

    export interface PersistJson extends Json {
        ivemId: IvemId.PersistJson;
        route: OrderRoute.PersistJson;
    }

    export function generateMapKey(ivemId: IvemId, route: OrderRoute): MapKey {
        return `${route.mapKey}~${ivemId.mapKey}`;
    }

    export function tryCreateFromJson(value: PersistJson) {
        const { ivemId: ivemIdJson, route: routeJson } = value;
        if (ivemIdJson === undefined) {
            return undefined;
        } else {
            if (routeJson === undefined) {
                return undefined;
            } else {
                const ivemId = IvemId.tryCreateFromJson(ivemIdJson);
                if (ivemId === undefined) {
                    return undefined;
                } else {
                    const route = OrderRoute.tryCreateFromJson(routeJson);
                    if (route === undefined) {
                        return undefined;
                    } else {
                        return new RoutedIvemId(ivemId, route);
                    }
                }
            }
        }
    }

    export function tryCreateArrayFromJson(jsonArray: PersistJson[]) {
        const count = jsonArray.length;
        const resultArray = new Array<RoutedIvemId>(count);
        for (let I = 0; I < count; I++) {
            const litIvemId = tryCreateFromJson(jsonArray[I]);
            if (litIvemId === undefined) {
                return undefined;
            } else {
                resultArray[I] = litIvemId;
            }
        }

        return resultArray;
    }

    // export function createFromJsonValue(Value: string) {
    //     const commaTextToResult = CommaText.toStringArrayWithResult(Value);
    //     if (!commaTextToResult.success) {
    //         return undefined;
    //     } else {
    //         const array = commaTextToResult.array;
    //         if (array.length < 2) {
    //             return undefined;
    //         } else {
    //             // first element is code. second element is marketid as json
    //             const tryDestId = OrderDestination.TryJsonValueToId(array[1]);
    //             if (tryDestId === undefined) {
    //                 return false;
    //             } else {
    //                 this.code = array[0];
    //                 if (this.code === '') {
    //                     return false;
    //                 } else {
    //                     this.destId = tryDestId;
    //                     return true;
    //                 }
    //             }
    //         }
    //     }
    // }

    // export class List extends TList<RoutedIvemId> {
    //     private getAsJsonValue(): string {
    //         const ivemIdJsonArray = new Array<string>(this.count);
    //         for (let i = 0; i < this.count; i++) {
    //             ivemIdJsonArray[i] = this.getItem(i).asJsonValue();
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
    //                 const destId = new RoutedIvemId('', OrderDestination.invalidId);
    //                 if (destId.tryLoadFromJsonValue(ivemIdJsonValue)) {
    //                     super.add(destId);
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
    //     array: RoutedIvemId[];
    // }
}
