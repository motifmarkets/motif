/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EnumInfoOutOfOrderError, Integer, JsonElement } from 'sys-internal-api';

export abstract class SettingsGroup {
    beginChangesEvent: SettingsGroup.BeginChangesEvent;
    endChangesEvent: SettingsGroup.EndChangesEvent;
    settingChangedEvent: SettingsGroup.SettingChangedEvent;

    private _upperName: string;

    constructor(private _typeId: SettingsGroup.Type.Id, private _name: string) {
        this._upperName = this._name.toUpperCase();
    }

    get name() { return this._name; }
    get upperName() { return this._upperName; }
    get typeId() { return this._typeId; }

    beginChanges() {
        this.beginChangesEvent();
    }

    endChanges() {
        this.endChangesEvent();
    }
    save(element: JsonElement) {
        element.setString(SettingsGroup.GroupJsonName.TypeId, SettingsGroup.Type.idToJsonValue(this._typeId));
        element.setString(SettingsGroup.GroupJsonName.Name, this.name);
    }

    protected notifySettingChanged(settingId: Integer) {
        this.settingChangedEvent(settingId);
    }

    abstract load(element: JsonElement | undefined): void;
}

export namespace SettingsGroup {
    export type BeginChangesEvent = (this: void) => void;
    export type EndChangesEvent = (this: void) => void;
    export type SettingChangedEvent = (this: void, settingId: Integer) => void;

    export const enum GroupJsonName {
        Name = 'groupName',
        TypeId = 'groupTypeId',
    }

    export function getNameAndType(element: JsonElement) {
        let result: NameAndTypeId;
        const name = element.tryGetString(GroupJsonName.Name, 'SGTC4343488');
        if (name === undefined) {
            result = {
                name: undefined,
                typeId: undefined,
                errorText: 'Settings group missing name',
            };
        } else {
            const jsonTypeId = element.tryGetString(GroupJsonName.TypeId, 'SGTC12011325');
            if (jsonTypeId === undefined) {
                result = {
                    name: undefined,
                    typeId: undefined,
                    errorText: `Settings group missing TypeId: ${name}`,
                };
            } else {
                const typeId = Type.tryJsonValueToId(jsonTypeId);
                if (typeId === undefined) {
                    result = {
                        name: undefined,
                        typeId: undefined,
                        errorText: `Settings group has unsupported TypeId: ${name}, ${jsonTypeId}`,
                    };
                } else {
                    result = {
                        name,
                        typeId,
                        errorText: undefined,
                    };
                }
            }
        }
        return result;
    }

    export interface NameAndTypeId {
        name: string | undefined;
        typeId: Type.Id | undefined;
        errorText: string | undefined;
    }

    export namespace Type {
        export const enum Id {
            TypedKeyValue,
            Color,
        }

        interface Info {
            readonly id: Id;
            readonly jsonValue: string;
        }

        type InfosObject = { [id in keyof typeof Id]: Info };

        const infosObject: InfosObject = {
            TypedKeyValue: {
                id: Id.TypedKeyValue,
                jsonValue: 'typedKeyValue',
            },
            Color: {
                id: Id.Color,
                jsonValue: 'color',
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('SettingsGroup', outOfOrderIdx, infos[outOfOrderIdx].jsonValue);
            }
        }

        export function idToName(id: Id) {
            return infos[id].jsonValue;
        }

        export function idToJsonValue(id: Id) {
            return infos[id].jsonValue;
        }

        export function tryJsonValueToId(jsonValue: string) {
            const foundInfo = infos.find((info) => info.jsonValue === jsonValue);
            return foundInfo?.id;
        }
    }
}

export namespace SettingsGroupModule {
    export function initialiseStatic() {
        SettingsGroup.Type.initialise();
    }
}
