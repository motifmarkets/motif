/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness, ComparableList, Integer, InternalError, JsonElement, Logger, UsableListChangeTypeId } from 'src/sys/internal-api';
import { LitIvemIdTableRecordDefinition, TableRecordDefinition, TableRecordDefinitionArray } from './table-record-definition';
import { TableRecordDefinitionList, UserTableRecordDefinitionList } from './table-record-definition-list';

export class PortfolioTableRecordDefinitionList extends UserTableRecordDefinitionList {
    private static _constructCount = 0;

    private static readonly definitionTypeId = TableRecordDefinition.TypeId.LitIvemId;
    private static readonly jsonTag_DefinitionKeys = 'definitionKeys';

    private _list = new ComparableList<LitIvemIdTableRecordDefinition>();

    constructor() {
        super(TableRecordDefinitionList.TypeId.Portfolio);
        this.setName(PortfolioTableRecordDefinitionList.baseName +
            (++PortfolioTableRecordDefinitionList._constructCount).toString(10));
        this._changeDefinitionOrderAllowed = true;
    }

    finalise() {
        this.clear();
    }

    getDefinition(idx: Integer): TableRecordDefinition {
        return this._list.getItem(idx);
    }

    getLitIvemIdDefinition(idx: Integer): LitIvemIdTableRecordDefinition {
        return this._list.getItem(idx);
    }

    override loadFromJson(element: JsonElement) {
        super.loadFromJson(element);

        this._list.clear();

        const definitionElementArray = element.tryGetElementArray(PortfolioTableRecordDefinitionList.jsonTag_DefinitionKeys);

        if (definitionElementArray !== undefined && definitionElementArray.length > 0) {
            this._list.capacity = definitionElementArray.length;
            for (const definitionElement of definitionElementArray) {
                const definition = LitIvemIdTableRecordDefinition.tryCreateFromJson(definitionElement);
                if (definition === undefined) {
                    Logger.logError('LitIvemIdTableRecordDefinitionList.loadFromJson: ' +
                        `Could not create definition from JSON element: ${definitionElement}`, 100);
                } else {
                    const typeId = definition.typeId;
                    if (typeId !== PortfolioTableRecordDefinitionList.definitionTypeId) {
                        Logger.logError(`LitIvemIdTableRecordDefinitionList.loadFromJson: Incorrect definition type: ${typeId}`);
                    } else {
                        if (!TableRecordDefinition.hasLitIvemIdInterface(definition)) {
                            Logger.logError('LitIvemIdTableRecordDefinitionList.loadFromJson: Interface missing');
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
            const keyElement = new JsonElement();
            definition.saveKeyToJson(keyElement);
            keyElementArray[i] = keyElement;
        }

        element.setElementArray(PortfolioTableRecordDefinitionList.jsonTag_DefinitionKeys, keyElementArray);
    }

    override activate() {
        super.activate();

        // list can never go bad
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
            if (this.find(definition) === undefined) {
                if (TableRecordDefinition.hasLitIvemIdInterface(definition)) {
                    return true;
                }
            }
        }

        return false;
    }

    override addArray(value: TableRecordDefinitionArray): TableRecordDefinitionList.AddArrayResult {
        const addArray = new Array<LitIvemIdTableRecordDefinition>(value.length);
        let addCount = 0;
        for (const definition of value) {
            if (this.find(definition) === undefined) {
                if (TableRecordDefinition.hasLitIvemIdInterface(definition)) {
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
            throw new InternalError('PWIDLSDII', `${value.typeId}`);
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

    protected getCount() { return this._list.count; }
    protected getCapacity() { return this._list.capacity; }
    protected setCapacity(value: Integer) { this._list.capacity = value; }

    protected override getAddDeleteDefinitionsAllowed(): boolean {
        return true;
    }

    protected override processUsableChanged() {
        if (this.usable) {
            this.notifyListChange(UsableListChangeTypeId.PreUsableClear, 0, 0);
            const count = this.count;
            if (count > 0) {
                this.notifyListChange(UsableListChangeTypeId.PreUsableAdd, 0, count);
            }
            this.notifyListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.notifyListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }
}

export namespace PortfolioTableRecordDefinitionList {
    export const baseName = 'LitIvemId';

    export function createFromRecordDefinitionList(list: TableRecordDefinitionList): PortfolioTableRecordDefinitionList {
        const result = new PortfolioTableRecordDefinitionList();
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
