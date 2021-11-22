/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from 'src/res/internal-api';
import { EnumInfoOutOfOrderError, Integer, JsonElement, MapKey, MultiEvent } from 'src/sys/internal-api';
import { FieldDataTypeId } from './data-types';

export class TopShareholder {
    name?: string;
    designation?: string;
    holderKey?: string;
    sharesHeld?: Integer;
    totalShareIssue?: Integer;
    sharesChanged?: Integer;

    private _changedMultiEvent = new MultiEvent<TopShareholder.ChangedEventHandler>();

    update(other: TopShareholder): void {
        const changedFieldIds = new Array<TopShareholder.FieldId>(TopShareholder.Field.count);
        let changedIdx = 0;

        if (other.name !== this.name) {
            this.name = other.name;
            changedFieldIds[changedIdx++] = TopShareholder.FieldId.Name;
        }

        if (other.designation !== this.designation) {
            this.designation = other.designation;
            changedFieldIds[changedIdx++] = TopShareholder.FieldId.Designation;
        }

        if (other.holderKey !== this.holderKey) {
            this.holderKey = other.holderKey;
            changedFieldIds[changedIdx++] = TopShareholder.FieldId.HolderKey;
        }

        if (other.sharesHeld !== this.sharesHeld) {
            this.sharesHeld = other.sharesHeld;
            changedFieldIds[changedIdx++] = TopShareholder.FieldId.SharesHeld;
        }

        if (other.totalShareIssue !== this.totalShareIssue) {
            this.totalShareIssue = other.totalShareIssue;
            changedFieldIds[changedIdx++] = TopShareholder.FieldId.TotalShareIssue;
        }

        if (other.sharesChanged !== this.sharesChanged) {
            this.sharesChanged = other.sharesChanged;
            changedFieldIds[changedIdx++] = TopShareholder.FieldId.SharesChanged;
        }

        if (changedIdx >= 0) {
            changedFieldIds.length = changedIdx;
            this.notifyChanged(changedFieldIds);
        }
    }

    createKey(): TopShareholder.Key {
        return new TopShareholder.Key(this.holderKey, this.name);
    }

    matchesKey(key: TopShareholder.Key): boolean {
        return key.holderKey === this.holderKey &&
            key.name === this.name;
    }

    generateMapKey(): MapKey {
        return TopShareholder.Key.toString(this.holderKey, this.name);
    }

    subscribeChangedEvent(handler: TopShareholder.ChangedEventHandler): MultiEvent.DefinedSubscriptionId {
        return this._changedMultiEvent.subscribe(handler);
    }

    unsubscribeChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._changedMultiEvent.unsubscribe(subscriptionId);
    }

    private notifyChanged(changedFieldIds: TopShareholder.FieldId[]) {
        const handlers = this._changedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](changedFieldIds);
        }
    }
}

export namespace TopShareholder {
    export type ChangedEventHandler = (changedFieldIds: TopShareholder.FieldId[]) => void;

    export const enum FieldId {
        Name,
        Designation,
        HolderKey,
        SharesHeld,
        TotalShareIssue,
        SharesChanged,
    }

    export namespace Field {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export type Id = TopShareholder.FieldId;
        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly dataTypeId: FieldDataTypeId;
            readonly displayId: StringId;
            readonly headingId: StringId;
        }

        type InfoObject = { [id in keyof typeof FieldId]: Info };

        const infoObject: InfoObject = {
            Name: {
                id: FieldId.Name,
                name: 'Name',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.TopShareholderFieldDisplay_Name,
                headingId: StringId.TopShareholderFieldHeading_Name,
            },
            Designation: {
                id: FieldId.Designation,
                name: 'Designation',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.TopShareholderFieldDisplay_Designation,
                headingId: StringId.TopShareholderFieldHeading_Designation,
            },
            HolderKey: {
                id: FieldId.HolderKey,
                name: 'HolderKey',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.TopShareholderFieldDisplay_HolderKey,
                headingId: StringId.TopShareholderFieldHeading_HolderKey,
            },
            SharesHeld: {
                id: FieldId.SharesHeld,
                name: 'SharesHeld',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.TopShareholderFieldDisplay_SharesHeld,
                headingId: StringId.TopShareholderFieldHeading_SharesHeld,
            },
            TotalShareIssue: {
                id: FieldId.TotalShareIssue,
                name: 'TotalShareIssue',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.TopShareholderFieldDisplay_TotalShareIssue,
                headingId: StringId.TopShareholderFieldHeading_TotalShareIssue,
            },
            SharesChanged: {
                id: FieldId.SharesChanged,
                name: 'SharesChanged',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.TopShareholderFieldDisplay_SharesChanged,
                headingId: StringId.TopShareholderFieldHeading_SharesChanged,
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
                throw new EnumInfoOutOfOrderError('OIODIFIS3885', outOfOrderIdx, infos[outOfOrderIdx].name);
            }
        }
    }

    export class Key {
        static readonly JsonTag_HolderKey = 'holderKey';
        static readonly JsonTag_Name = 'name';

        private _mapKey: MapKey;

        constructor(public holderKey?: string, public name?: string) { }

        get mapKey() {
            if (this._mapKey === undefined) {
                this._mapKey = Key.toString(this.holderKey, this.name);
            }
            return this._mapKey;
        }

        static createNull() {
            // will not match any valid holding
            return new Key(undefined, undefined);
        }

        assign(other: Key) {
            this.holderKey = other.holderKey;
            this.name = other.name;
        }

        saveToJson(element: JsonElement) {
            if (this.holderKey !== undefined) {
                element.setString(Key.JsonTag_HolderKey, this.holderKey);
            }
            if (this.name !== undefined) {
                element.setString(Key.JsonTag_Name, this.name);
            }
        }
    }

    export namespace Key {
        export function toString(holderKey?: string, name?: string): string {
            if (holderKey === undefined) {
                holderKey = '!)';
            }
            if (name === undefined) {
                name = '(!';
            }
            return `${holderKey}|${name}`;
        }

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function isEqual(left: Key, right: Key) {
            if (left.holderKey !== undefined || right.holderKey !== undefined) {
                return left.holderKey === right.holderKey;
            } else {
                if (left.name !== undefined && right.name !== undefined) {
                    return left.name === right.name;
                } else {
                    return false;
                }
            }
        }

        export function tryCreateFromJson(element: JsonElement) {
            const holderKey = element.tryGetString(Key.JsonTag_HolderKey);
            const name = element.tryGetString(Key.JsonTag_Name);
            return new Key(holderKey, name);
        }
    }

    export function isSame(left: TopShareholder, right: TopShareholder) {
        return Key.isEqual(left.createKey(), right.createKey());
    }
}
