/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridLayout } from '@motifmarkets/revgrid';
import { AssertInternalError, Guid, Integer, JsonElement, UsableListChangeTypeId } from 'src/sys/internal-api';
import { TableFieldList } from './table-field-list';
import { TableRecordDefinition } from './table-record-definition';
import { TableRecordDefinitionList } from './table-record-definition-list';
import { tableRecordDefinitionListDirectory } from './table-record-definition-list-directory';
import { TableValueList } from './table-value-list';

export abstract class TableDefinition {
    private _fieldList = new TableFieldList();
    private _defaultLayout = new GridLayout();

    // holds either private or directory TableRecordDefinitionList
    private _recordDefinitionList: TableRecordDefinitionList;
    // specifies that TableDefinition uses a directory TableRecordDefinitionList
    private _recordDefinitionListDirectoryId: Guid | undefined;
    private _recordDefinitionListDirectoryLocked = false;
    private _recordDefinitionListDirectoryOpened = false;
    private _recordDefinitionListOpener: TableRecordDefinitionList.Opener;
    private _opened = false;

    protected get recordDefinitionList() { return this._recordDefinitionList; }
    get opened() { return this._opened; }
    get fieldList() { return this._fieldList; }

    constructor(recordDefinitionListOrId: TableRecordDefinitionList | Guid) {
        if (recordDefinitionListOrId instanceof TableRecordDefinitionList) {
            this._recordDefinitionList = recordDefinitionListOrId;
        } else {
            this._recordDefinitionListDirectoryId = recordDefinitionListOrId;
        }
        this._recordDefinitionListOpener = new TableRecordDefinitionList.Opener('Unnamed');
    }

    createDefaultLayout() {
        return this._defaultLayout.createCopy();
    }

    hasPrivateRecordDefinitionList() { return this._recordDefinitionListDirectoryId === undefined; }

    lockRecordDefinitionList(locker: TableRecordDefinitionList.ILocker): TableRecordDefinitionList {
        if (this._recordDefinitionList === undefined && this._recordDefinitionListDirectoryId !== undefined) {
            const idx = tableRecordDefinitionListDirectory.lockId(this._recordDefinitionListDirectoryId, locker);
            if (idx === undefined) {
                throw new AssertInternalError('TSCCLI23239', this._recordDefinitionListDirectoryId);
            } else {
                this._recordDefinitionList = tableRecordDefinitionListDirectory.getList(idx);
                this._recordDefinitionListDirectoryLocked = true;
            }
        }

        if (this._recordDefinitionList === undefined) {
            throw new AssertInternalError('TSCCLR34449');
        } else {
            return this._recordDefinitionList;
        }
    }

    unlockRecordDefinitionList(locker: TableRecordDefinitionList.ILocker) {
        if (this._recordDefinitionList !== undefined && this._recordDefinitionListDirectoryLocked) {
            tableRecordDefinitionListDirectory.unlockList(this._recordDefinitionList, locker);
            this._recordDefinitionListDirectoryLocked = false;
            this._recordDefinitionListDirectoryId = undefined;
        }
    }

    open() {
        if (this._recordDefinitionList === undefined) {
            throw new AssertInternalError('TSO23857');
        } else {
            if (this._opened) {
                throw new AssertInternalError('TSA998437');
            } else {
                this.activate();

                // this._recordDefinitionListOpener = opener; // needs to be fixed when implementing watchlist
                this._opened = true;

                if (this._recordDefinitionListDirectoryId === undefined) {
                    this._recordDefinitionList.activate();
                } else {
                    if (this._recordDefinitionListDirectoryOpened) {
                        throw new AssertInternalError('TSA331751');
                    } else {
                        tableRecordDefinitionListDirectory.openId(this._recordDefinitionListDirectoryId, this._recordDefinitionListOpener);
                        this._recordDefinitionListDirectoryOpened = true;
                    }
                }
            }
        }
    }

    checkClose() {
        if (this._opened) {
            if (this._recordDefinitionListDirectoryId === undefined) {
                this._recordDefinitionList.deactivate();
            } else {
                if (this._recordDefinitionListDirectoryOpened) {
                    const idx = tableRecordDefinitionListDirectory.indexOfList(this._recordDefinitionList);
                    if (idx === -1) {
                        throw new AssertInternalError('TSC99957', `${idx}`);
                    } else {
                        tableRecordDefinitionListDirectory.closeEntry(idx, this._recordDefinitionListOpener);
                    }
                    this._recordDefinitionListDirectoryOpened = false;
                }
            }

            this.deactivate();

            this._opened = false;
        }
    }

    checkCloseAndUnlockRecordDefinitionList(locker: TableRecordDefinitionList.ILocker) {
        this.checkClose();
        this.unlockRecordDefinitionList(locker);
    }

    loadFromJson(element: JsonElement) {
        // do not load recordDefinitionList. Done when source created

        const fieldListElement = element.tryGetElement(TableDefinition.jsonTag_FieldList, 'TableDefinition.loadFromJson: FieldList');
        if (fieldListElement === undefined) {
            this._fieldList = TableFieldList.createEmpty(); // won't show any columns but also will not crash
        } else {
            const list = new TableFieldList();
        }
    }

    saveToJson(element: JsonElement) {
        const fieldListElement = element.newElement(TableDefinition.jsonTag_FieldList);
        this.fieldList.saveToJson(fieldListElement);

        if (this._recordDefinitionList === undefined) {
            throw new AssertInternalError('TSSTJ77559');
        } else {
            if (this.hasPrivateRecordDefinitionList()) {
                const privateRecordDefinitionListElement = element.newElement(TableDefinition.jsonTag_PrivateTableRecordDefinitionList);
                this._recordDefinitionList.saveToJson(privateRecordDefinitionListElement);
            } else {
                element.setGuid(TableDefinition.jsonTag_TableRecordDefinitionListId, this._recordDefinitionList.id);
                element.setString(TableDefinition.jsonTag_TableRecordDefinitionListName, this._recordDefinitionList.name);
                element.setString(TableDefinition.jsonTag_TableRecordDefinitionListType,
                    TableRecordDefinitionList.Type.idToJson(this._recordDefinitionList.typeId));
            }
        }
    }

    protected addFieldToDefaultLayout(fieldName: string, visible: boolean) {
        this._defaultLayout.AddField(fieldName, visible);
    }

    protected addMissingFieldsToDefaultLayout(visible: boolean) {
        this._fieldList.addMissingFieldsToLayout(this._defaultLayout, visible);
    }

    protected activate() {
        // available for override
    }

    protected deactivate() {
        // available for override
    }

    abstract createTableValueList(tableRecordDefinition: TableRecordDefinition): TableValueList;
}

export namespace TableDefinition {
    export type BeginAllValuesChangingEventHandler = (this: void) => void;
    export type EndAllValuesChangingEventHandler = (this: void) => void;
    export type ListChangeEvent = (listChangeTypeId: UsableListChangeTypeId, itemIdx: Integer, itemCount: Integer) => void;
    export type AfterRecDefinitionChangeEvent = (recIdx: Integer, recCount: Integer) => void;

    export const jsonTag_FieldList = 'FieldList';
    export const jsonTag_TableRecordDefinitionListId = 'RecordDefinitionListId';
    export const jsonTag_TableRecordDefinitionListName = 'RecordDefinitionListName';
    export const jsonTag_TableRecordDefinitionListType = 'RecordDefinitionListTypeName';
    export const jsonTag_PrivateTableRecordDefinitionList = 'PrivateTableRecordDefinitionList';
}
