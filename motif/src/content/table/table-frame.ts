/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    assert,
    AssertInternalError,
    Badness,
    GridLayout,
    GridLayoutRecordStore,
    Guid,
    Integer,
    JsonElement,
    Logger,
    MultiEvent,
    OpenedTable,
    SettingsService,
    StringBuilder,
    StringId,
    Strings,
    Table,
    TableDefinition,
    tableDefinitionFactory,
    TableDirectory,
    tableDirectory,
    TableRecordDefinition,
    TableRecordDefinitionList,
    tableRecordDefinitionListDirectory,
    UnexpectedUndefinedError
} from '@motifmarkets/motif-core';
import { RecordGrid } from 'content-internal-api';
import { RevRecordIndex, RevRecordInvalidatedValue, RevRecordStore } from 'revgrid';
import { ContentFrame } from '../content-frame';

export class TableFrame extends ContentFrame implements RevRecordStore, TableDirectory.Locker, TableDirectory.Opener {
    fieldsEventers: RevRecordStore.FieldsEventers;
    _recordsEventers: RevRecordStore.RecordsEventers;

    dragDropAllowed: boolean;

    settingsApplyEvent: TableFrame.SettingsApplyEvent;
    recordFocusEvent: TableFrame.RecordFocusEvent;
    gridClickEvent: TableFrame.GridClickEvent;
    gridDblClickEvent: TableFrame.GridDblClickEvent;
    requireDefaultTableDefinitionEvent: TableFrame.RequireDefaultTableDefinitionEvent;
    tableOpenEvent: TableFrame.TableOpenEvent;
    // tableOpenChangeEvent: TableFrame.TableOpenChangeEvent;

    private _grid: RecordGrid;
    private _gridPrepared = false;

    private _table: Table | undefined;
    private _privateTable: OpenedTable | undefined;
    private _privateNameSuffixId: TableFrame.PrivateNameSuffixId | undefined;
    private _keptLayout: GridLayout | undefined;

    private _autoSizeAllColumnWidthsOnFirstUsable: boolean;

    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private readonly _componentAccess: TableFrame.ComponentAccess, private readonly _settingsService: SettingsService) {
        super();
    }

    get gridRowHeight() { return this._grid.rowHeight; }
    get gridHorizontalScrollbarMarginedHeight() { return this._componentAccess.gridHorizontalScrollbarMarginedHeight; }

    // ILocker members

    get lockerName(): string {
        if (this._table === undefined) {
            throw new AssertInternalError('TFGLNT20095');
        } else {
            return this._componentAccess.id + ':' + this._table.name;
        }
    }

    // get standardFieldListId(): TableFieldList.StandardId { return this._standardFieldListId; }
    // set standardFieldListId(value: TableFieldList.StandardId) { this._standardFieldListId = value; }
    get table(): Table | undefined { return this._table; }
    get recordCount(): Integer { return this._table === undefined ? 0 : this._table.recordCount; }
    get tableOpened(): boolean { return this._table !== undefined; }

    override finalise() {
        if (!this.finalised) {
            this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
            this.closeTable(false);
            super.finalise();
        }
    }

    setFieldEventers(fieldsEventers: RevRecordStore.FieldsEventers): void {
        this.fieldsEventers = fieldsEventers;
    }

    setRecordEventers(recordsEventers: RevRecordStore.RecordsEventers): void {
        this._recordsEventers = recordsEventers;
    }

    setFlexBasis(value: number) {
        this._componentAccess.setStyleFlexBasis(value);
    }

    getHeaderPlusFixedLineHeight() {
        return this._grid.getHeaderPlusFixedLineHeight();
    }

    // grid functions used by Component

    setGrid(value: RecordGrid) {
        this._grid = value;
        this._grid.recordFocusEventer = (newRecordIndex, oldRecordIndex) => this.handleRecordFocusEvent(newRecordIndex, oldRecordIndex);
        this._grid.mainClickEventer = (fieldIndex, recordIndex) => this.handleGridClickEvent(fieldIndex, recordIndex);
        this._grid.mainDblClickEventer = (fieldIndex, recordIndex) => this.handleGridDblClickEvent(fieldIndex, recordIndex);

        this._settingsChangedSubscriptionId =
            this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingChangedEvent());

        this.applySettings();
    }

    // GridDataStore members

    getRecord(index: RevRecordIndex) {
        if (this._table === undefined) {
            throw new UnexpectedUndefinedError('TFGRV882455', `${index}`);
        } else {
            return this._table.getRecord(index);
        }
    }

    getRecords() {
        if (this._table === undefined) {
            return [];
        } else {
            return this._table.records;
        }
    }

    // BaseDirectory.Entry.ISubscriber members

    subscriberInterfaceDescriminator() {
        // no code
    }

    // IOpener members
    isTableGrid(): boolean {
        return true;
    }

    loadLayoutConfig(element: JsonElement | undefined) {
        this._recordsEventers.beginChange();
        try {
            this.closeTable(false);

            if (element === undefined) {
                this.tryNewDefaultPrivateTable();
            } else {
                const privateElement = element.tryGetElement(TableFrame.JsonName.privateTable);
                if (privateElement !== undefined) {
                    this.createPrivateTable();
                    if (this._table !== undefined) {
                        const success = this._table.loadFromJson(privateElement);
                        if (!success) {
                            this.closeTable(false);
                            this.tryNewDefaultPrivateTable();
                        } else {
                            this._privateNameSuffixId = privateElement.tryGetInteger(TableFrame.JsonName.privateNameSuffixId);
                            if (this._privateNameSuffixId !== undefined) {
                                TableFrame.addlayoutConfigLoadedNewPrivateNameSuffixId(this._privateNameSuffixId);
                            }
                            this.activate(-1);
                        }
                    }
                } else {
                    const loadedTableId = element.tryGetGuid(TableFrame.JsonName.tableId, 'TableFrame.loadLayoutConfigId');
                    if (loadedTableId === undefined) {
                        this.tryNewDefaultPrivateTable();
                    } else {
                        const tableDirIdx = tableDirectory.indexOfId(loadedTableId);
                        if (tableDirIdx < 0) {
                            this.tryNewDefaultPrivateTable();
                        } else {
                            this._table = tableDirectory.lock(tableDirIdx, this);
                            this.activate(-1);
                        }
                    }
                }
            }

        } finally {
            this._recordsEventers.endChange();
        }
    }

    saveLayoutConfig(element: JsonElement) {
        if (this._table !== undefined) {
            if (!this.isPrivate()) {
                element.setGuid(TableFrame.JsonName.tableId, this._table.id);
            } else {
                const layout = this._grid.saveLayout();
                this._table.layout = layout;
                const privateTableElement = element.newElement(TableFrame.JsonName.privateTable);
                this._table.saveToJson(privateTableElement);
                element.setInteger(TableFrame.JsonName.privateNameSuffixId, this._privateNameSuffixId);
            }
        }
    }

    handleRecordFocusEvent(newRecordIndex: Integer | undefined, oldRecordIndex: Integer | undefined) {
        if (this.recordFocusEvent !== undefined) {
            this.recordFocusEvent(newRecordIndex, oldRecordIndex);
        }
    }

    handleGridClickEvent(fieldIndex: Integer, recordIndex: Integer) {
        if (this.gridClickEvent !== undefined) {
            this.gridClickEvent(fieldIndex, recordIndex);
        }
    }

    handleGridDblClickEvent(fieldIndex: Integer, recordIndex: Integer) {
        if (this.gridDblClickEvent !== undefined) {
            this.gridDblClickEvent(fieldIndex, recordIndex);
        }
    }

    notifyTableOpen(recordDefinitionList: TableRecordDefinitionList) {
        if (this._table === undefined) {
            throw new AssertInternalError('TFNTO533955482');
        } else {
            this._componentAccess.hideBadnessWithVisibleDelay(this._table.badness);
        }
        if (this.tableOpenEvent !== undefined) {
            this.tableOpenEvent(recordDefinitionList);
        }
    }

    notifyTableOpenChange(opened: boolean) {
    //     if (this.tableOpenChangeEvent !== undefined) {
    //         this.tableOpenChangeEvent(opened);
    //     }
    }

    notifyTableBadnessChange() {
        if (this._table === undefined) {
            throw new AssertInternalError('TFHDIBCE1994448333');
        } else {
            this._componentAccess.setBadness(this._table.badness);
        }
    }

    notifyTableRecordsLoaded() {
        this._recordsEventers.recordsLoaded();
    }

    notifyTableRecordsInserted(index: Integer, count: Integer) {
        this._recordsEventers.recordsInserted(index, count);
    }

    notifyTableRecordsDeleted(index: Integer, count: Integer) {
        this._recordsEventers.recordsDeleted(index, count);
    }

    notifyTableAllRecordsDeleted() {
        this._recordsEventers.allRecordsDeleted();
    }

    // notifyTableRecordListChange(listChangeTypeId: UsableListChangeTypeId, itemIdx: Integer, changeCount: Integer) {
    //     switch (listChangeTypeId) {
    //         case UsableListChangeTypeId.Unusable:
    //             // handled through badness change
    //             break;
    //         case UsableListChangeTypeId.PreUsableClear:
    //             this._recordsEventers.allRecordsDeleted();
    //             break;
    //         case UsableListChangeTypeId.PreUsableAdd:
    //             if (this._table === undefined) {
    //                 throw new AssertInternalError('TFNTRLCA388590');
    //             } else {
    //                 // if (this._table.changeRecordDefinitionOrderAllowed) {
    //                     this._recordsEventers.recordsInserted(itemIdx, changeCount);
    //                 // } else {
    //                 //     this._componentAccess.gridInsertRecordsInSameRowPosition(itemIdx, changeCount); // probably not required
    //                 // }
    //             }
    //             break;
    //         case UsableListChangeTypeId.Usable:
    //             // handled through badness change
    //             break;
    //         case UsableListChangeTypeId.Insert:
    //             if (this._table === undefined) {
    //                 throw new AssertInternalError('TFNTRLCI388590');
    //             } else {
    //                 // if (this._table.changeRecordDefinitionOrderAllowed) {
    //                     this._recordsEventers.recordsInserted(itemIdx, changeCount);
    //                 // } else {
    //                 //     this._componentAccess.gridInsertRecordsInSameRowPosition(itemIdx, changeCount); // probably not required
    //                 // }
    //             }
    //             break;
    //         case UsableListChangeTypeId.Remove:
    //             this._recordsEventers.recordsDeleted(itemIdx, changeCount);
    //             break;
    //         case UsableListChangeTypeId.Clear:
    //             this._recordsEventers.allRecordsDeleted();
    //             break;
    //         default:
    //             throw new UnreachableCaseError('TFNTRLC2323597', listChangeTypeId);
    //     }
    // }

    notifyTableRecordValuesChanged(recordIdx: Integer, invalidatedValues: RevRecordInvalidatedValue[]) {
        // TODO:MED There is a possible bug somewhere. This method is being called with a fieldIdx value greater
        // then the number of fields. The problem manifests when the table-frame is used via the PariDepth component.
        const fieldCount = this._table !== undefined ? this._table.fieldList.fieldCount : -1;
        if (recordIdx < this.recordCount) {
            this._recordsEventers.invalidateRecordValues(recordIdx, invalidatedValues);
        } else {
            throw new AssertInternalError('TFTFNTVC22944',
                `Record: "${recordIdx}", FieldCount: ${fieldCount}, RecordCount: ${this.recordCount}`);
        }
    }

    notifyTableRecordFieldsChanged(recordIdx: Integer, fieldIndex: number, fieldCount: number) {
        // TODO:MED There is a possible bug somewhere. This method is being called with a fieldIdx value greater
        // then the number of fields. The problem manifests when the table-frame is used via the PariDepth component.
        const tableFieldCount = this._table !== undefined ? this._table.fieldList.fieldCount : -1;
        if (fieldIndex + fieldCount <= tableFieldCount && recordIdx < this.recordCount) {
            this._recordsEventers.invalidateRecordFields(recordIdx, fieldIndex, fieldCount);
        } else {
            throw new AssertInternalError('TFTFNTVC22944',
                `Field: ${fieldIndex}, Record: "${recordIdx}", FieldCount: ${fieldCount}, RecordCount: ${this.recordCount}`);
        }
    }

    notifyTableRecordChanged(recordIdx: Integer) {
        // TODO:MED There is a possible bug somewhere. This method is being called with a fieldIdx value greater
        // then the number of fields. The problem manifests when the table-frame is used via the PariDepth component.
        const fieldCount = this._table !== undefined ? this._table.fieldList.fieldCount : -1;
        if (recordIdx < this.recordCount) {
            this._recordsEventers.invalidateRecord(recordIdx);
        } else {
            throw new AssertInternalError('TFTFNTRC4422944',
                `Record: "${recordIdx}", FieldCount: ${fieldCount}, RecordCount: ${this.recordCount}`);
        }
    }

    notifyTableLayoutUpdated() {
        if (this._table === undefined) {
            throw new AssertInternalError('TFTFNTLU48571');
        } else {
            this._grid.loadLayout(this._table.layout);
        }
    }

    notifyTableRecordDisplayOrderChanged(itemIndices: Integer[]) {
        this._grid.reorderRecRows(itemIndices);
    }

    notifyTableFirstPreUsable() {
        // this is not fully implemented
        if (this._autoSizeAllColumnWidthsOnFirstUsable) {
            this.checkAutoSizeAllColumnWidthsOnFirstUsable();
        }
    }

    getFocusedRecordIndex() {
        return this._grid.focusedRecordIndex;
    }

    getOrderedGridRecIndices(): Integer[] {
        return this._grid.rowRecIndices;
    }

    // end IOpener members

    // getGridFields(): TableGridField[] {
    //     if (this._table === undefined) {
    //         throw new PulseError('WatchlistFrame.getGridFields: undefined watchlist');
    //     } else {
    //         return this._table.getGridFieldsAndInitialStates();
    //     }
    // }

    findRecordDefinition(definition: TableRecordDefinition): Integer | undefined {
        if (this._table === undefined) {
            return undefined;
        } else {
            return this._table.findRecord(definition);
        }
    }

    focusItem(itemIdx: Integer) {
        this._grid.focusedRecordIndex = itemIdx;
    }

    clearRecordDefinitions() {
        if (this._table === undefined) {
            throw new AssertInternalError('TFCRD599995877');
        } else {
            if (this._table.addDeleteRecordDefinitionsAllowed) {
                this._table.clearRecordDefinitions();
            }
        }
    }

    canAddRecordDefinition(definition: TableRecordDefinition): boolean {
        if (this._table === undefined) {
            return false;
        } else {
            return this._table.canAddRecordDefinition(definition);
        }
    }

    addRecordDefinition(definition: TableRecordDefinition) {
        if (this._table === undefined) {
            Logger.assertError('addItemDefinition undefined');
        } else {
            if (this._table.addDeleteRecordDefinitionsAllowed) {
                this._table.addRecordDefinition(definition);
            }
        }
    }

    setRecordDefinition(idx: Integer, value: TableRecordDefinition) {
        if (this._table === undefined) {
            Logger.assertError('setRecordDefinition undefined');
        } else {
            if (this._table.addDeleteRecordDefinitionsAllowed) {
                this._table.setRecordDefinition(idx, value);
            }
        }
    }

    deleteFocusedRecord() {
        const itemIdx = this._grid.focusedRecordIndex;
        if (itemIdx !== undefined && itemIdx >= 0 && this._table !== undefined) {
            this._recordsEventers.beginChange();
            try {
                this._table.deleteRecord(itemIdx);
            } finally {
                this._recordsEventers.endChange();
            }
        }
    }

    canDeleteFocusedRecord() {
        return this._table !== undefined &&
            this._table.addDeleteRecordDefinitionsAllowed &&
            this._grid.focusedRecordIndex !== undefined;
    }

    newPrivateTable(tableDefinition: TableDefinition, keepCurrentLayout: boolean) {

        this._recordsEventers.beginChange();
        try {
            if (this.table !== undefined) {
                this.closeTable(keepCurrentLayout);
            }

            this.createPrivateTable();

            if (this.table !== undefined) {
                this.table.setDefinition(tableDefinition);
                const { name, suffixId } = this.calculateNewPrivateName();
                this.table.name = name;
                this._privateNameSuffixId = suffixId;

                if (this._keptLayout !== undefined) {
                    this.table.layout = this._keptLayout;
                } else {
                    this.table.layout = this.table.createDefaultLayout();
                }

                // this.table.newPrivateRecordDefinitionList();
                this.activate(-1);

                if (!keepCurrentLayout) {
                    this.checkAutoSizeAllColumnWidthsOnFirstUsable();
                }
            }
        } finally {
            this._recordsEventers.endChange();
        }
    }

    openTableById(id: Guid): boolean {
        const idx = tableDirectory.indexOfId(id);

        if (idx < 0) {
            return false;
        } else {
            this.openTable(idx);
            return true;
        }
    }

    openTable(idx: Integer) {
        this._recordsEventers.beginChange();
        try {
            this.closeTable(false);
            this._table = tableDirectory.lock(idx, this);
            this.activate(idx);
        } finally {
            this._recordsEventers.endChange();
        }
    }

    closeTable(keepCurrentLayout: boolean) {
        if (this._table !== undefined) {
            if (keepCurrentLayout) {
                this._keptLayout = this.getGridLayout();
            } else {
                this._keptLayout = undefined;
            }

            if (this._privateTable !== undefined) {
                this._privateTable.close();
                this._privateTable = undefined;
            } else {
                tableDirectory.closeTable(this._table, this);
                tableDirectory.unlockTable(this._table, this);
            }

            this._privateNameSuffixId = undefined;
            this._table = undefined;

            this._recordsEventers.allRecordsDeleted(); // should already all be gone
        }
    }

    openRecordDefinitionList(id: Guid, keepCurrentLayout: boolean) {
        let layout: GridLayout | undefined;
        if (!keepCurrentLayout) {
            layout = undefined;
        } else {
            layout = this.getGridLayout();
        }

        this.openRecordDefinitionListWithLayout(id, layout, !keepCurrentLayout);
    }

    openRecordDefinitionListWithLayout(id: Guid, layout: GridLayout | undefined,
        autoSizeAllColumnWidthsRequired: boolean) {
        if (this._table === undefined) {
            throw new UnexpectedUndefinedError('TFORDLWL031195');
        } else {
            this._recordsEventers.beginChange();
            try {
                this.closeTable(false);

                this.createPrivateTable();
                const tableDefinition = tableDefinitionFactory.createFromTableRecordDefinitionListDirectoryId(id, this._table);
                this._table.setDefinition(tableDefinition);

                if (layout !== undefined) {
                    this._table.layout = layout; // .createCopy();`
                    // todo
                } else {
                    this._table.layout = this._table.createDefaultLayout();
                    autoSizeAllColumnWidthsRequired = true;
                }

                // this._table.lockRecordDefinitionListById(id);
                this._table.setNameFromRecordDefinitionList();
                this.activate(-1);
                if (autoSizeAllColumnWidthsRequired) {
                    this.checkAutoSizeAllColumnWidthsOnFirstUsable();
                }

            } finally {
                this._recordsEventers.endChange();
            }
        }
    }

    openNullItemDefinitionList(keepCurrentLayout: boolean) {
        const id = tableRecordDefinitionListDirectory.nullListId;
        this.openRecordDefinitionList(id, keepCurrentLayout);
    }

    /*saveAsTable(saveAsExistingIdx: Integer | undefined, saveAsName: string | undefined, openSaved: boolean): Integer {
        if (this._table === undefined) {
            throw new PulseError('WatchlistFrame.saveAsWatchlist: watchlist undefined');
        } else {
            let result: Integer;
            let targetTable: Table;

            if (saveAsExistingIdx !== undefined && saveAsExistingIdx >= 0) {
                result = saveAsExistingIdx;
                targetTable = tableDirectory.getTable(result);
            } else {
                if (saveAsName !== undefined && saveAsName !== '') {
                    result = tableDirectory.add();
                    targetTable = tableDirectory.getTable(result);
                    targetTable.loadFromDefault(this._standardFieldListId);
                    targetTable.name = saveAsName;
                } else {
                    throw new PulseError('WatchlistFrame.saveAsWatchlist: Index or name not specified');
                }
            }

            if (targetTable !== this._table) {
                this.saveLayout(this._table.layout);
                targetTable.assign(this._table);
            }

            if (openSaved) {
                this.openTable(result);
            }

            return result;
        }
    }*/

    /*saveAsPortfolioWatchItemDefinitionList(saveAsExistingIdx: Integer | undefined, saveAsName: string | undefined): Integer {
        if (this._table === undefined) {
            throw new PulseError('WatchlistFrame.saveAsPortfolioWatchItemDefinitionList: watchlist undefined');
        } else {
            let result: Integer;

            if (saveAsExistingIdx !== undefined && saveAsExistingIdx >= 0) {
                result = saveAsExistingIdx;
            } else {
                if (saveAsName === undefined || saveAsName === '') {
                    throw new PulseError('WatchlistFrame.saveAsPortfolioWatchItemDefinitionList: Index or name not specified');
                } else {
                    result = tableRecordDefinitionListDirectory.addNoIdUserList(saveAsName, TableRecordDefinitionList.ListTypeId.Portfolio);
                    if (result < 0) {
                        throw new PulseError('WatchlistFrame.saveAsPortfolioWatchItemDefinitionList: User list not created');
                    }
                }
            }

            if (result >= 0) {
                const userDefinitions = PortfolioTableRecordDefinitionList.createFromRecordDefinitionList(this._table.recordDefinitionList);
                const targetSymbolList = tableRecordDefinitionListDirectory.getList(result) as PortfolioTableRecordDefinitionList;
                targetSymbolList.clear();
                targetSymbolList.addArray(userDefinitions.AsArray);
                targetSymbolList.missing = true;

                this.openItemDefinitionList(result, true);
            }

            return result;
        }
    }

    saveAsGroupWatchItemDefinitionList(saveAsExistingIdx: Integer | undefined, saveAsName: string | undefined): Integer {
        if (this._table === undefined) {
            throw new PulseError('WatchlistFrame.saveAsGroupWatchItemDefinitionList: watchlist undefined');
        } else {
            let result: Integer;

            if (saveAsExistingIdx !== undefined && saveAsExistingIdx >= 0) {
                result = saveAsExistingIdx;
            } else {
                if (saveAsName === undefined || saveAsName === '') {
                    throw new PulseError('WatchlistFrame.saveAsGroupWatchItemDefinitionList: Index or name not specified');
                } else {
                    result = tableRecordDefinitionListDirectory.addNoIdUserList(saveAsName, TableRecordDefinitionList.ListTypeId.Group);
                    if (result < 0) {
                        throw new PulseError('WatchlistFrame.saveAsGroupWatchItemDefinitionList: User list not created');
                    }
                }
            }

            if (result >= 0) {
                const userDefinitions = GroupTableRecordDefinitionList.createFromRecordDefinitionList(this._table.recordDefinitionList);
                const targetSymbolList = tableRecordDefinitionListDirectory.getList(result) as GroupTableRecordDefinitionList;
                targetSymbolList.clear();
                targetSymbolList.addArray(userDefinitions.AsArray);
                targetSymbolList.missing = true;

                this.openItemDefinitionList(result, true);
            }

            return result;
        }
    }

    saveAsPrivate(name: string, convertItemDefinitionListToPrivateUser: boolean) {
        if (this._table === undefined) {
            throw new PulseError('WatchlistFrame.saveAsPrivate: watchlist undefined');
        } else if (this.componentAccess) {
            this.componentAccess.gridBeginChange();
            try {
                if (convertItemDefinitionListToPrivateUser
                    &&
                    (!this._table.hasPortfolioRecordDefinitionList() || !this._table.hasPrivateRecordDefinitionList())) {
                    this._table.convertToPrivateUserRecordDefinitionList();
                }

                if (!this.isPrivate()) {
                    assert(this.privateTable === undefined && this.table !== undefined);
                    const newList = new OpenedTable(this.settings, this.adi, this);
                    newList.loadFromDefault(this._standardFieldListId);
                    newList.assign(this._table);

                    this.closeTable();

                    this.privateTable = newList;
                    this._table = newList;
                }

                this._table.name = name;

                this.activate(-1);
            } finally {
                this.componentAccess.gridEndChange();
            }
            this.notifyListChanged();
        }
    }*/

    autoSizeAllColumnWidths() {
        this._grid.autoSizeAllColumnWidths();
    }

    loadDefaultLayout() {
        if (this._table !== undefined) {
            this.setGridLayout(this._table.createDefaultLayout());
        }
    }

    setGridLayout(layout: GridLayout) {
        this._grid.loadLayout(layout);
    }

    getGridLayout(): GridLayout {
        return this._grid.saveLayout();
    }

    getGridLayoutWithHeadersMap(): GridLayoutRecordStore.LayoutWithHeadersMap {
        return this._grid.getLayoutWithHeadersMap();
    }

    gridLoadLayout(layout: GridLayout) {
        this._grid.loadLayout(layout);
    }

    isPrivate(): boolean {
        return this._privateTable !== undefined;
    }

    hasPrivateRecordDefinitionList(): boolean {
        return this._table !== undefined && this._table.hasPrivateRecordDefinitionList();
    }

    calculateDescription(): TableFrame.Description {
        if (this._table === undefined) {
            return {
                abbreviate: '<' + Strings[StringId.NotInitialised] + '>',
                full: '<' + Strings[StringId.NotInitialised] + '>',
                name: Strings[StringId.QuestionMark]
            };
        } else {
            const itemDefinitionListMissing = this._table.recordDefinitionListMissing;

            let abbrDescription = this._table.recordDefinitionListTypeAbbr + ': ' + this._table.recordDefinitionListName;
            if (itemDefinitionListMissing) {
                abbrDescription += ' (' + Strings[StringId.Missing] + ')';
            }

            const fullDescriptionBldr = new StringBuilder();
            fullDescriptionBldr.append(Strings[StringId.Watchlist] + ': ');
            const tableName = this._table.name;
            fullDescriptionBldr.append(tableName);
            let nameText: string;
            if (this.isPrivate()) {
                nameText = '[' + tableName + ']';
                fullDescriptionBldr.append(' (' + Strings[StringId.Private] + ')');
            } else {
                nameText = '<' + tableName + '>';
                fullDescriptionBldr.append(' (' + Strings[StringId.Shared] + ')');
            }

            fullDescriptionBldr.append('\n');

            fullDescriptionBldr.append(this._table.recordDefinitionListTypeDisplay);
            fullDescriptionBldr.append(' ' + Strings[StringId.List] + ': ');
            fullDescriptionBldr.append(this._table.recordDefinitionListName);
            if (this._table.hasPrivateRecordDefinitionList()) {
                fullDescriptionBldr.append(' (' + Strings[StringId.Private] + ')');
            } else {
                fullDescriptionBldr.append(' (' + Strings[StringId.Shared] + ')');
            }

            if (itemDefinitionListMissing) {
                fullDescriptionBldr.append(' (' + Strings[StringId.Missing] + ')');
            }

            return {
                abbreviate: abbrDescription,
                full: fullDescriptionBldr.toString(),
                name: nameText
            };
        }
    }

    private handleSettingChangedEvent() {
        this.applySettings();
    }

    private applySettings() {
        this._table?.clearRendering();

        if (this.settingsApplyEvent !== undefined) {
            this.settingsApplyEvent();
        }
    }

    private checkAutoSizeAllColumnWidthsOnFirstUsable() {
        if (this._table !== undefined) {
            if (!this._table.firstUsable) {
                this._autoSizeAllColumnWidthsOnFirstUsable = true;
            } else {
                this._autoSizeAllColumnWidthsOnFirstUsable = false;
                // FGridDrawer.ApplyAppOptions;  // need to have font set to correctly calculate widths // todo
                this.autoSizeAllColumnWidths();
            }
        }
    }

    private createPrivateTable() {
        assert(this._privateTable === undefined && this.table === undefined);
        this._privateTable = new OpenedTable(this);
        this._table = this._privateTable;
    }

    private calculateNewPrivateName(): TableFrame.NewPrivateName {
        const suffixId = TableFrame.getNextNewPrivateNameSuffixId();
        const name = Strings[StringId.New] + suffixId.toString(10);
        return {
            name,
            suffixId,
        };
    }

    private prepareGrid() {
        if (this._table === undefined) {
            throw new UnexpectedUndefinedError('TFPG448443');
        } else {
            if (this._gridPrepared) {
                this._grid.reset();
            }

            const fieldsAndInitialStates = this._table.getGridFieldsAndInitialStates();
            this.fieldsEventers.addFields(fieldsAndInitialStates.fields);

            const states = fieldsAndInitialStates.states;
            const fieldCount = states.length; // one state for each field
            for (let i = 0; i < fieldCount; i++) {
                this._grid.setFieldState(fieldsAndInitialStates.fields[i], states[i]);
            }
            this._grid.loadLayout(this._table.layout);
            this.updateGridSettingsFromTable();
            this._recordsEventers.recordsLoaded();

            this._gridPrepared = true;
        }
    }

    private activate(tableDirIdx: Integer) {
        if (this._table === undefined) {
            throw new UnexpectedUndefinedError('TFA5592245');
        } else {
            this._recordsEventers.beginChange();
            try {
                this.prepareGrid();
                if (this.isPrivate()) {
                    this._table.open();
                } else {
                    assert(tableDirIdx >= 0);
                    tableDirectory.open(tableDirIdx, this);
                }

                // this.prepareDeleteListAction();

            } finally {
                this._recordsEventers.endChange();
            }
        }
    }

    private updateGridSettingsFromTable() {
        if (this._table === undefined || !this._table.changeRecordDefinitionOrderAllowed) {
            // Grid.ClickSort = false;
        } else {
            // Grid.ClickSort = true;
        }
    }

    // private prepareDeleteListAction() {
    //     const canDeleteListResult = this.canDeleteList();
    //     this.notifyDeleteListActionPrepared(canDeleteListResult.deletable, canDeleteListResult.actionHint);
    // }

    private canDeleteList(): TableFrame.CanDeleteListResult {
        if (this._table === undefined) {
            return {
                deletable: false,
                isRecordDefinitionList: false,
                listName: '',
                actionHint: Strings[StringId.NoTable]
            };
        } else {
            if (!this.isPrivate()) {
                const listName = this._table.name;
                const deletable = tableDirectory.isTableLocked(this._table, this);
                let actionHint: string;
                if (deletable) {
                    actionHint = Strings[StringId.DeleteWatchlist] + ' "' + listName + '"';
                } else {
                    actionHint = Strings[StringId.CannotDeleteWatchlist] + ' "' + listName + '"';
                }
                return {
                    deletable,
                    isRecordDefinitionList: false,
                    listName,
                    actionHint
                };
            } else {
                if (this._table.hasPrivateRecordDefinitionList()) {
                    return {
                        deletable: false,
                        isRecordDefinitionList: false,
                        listName: '',
                        actionHint: Strings[StringId.CannotDeletePrivateList]
                    };
                } else {
                    const recordDefinitionList = this._table.recordDefinitionList;
                    const listName = recordDefinitionList.name;
                    let actionHint: string;
                    let deletable: boolean;
                    if (recordDefinitionList.builtIn) {
                        deletable = false;
                        actionHint = Strings[StringId.CannotDeleteBuiltinList];
                    } else {
                        deletable = !tableRecordDefinitionListDirectory.isListLocked(recordDefinitionList, this._table);
                        if (deletable) {
                            actionHint = Strings[StringId.DeleteList] + ' :' + listName;
                        } else {
                            actionHint = Strings[StringId.CannotDeleteList] + ' :' + listName;
                        }
                    }

                    return {
                        deletable,
                        isRecordDefinitionList: true,
                        listName,
                        actionHint
                    };
                }
            }
        }
    }

    private deleteList() {
        if (this._table !== undefined) {
            const canDeleteListResult = this.canDeleteList();
            if (canDeleteListResult.deletable) {
                if (!canDeleteListResult.isRecordDefinitionList) {
                    const idx = tableDirectory.indexOfList(this._table);
                    if (idx < 0) {
                        throw new AssertInternalError('TFDLNID259', `${this._table.name}`);
                    } else {
                        this.closeTable(false);
                        if (tableDirectory.isLocked(idx, undefined)) {
                            throw new AssertInternalError('TFDLDIS288', `${idx}`);
                        } else {
                            tableDirectory.delete(idx);
                        }
                    }
                } else {
                    const idx = tableRecordDefinitionListDirectory.indexOfList(this._table.recordDefinitionList);
                    if (idx < 0) {
                        throw new AssertInternalError('TFDLRNID897', `${this._table.recordDefinitionList.name}`);
                    } else {
                        this.closeTable(false);
                        if (tableRecordDefinitionListDirectory.isEntryLocked(idx, undefined)) {
                            throw new AssertInternalError('TFDLDISR211', `${idx}`);
                        } else {
                            tableRecordDefinitionListDirectory.deleteList(idx);
                        }
                    }
                }

                // this.newPrivatePortfolioItemDefinitionList(false); // this should be done elsewhere
            }
        }
    }

    private tryNewDefaultPrivateTable() {
        if (this.requireDefaultTableDefinitionEvent === undefined) {
            // do nothing - will remain closed
        } else {
            const tableDefinition = this.requireDefaultTableDefinitionEvent();
            if (tableDefinition !== undefined) {
                this.newPrivateTable(tableDefinition, false);
            }
        }
    }
}

export namespace TableFrame {
    export type SettingsApplyEvent = (this: void) => void;
    export type RecordFocusEvent = (this: void, newRecordIndex: Integer | undefined, oldRecordIndex: Integer | undefined) => void;
    export type GridClickEvent = (this: void, fieldIndex: Integer, recordIndex: Integer) => void;
    export type GridDblClickEvent = (this: void, fieldIndex: Integer, recordIndex: Integer) => void;
    export type RequireDefaultTableDefinitionEvent = (this: void) => TableDefinition | undefined;
    export type TableOpenEvent = (this: void, recordDefinitionList: TableRecordDefinitionList) => void;
    // export type TableOpenChangeEvent = (this: void, opened: boolean) => void;

    export type ListChangedEvent = (this: void) => void;
    export type LayoutChangedEvent = (this: void) => void;
    export type FocusedCellChangeEvent = (this: void, newFieldIdx: Integer, oldFieldIdx: Integer,
        newRecIdx: Integer, oldRecIdx: Integer, uiEvent: boolean) => void;
    export type GridKeyUpDownMessageEvent = (this: void) => void; // todo
    export type GridEnterEvent = (this: void) => void;
    export type GridExitEvent = (this: void) => void;
    export type DeleteListActionPreparedEvent = (this: void, deletable: boolean, actionHint: string) => void;

    export namespace JsonName {
        export const tableId = 'tableId';
        export const privateTable = 'privateTable';
        export const privateNameSuffixId = 'privateNameSuffixId';
    }

    export interface Description {
        name: string;
        abbreviate: string;
        full: string;
    }

    export interface CanDeleteListResult {
        deletable: boolean;
        isRecordDefinitionList: boolean;
        listName: string;
        actionHint: string;
    }

    export type PrivateNameSuffixId = Integer;
    export interface NewPrivateName {
        name: string;
        suffixId: PrivateNameSuffixId;
    }

    let nextNewPrivateNameSuffixId: PrivateNameSuffixId = 0;
    const layoutConfigLoadedNewPrivateNameSuffixIds: PrivateNameSuffixId[] = [];
    export function addlayoutConfigLoadedNewPrivateNameSuffixId(value: PrivateNameSuffixId) {
        layoutConfigLoadedNewPrivateNameSuffixIds.push(value);
    }
    export function getNextNewPrivateNameSuffixId() {
        let existsInLayoutConfigLoaded: boolean;
        do {
            nextNewPrivateNameSuffixId++;
            existsInLayoutConfigLoaded = layoutConfigLoadedNewPrivateNameSuffixIds.indexOf(nextNewPrivateNameSuffixId) >= 0;
        } while (existsInLayoutConfigLoaded);
        return nextNewPrivateNameSuffixId;
    }

    export interface ComponentAccess {
        readonly id: string;
        readonly gridHorizontalScrollbarMarginedHeight: number;

        setBadness(value: Badness): void;
        hideBadnessWithVisibleDelay(badness: Badness): void;
        setStyleFlexBasis(value: number): void;
    }
}
