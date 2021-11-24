/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness, ComparableList, Integer, JsonElement, Logger, UsableListChangeTypeId } from 'sys-internal-api';
import { LitIvemIdTableRecordDefinition, TableRecordDefinition, TableRecordDefinitionArray } from './table-record-definition';
import { TableRecordDefinitionList, UserTableRecordDefinitionList } from './table-record-definition-list';

export class GroupTableRecordDefinitionList extends UserTableRecordDefinitionList {
    private static _constructCount = 0;

    private static readonly definitionTypeId = TableRecordDefinition.TypeId.LitIvemId;
    private static readonly jsonTag_DefinitionKeys = 'Definitions';

    private _list = new ComparableList<LitIvemIdTableRecordDefinition>();

    constructor() {
        super(TableRecordDefinitionList.TypeId.Group);
        this.setName(GroupTableRecordDefinitionList.baseName +
            (++GroupTableRecordDefinitionList._constructCount).toString(10));
        this._changeDefinitionOrderAllowed = true;
    }

    finalise() {
        this.clear();
    }

    getDefinition(idx: Integer): TableRecordDefinition {
        return this._list.getItem(idx);
    }

    override loadFromJson(element: JsonElement) {
        super.loadFromJson(element);

        this._list.clear();

        const definitionElementArray = element.tryGetElementArray(GroupTableRecordDefinitionList.jsonTag_DefinitionKeys);

        if (definitionElementArray !== undefined && definitionElementArray.length > 0) {
            this._list.capacity = definitionElementArray.length;
            for (const definitionElement of definitionElementArray) {
                const definition = LitIvemIdTableRecordDefinition.tryCreateFromJson(definitionElement);
                if (definition === undefined) {
                    Logger.logError(`Could not create definition from JSON element: ${definitionElement}`, 100);
                } else {
                    const typeId = definition.typeId;
                    if (typeId !== GroupTableRecordDefinitionList.definitionTypeId) {
                        Logger.logError(`GroupWatchItemDefinitionList.loadFromJson: Incorrect definition type: ${typeId}`);
                    } else {
                        if (!TableRecordDefinition.hasLitIvemIdInterface(definition)) {
                            Logger.logError('GroupWatchItemDefinitionList.loadFromJson: Interface missing');
                        } else {
                            this._list.add(definition);
                        }
                    }
                }
            }
        }
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);

        const keyElementArray = new Array<JsonElement>(this._list.count);

        for (let i = 0; i < this._list.count; i++) {
            const definition = this._list.getItem(i);
            const definitionElement = new JsonElement();
            definition.saveKeyToJson(definitionElement);
            keyElementArray[i] = element;
        }

        element.setElementArray(GroupTableRecordDefinitionList.jsonTag_DefinitionKeys, keyElementArray);
    }

    override activate() {
        super.activate();

        // currently list can never go bad
        const newCount = this._list.count;
        if (newCount > 0) {
            this.notifyListChange(UsableListChangeTypeId.PreUsableAdd, 0, newCount);
        }
        this.setUsable(Badness.notBad);
        this.notifyListChange(UsableListChangeTypeId.Usable, 0, 0);
    }

    override clear() {
        this.notifyListChange(UsableListChangeTypeId.Clear, 0, this._list.count - 1);
        this._list.clear();
        this.notifyModified();
    }

    override canAddArray(value: TableRecordDefinitionArray): boolean {
        // can add if any of value are not in list
        for (const definition of value) {
            if (TableRecordDefinition.hasLitIvemIdInterface(definition) && this.find(definition) === undefined) {
                return true;
            }
        }

        return false;
    }

    override addArray(value: TableRecordDefinitionArray): TableRecordDefinitionList.AddArrayResult {
        const addArray = new Array<LitIvemIdTableRecordDefinition>(value.length);
        let addCount = 0;
        for (const definition of value) {
            if (TableRecordDefinition.hasLitIvemIdInterface(definition)) {
                if (this.find(definition) === undefined) {
                    addArray[addCount++] = definition;
                }
            }
        }
        addArray.length = addCount;

        if (addCount === 0) {
            return {
                index: -1,
                count: 0
            };
        } else {
            const addIndex = this._list.count;
            this._list.addRange(addArray);

            this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, addIndex, addCount);
            this.notifyModified();

            return {
                index: addIndex,
                count: addCount
            };
        }
    }

    override setDefinition(idx: Integer, value: TableRecordDefinition) {
        if (!TableRecordDefinition.hasLitIvemIdInterface(value)) {
            throw new TypeError(`GroupWatchItemDefinitionList.setDefinition: Incompatible Interface: ${value.typeId}`);
        } else {
            this.notifyBeforeRecDefinitionChange(idx);
            this._list.setItem(idx, value);
            this.notifyAfterRecDefinitionChange(idx);
        }
    }

    override delete(idx: Integer) {
        this.checkUsableNotifyListChange(UsableListChangeTypeId.Remove, idx, 1);
        this._list.removeAtIndex(idx);
        this.notifyModified();
    }

    protected getCount(): Integer {
        return this._list.count;
    }

    protected getCapacity() {
        return this._list.capacity;
    }

    protected setCapacity(value: Integer) {
        this._list.capacity = value;
    }

    protected override getAddDeleteDefinitionsAllowed(): boolean {
        return this.requestIsGroupSaveEnabled();
    }
}

export namespace GroupTableRecordDefinitionList {

    export function createFromRecordDefinitionList(list: TableRecordDefinitionList): GroupTableRecordDefinitionList {
        const result = new GroupTableRecordDefinitionList();
        result.capacity = list.count;

        for (let I = 0; I < list.count; I++) {
            const srcDefinition = list.getDefinition(I);
            if (TableRecordDefinition.hasLitIvemIdInterface(srcDefinition)) {
                result.add(srcDefinition.createCopy());
            }
        }

        result.capacity = result.count;

        return result;
    }
}

export namespace GroupTableRecordDefinitionList {
    export const baseName = 'Group';
}
