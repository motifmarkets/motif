/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridDataStore, GridField, GridFieldState, GridLayout, GridTransform, TRecordIndex } from '@motifmarkets/revgrid';
import {
    GridLayoutDataStore,
    OpenedTable,
    Table,
    TableDefinition,
    tableDefinitionFactory,
    TableDirectory,
    tableDirectory,
    TableGridField,
    TableRecord,
    TableRecordDefinition,
    TableRecordDefinitionList,
    tableRecordDefinitionListDirectory
} from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import {
    assert,
    AssertInternalError,
    Badness,
    Guid,
    Integer,
    JsonElement,
    Logger,
    PulseError,
    StringBuilder,
    UnreachableCaseError,
    UsableListChangeTypeId
} from 'src/sys/internal-api';
import { ContentFrame } from '../content-frame';

export class TableFrame extends ContentFrame implements GridDataStore, TableDirectory.Locker, TableDirectory.Opener {
    dragDropAllowed: boolean;

    recordFocusEvent: TableFrame.RecordFocusEvent;
    recordFocusClickEvent: TableFrame.RecordFocusClickEvent;
    recordFocusDblClickEvent: TableFrame.RecordFocusDblClickEvent;
    requireDefaultTableDefinitionEvent: TableFrame.RequireDefaultTableDefinitionEvent;
    tableOpenEvent: TableFrame.TableOpenEvent;
    tableOpenChangeEvent: TableFrame.TableOpenChangeEvent;

    private _table: Table | undefined;
    private _privateTable: OpenedTable | undefined;
    private _privateNameSuffixId: TableFrame.PrivateNameSuffixId | undefined;
    private _keptLayout: GridLayout | undefined;

    private _autoSizeAllColumnWidthsOnFirstUsable: boolean;

    constructor(private _componentAccess: TableFrame.ComponentAccess) {
        super();
    }

    // GridDataStore members

    // eslint-disable-next-line @typescript-eslint/ban-types
    GetRecordValue(index: TRecordIndex): object {
        if (this._table === undefined) {
            throw new PulseError('WatchlistFrame.GetRecordValue: undefined watchlist');
        } else {
            return this._table.getGridRecordValue(index);
        }
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    GetRecords(): object[] {
        if (this._table === undefined) {
            throw new PulseError('WatchlistFrame.GetRecords: undefined watchlist');
        } else {
            return this._table.getGridRecords();
        }
    }

    // BaseDirectory.Entry.ISubscriber members

    subscriberInterfaceDescriminator() {
        // no code
    }

    // ILocker members

    get lockerName(): string {
        if (this._table === undefined) {
            throw new AssertInternalError('TFGLNT20095');
        } else {
            return this._componentAccess.id + ':' + this._table.name;
        }
    }

    // IOpener members
    isTableGrid(): boolean {
        return true;
    }

    loadLayoutConfig(element: JsonElement | undefined) {
        this._componentAccess.gridBeginChange();
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
            this._componentAccess.gridEndChange();
        }
    }

    saveLayoutConfig(element: JsonElement) {
        if (this._table !== undefined) {
            if (!this.isPrivate()) {
                element.setGuid(TableFrame.JsonName.tableId, this._table.id);
            } else {
                const layout = this._componentAccess.gridSaveLayout();
                this._table.layout = layout;
                const privateTableElement = element.newElement(TableFrame.JsonName.privateTable);
                this._table.saveToJson(privateTableElement);
                element.setInteger(TableFrame.JsonName.privateNameSuffixId, this._privateNameSuffixId);
            }
        }
    }

    adviseTableRecordFocus(newRecordIndex: Integer | undefined, oldRecordIndex: Integer | undefined) {
        if (this.recordFocusEvent !== undefined) {
            this.recordFocusEvent(newRecordIndex, oldRecordIndex);
        }
    }

    adviseTableRecordFocusClick(recordIndex: Integer, fieldIndex: Integer) {
        if (this.recordFocusClickEvent !== undefined) {
            this.recordFocusClickEvent(recordIndex, fieldIndex);
        }
    }

    adviseTableRecordFocusDblClick(recordIndex: Integer, fieldIndex: Integer) {
        if (this.recordFocusDblClickEvent !== undefined) {
            this.recordFocusDblClickEvent(recordIndex, fieldIndex);
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
        if (this.tableOpenChangeEvent !== undefined) {
            this.tableOpenChangeEvent(opened);
        }
    }

    notifyTableBadnessChange() {
        if (this._table === undefined) {
            throw new AssertInternalError('TFHDIBCE1994448333');
        } else {
            this._componentAccess.setBadness(this._table.badness);
        }
    }

    notifyTableRecordListChange(listChangeTypeId: UsableListChangeTypeId, itemIdx: Integer, changeCount: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                // handled through badness change
                break;
            case UsableListChangeTypeId.PreUsableClear:
                this._componentAccess.gridDeleteAllRecords();
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                if (this._table === undefined) {
                    throw new AssertInternalError('TFNTRLCA388590');
                } else {
                    if (this._table.changeRecordDefinitionOrderAllowed) {
                        this._componentAccess.gridInsertRecords(itemIdx, changeCount);
                    } else {
                        this._componentAccess.gridInsertRecordsInSameRowPosition(itemIdx, changeCount); // probably not required
                    }
                }
                break;
            case UsableListChangeTypeId.Usable:
                // handled through badness change
                break;
            case UsableListChangeTypeId.Insert:
                if (this._table === undefined) {
                    throw new AssertInternalError('TFNTRLCI388590');
                } else {
                    if (this._table.changeRecordDefinitionOrderAllowed) {
                        this._componentAccess.gridInsertRecords(itemIdx, changeCount);
                    } else {
                        this._componentAccess.gridInsertRecordsInSameRowPosition(itemIdx, changeCount); // probably not required
                    }
                }
                break;
            case UsableListChangeTypeId.Remove:
                this._componentAccess.gridDeleteRecords(itemIdx, changeCount);
                break;
            case UsableListChangeTypeId.Clear:
                this._componentAccess.gridDeleteAllRecords();
                break;
            default:
                throw new UnreachableCaseError('TFNTRLC2323597', listChangeTypeId);
        }
    }

    notifyTableValueChange(fieldIdx: Integer, recordIdx: Integer) {
        // TODO:MED There is a possible bug somewhere. This method is being called with a fieldIdx value greater
        // then the number of fields. The problem manifests when the table-frame is used via the PariDepth component.
        const fieldCount = this._table !== undefined ? this._table.fieldList.fieldCount : -1;
        if (fieldIdx < fieldCount && recordIdx < this.RecordCount) {
            this._componentAccess.gridInvalidateValue(fieldIdx, recordIdx);
        } else {
            throw new AssertInternalError('TFTFNTVC22944',
                `Field: ${fieldIdx}, Record: "${recordIdx}", FieldCount: ${fieldCount}, RecordCount: ${this.RecordCount}`);
        }
    }

    notifyTableRecordChange(recordIdx: Integer) {
        // TODO:MED There is a possible bug somewhere. This method is being called with a fieldIdx value greater
        // then the number of fields. The problem manifests when the table-frame is used via the PariDepth component.
        const fieldCount = this._table !== undefined ? this._table.fieldList.fieldCount : -1;
        if (recordIdx < this.RecordCount) {
            this._componentAccess.gridInvalidateRecord(recordIdx);
        } else {
            throw new AssertInternalError('TFTFNTRC4422944',
                `Record: "${recordIdx}", FieldCount: ${fieldCount}, RecordCount: ${this.RecordCount}`);
        }
    }

    notifyTableLayoutUpdated() {
        if (this._table === undefined) {
            throw new AssertInternalError('TFTFNTLU48571');
        } else {
            this._componentAccess.gridLoadLayout(this._table.layout);
        }
    }

    notifyTableRecordDisplayOrderChanged(itemIndices: Integer[]) {
        this._componentAccess.gridReorderRecRows(itemIndices);
    }

    notifyTableFirstPreUsable() {
        // this is not fully implemented
        if (this._autoSizeAllColumnWidthsOnFirstUsable) {
            this.checkAutoSizeAllColumnWidthsOnFirstUsable();
        }
    }

    getFocusedRecordIndex() {
        return this._componentAccess.gridFocusedRecordIndex;
    }

    getOrderedGridRecIndices(): Integer[] {
        return this._componentAccess.gridRowRecIndices;
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
        this._componentAccess.gridFocusedRecordIndex = itemIdx;
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
        const itemIdx = this._componentAccess.gridFocusedRecordIndex;
        if (itemIdx !== undefined && itemIdx >= 0 && this._table !== undefined) {
            this._componentAccess.gridBeginChange();
            try {
                this._table.deleteRecord(itemIdx);
            } finally {
                this._componentAccess.gridEndChange();
            }
        }
    }

    canDeleteFocusedRecord() {
        return this._table !== undefined &&
            this._table.addDeleteRecordDefinitionsAllowed &&
            this._componentAccess.gridFocusedRecordIndex !== undefined;
    }

    newPrivateTable(tableDefinition: TableDefinition, keepCurrentLayout: boolean) {

        this._componentAccess.gridBeginChange();
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
            this._componentAccess.gridEndChange();
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
        this._componentAccess.gridBeginChange();
        try {
            this.closeTable(false);
            this._table = tableDirectory.lock(idx, this);
            this.activate(idx);
        } finally {
            this._componentAccess.gridEndChange();
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

            this._componentAccess.gridDeleteAllRecords(); // should already all be gone
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
            throw new PulseError('WatchlistFrame.openItemDefinitionListWithLayout: watchlist undefined');
        } else {
            this._componentAccess.gridBeginChange();
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
                this._componentAccess.gridEndChange();
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
        this._componentAccess.gridAutoSizeAllColumnWidths();
    }

    loadDefaultLayout() {
        if (this._table !== undefined) {
            this.setGridLayout(this._table.createDefaultLayout());
        }
    }

    setGridLayout(layout: GridLayout) {
        this._componentAccess.gridLoadLayout(layout);
    }

    getGridLayout(): GridLayout {
        return this._componentAccess.gridSaveLayout();
    }

    getGridLayoutWithHeadings(): GridLayoutDataStore.GridLayoutWithHeaders {
        return this._componentAccess.getGridLayoutWithHeadings();
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

    // get standardFieldListId(): TableFieldList.StandardId { return this._standardFieldListId; }
    // set standardFieldListId(value: TableFieldList.StandardId) { this._standardFieldListId = value; }
    get table(): Table | undefined { return this._table; }
    get RecordCount(): Integer { return this._table === undefined ? 0 : this._table.recordCount; }
    getRecord(idx: Integer): TableRecord {
        if (this._table === undefined) {
            throw new AssertInternalError('TFTFGR22996', `${idx}`);
        } else {
            return this._table.getRecord(idx);
        }
    }

    clearTableRendering() {
        this._table?.clearRendering();
    }

    get tableOpened(): boolean { return this._table !== undefined; }

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
            throw new PulseError('WatchlistFrame.activate: undefined watchlist');
        } else {
            this._componentAccess.gridBeginChange();
            try {
                this._componentAccess.gridReset();
                const fieldsAndInitialStates = this._table.getGridFieldsAndInitialStates();
                this._componentAccess.gridAddFields(fieldsAndInitialStates.fields);
                const states = fieldsAndInitialStates.states;
                const fieldCount = states.length; // one state for each field
                for (let i = 0; i < fieldCount; i++) {
                    this._componentAccess.gridSetFieldState(fieldsAndInitialStates.fields[i], states[i]);
                }
                this._componentAccess.gridLoadLayout(this._table.layout);
                this.updateGridSettingsFromTable();
                this._componentAccess.gridInvalidateAll();
            } finally {
                this._componentAccess.gridEndChange();
            }
        }
    }

    private activate(tableDirIdx: Integer) {
        if (this._table === undefined) {
            throw new PulseError('WatchlistFrame.activate: undefined watchlist');
        } else {
            this._componentAccess.gridBeginChange();
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
                this._componentAccess.gridEndChange();
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
    export type RecordFocusEvent = (this: void, newRecordIndex: Integer | undefined, oldRecordIndex: Integer | undefined) => void;
    export type RecordFocusClickEvent = (this: void, recordIndex: Integer, fieldIndex: Integer) => void;
    export type RecordFocusDblClickEvent = (this: void, recordIndex: Integer, fieldIndex: Integer) => void;
    export type RequireDefaultTableDefinitionEvent = (this: void) => TableDefinition | undefined;
    export type TableOpenEvent = (this: void, recordDefinitionList: TableRecordDefinitionList) => void;
    export type TableOpenChangeEvent = (this: void, opened: boolean) => void;

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
        readonly gridRowRecIndices: Integer[];
        gridFocusedRecordIndex: Integer | undefined;
        gridAddTransform(transform: GridTransform): void;
        gridInsertRecords(index: Integer, count: Integer): void;
        gridInsertRecordsInSameRowPosition(index: Integer, count: Integer): void;
        gridMoveRecordRow(fromRecordIndex: Integer, toRowIndex: Integer): void;
        gridDeleteRecords(recordIndex: Integer, count: Integer): void;
        gridDeleteAllRecords(): void;
        gridInvalidateAll(): void;
        gridInvalidateValue(fieldIndex: Integer, recordIndex: Integer): void;
        gridInvalidateRecord(recordIndex: Integer): void;
        gridLoadLayout(layout: GridLayout): void;
        gridSaveLayout(): GridLayout;
        gridReorderRecRows(recordIndices: Integer[]): void;
        gridAutoSizeAllColumnWidths(): void;
        gridBeginChange(): void;
        gridEndChange(): void;
        gridReset(): void;
        gridAddFields(fields: TableGridField[]): void;
        gridSetFieldState(field: GridField, state?: GridFieldState | undefined): void;
        getGridLayoutWithHeadings(): GridLayoutDataStore.GridLayoutWithHeaders;
        setBadness(value: Badness): void;
        hideBadnessWithVisibleDelay(badness: Badness): void;
    }
}
