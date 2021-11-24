/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExerciseTypeId, FieldDataTypeId, IvemId, LitIvemId, MarketId, MarketInfo } from 'adi-internal-api';
import { Decimal } from 'decimal.js-light';
import { StringId, Strings } from 'res-internal-api';
import { EnumInfoOutOfOrderError, Integer, isDecimalEqual, JsonElement, MapKey, nullDate, nullDecimal } from 'sys-internal-api';

export class CallPut {
    exercisePrice: Decimal;
    expiryDate: Date;
    litId: MarketId;
    callLitIvemId: LitIvemId;
    putLitIvemId: LitIvemId;
    contractMultiplier: Decimal;
    exerciseTypeId: ExerciseTypeId;
    underlyingIvemId: IvemId;
    underlyingIsIndex: boolean;

    createKey(): CallPut.Key {
        return new CallPut.Key(this.exercisePrice, this.expiryDate, this.litId);
    }

    matchesKey(key: CallPut.Key): boolean {
        return isDecimalEqual(key.exercisePrice, this.exercisePrice) &&
            key.expiryDate === this.expiryDate &&
            key.litId === this.litId;
    }

    generateMapKey(): MapKey {
        return CallPut.Key.toString(this.exercisePrice, this.expiryDate, this.litId);
    }
}

export namespace CallPut {
    export const enum FieldId {
        ExercisePrice,
        ExpiryDate,
        LitId,
        CallLitIvemId,
        PutLitIvemId,
        ContractMultiplier,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        ExerciseTypeId,
        UnderlyingIvemId,
        UnderlyingIsIndex,
    }

    export namespace Field {
        export type Id = CallPut.FieldId;
        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly dataTypeId: FieldDataTypeId;
            readonly displayId: StringId;
            readonly headingId: StringId;
        }

        type InfoObject = { [id in keyof typeof FieldId]: Info };

        const infoObject: InfoObject = {
            ExercisePrice: {
                id: FieldId.ExercisePrice,
                name: 'ExercisePrice',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.CallPutFieldDisplay_ExercisePrice,
                headingId: StringId.CallPutFieldHeading_ExercisePrice,
            },
            ExpiryDate: {
                id: FieldId.ExpiryDate,
                name: 'ExpiryDate',
                dataTypeId: FieldDataTypeId.Date,
                displayId: StringId.CallPutFieldDisplay_ExpiryDate,
                headingId: StringId.CallPutFieldHeading_ExpiryDate,
            },
            LitId: {
                id: FieldId.LitId,
                name: 'LitId',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.CallPutFieldDisplay_LitId,
                headingId: StringId.CallPutFieldHeading_LitId,
            },
            CallLitIvemId: {
                id: FieldId.CallLitIvemId,
                name: 'CallLitIvemId',
                dataTypeId: FieldDataTypeId.LitIvemId,
                displayId: StringId.CallPutFieldDisplay_CallLitIvemId,
                headingId: StringId.CallPutFieldHeading_CallLitIvemId,
            },
            PutLitIvemId: {
                id: FieldId.PutLitIvemId,
                name: 'PutLitIvemId',
                dataTypeId: FieldDataTypeId.LitIvemId,
                displayId: StringId.CallPutFieldDisplay_PutLitIvemId,
                headingId: StringId.CallPutFieldHeading_PutLitIvemId,
            },
            ContractMultiplier: {
                id: FieldId.ContractMultiplier,
                name: 'ContractMultiplier',
                dataTypeId: FieldDataTypeId.Number,
                displayId: StringId.CallPutFieldDisplay_ContractMultiplier,
                headingId: StringId.CallPutFieldHeading_ContractMultiplier,
            },
            ExerciseTypeId: {
                id: FieldId.ExerciseTypeId,
                name: 'ExerciseTypeId',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.CallPutFieldDisplay_ExerciseTypeId,
                headingId: StringId.CallPutFieldHeading_ExerciseTypeId,
            },
            UnderlyingIvemId: {
                id: FieldId.UnderlyingIvemId,
                name: 'UnderlyingIvemId',
                dataTypeId: FieldDataTypeId.IvemId,
                displayId: StringId.CallPutFieldDisplay_UnderlyingIvemId,
                headingId: StringId.CallPutFieldHeading_UnderlyingIvemId,
            },
            UnderlyingIsIndex: {
                id: FieldId.UnderlyingIsIndex,
                name: 'UnderlyingIsIndex',
                dataTypeId: FieldDataTypeId.Boolean,
                displayId: StringId.CallPutFieldDisplay_UnderlyingIsIndex,
                headingId: StringId.CallPutFieldHeading_UnderlyingIsIndex,
            },
        };

        export const count = Object.keys(infoObject).length;
        const infos = Object.values(infoObject);

        export function idToName(id: Id) {
            return infos[id].name;
        }

        export function idToFieldDataTypeId(id: Id) {
            return infos[id].dataTypeId;
        }

        export function idToDisplayId(id: Id) {
            return infos[id].displayId;
        }

        export function idToHeadingId(id: Id) {
            return infos[id].headingId;
        }

        export function idToHeading(id: Id) {
            return Strings[idToHeadingId(id)];
        }

        export function initialiseStaticField() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('CPFISF977532', outOfOrderIdx, infos[outOfOrderIdx].name);
            }
        }
    }

    export class Key {
        static readonly JsonTag_ExercisePrice = 'exercisePrice';
        static readonly JsonTag_ExpiryDate = 'expiryDate';
        static readonly JsonTag_LitId = 'litId';

        private _mapKey: MapKey;

        constructor(public exercisePrice: Decimal, public expiryDate: Date, public litId: MarketId) { }

        get mapKey() {
            if (this._mapKey === undefined) {
                this._mapKey = Key.toString(this.exercisePrice, this.expiryDate, this.litId);
            }
            return this._mapKey;
        }

        static createNull() {
            // will not match any valid CallPut
            return new Key(nullDecimal, nullDate, MarketId.AsxBookBuild);
        }

        assign(other: Key) {
            this.exercisePrice = other.exercisePrice;
            this.expiryDate = other.expiryDate;
            this.litId = other.litId;
        }

        saveToJson(element: JsonElement) {
            element.setDecimal(Key.JsonTag_ExercisePrice, this.exercisePrice);
            element.setDate(Key.JsonTag_ExpiryDate, this.expiryDate);
            element.setString(Key.JsonTag_LitId, MarketInfo.idToJsonValue(this.litId));
        }
    }

    export namespace Key {
        export function toString(exercisePrice: Decimal, expiryDate: Date, litId: MarketId): string {
            return `${exercisePrice}|${expiryDate.getTime()}|${MarketInfo.idToJsonValue(litId)}`;
        }

        export function isEqual(left: Key, right: Key) {
            return left.exercisePrice === right.exercisePrice &&
                left.expiryDate === right.expiryDate &&
                left.litId === right.litId;
        }

        export function tryCreateFromJson(element: JsonElement) {
            const context = 'CallPut.Key.tryCreateFromJson';
            const exercisePrice = element.tryGetDecimal(Key.JsonTag_ExercisePrice, context);
            if (exercisePrice === undefined) {
                return 'Undefined ExercisePrice';
            } else {
                const expiryDate = element.tryGetDate(Key.JsonTag_ExpiryDate, context);
                if (expiryDate === undefined) {
                    return 'Undefined ExpiryDate';
                } else {
                    const litIdJson = element.tryGetString(Key.JsonTag_LitId, context);
                    if (litIdJson === undefined) {
                        return 'Undefined LitId';
                    } else {
                        const litId = MarketInfo.tryJsonValueToId(litIdJson);
                        if (litId === undefined) {
                            return `Unknown LitId: ${litIdJson}`;
                        } else {
                            return new Key(exercisePrice, expiryDate, litId);
                        }
                    }
                }
            }
        }
    }

    export function initialiseStatic() {
        Field.initialiseStaticField();
    }
}

export namespace CallPutModule {
    export function initialiseStatic() {
        CallPut.initialiseStatic();
    }
}
