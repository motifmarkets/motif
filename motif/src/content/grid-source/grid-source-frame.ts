/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    Badness,
    GridLayout,
    GridLayoutOrNamedReferenceDefinition,
    GridRowOrderDefinition,
    GridSource,
    GridSourceOrNamedReference,
    GridSourceOrNamedReferenceDefinition,
    Integer,
    LockOpenListItem,
    MultiEvent,
    NamedGridLayoutsService,
    NamedGridSourcesService,
    SettingsService,
    Table,
    TableGridRecordStore,
    TableRecordSourceDefinition,
    TableRecordSourceFactoryService
} from '@motifmarkets/motif-core';
import { RevRecordMainAdapter } from 'revgrid';
import { RecordGrid } from '../adapted-revgrid/internal-api';
import { ContentFrame } from '../content-frame';

export class GridSourceFrame extends ContentFrame {
    opener: LockOpenListItem.Opener;
    dragDropAllowed: boolean;
    keepPreviousLayoutIfPossible = false;
    keptGridLayoutOrNamedReferenceDefinition: GridLayoutOrNamedReferenceDefinition | undefined;

    gridLayoutSetEventer: GridSourceFrame.GridLayoutSetEventer;
    recordFocusedEventer: GridSourceFrame.RecordFocusedEventer;
    gridClickEventer: GridSourceFrame.GridClickEventer;
    gridDblClickEventer: GridSourceFrame.GridDblClickEventer;
    // requireDefaultTableDefinitionEvent: GridSourceFrame.RequireDefaultTableDefinitionEvent;
    // tableOpenEvent: GridSourceFrame.TableOpenEvent;
    // tableOpenChangeEvent: TableFrame.TableOpenChangeEvent;

    private readonly _recordStore = new TableGridRecordStore();
    private readonly _opener: LockOpenListItem.Opener;

    private _lockedGridSourceOrNamedReference: GridSourceOrNamedReference | undefined;
    private _openedGridSource: GridSource;
    private _openedTable: Table;

    private _grid: RecordGrid;
    private _gridPrepared = false;

    private _table: Table | undefined;
    private _privateNameSuffixId: GridSourceFrame.PrivateNameSuffixId | undefined;
    private _keptRowOrderDefinition: GridRowOrderDefinition | undefined;
    private _keptGridRowAnchor: RecordGrid.ViewAnchor | undefined;

    private _autoSizeAllColumnWidthsOnFirstUsable: boolean;

    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _tableFieldsChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _tableFirstUsableSubscriptionId: MultiEvent.SubscriptionId;
    private _gridSourceGridLayoutSetSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        private readonly _componentAccess: GridSourceFrame.ComponentAccess,
        private readonly _settingsService: SettingsService,
        private readonly _namedGridLayoutsService: NamedGridLayoutsService,
        private readonly _tableRecordSourceFactoryService: TableRecordSourceFactoryService,
        private readonly _namedGridSourcesService: NamedGridSourcesService,
    ) {
        super();
    }

    get isNamed() {
        const gridSourceOrNamedReference = this._lockedGridSourceOrNamedReference;
        return gridSourceOrNamedReference !== undefined && gridSourceOrNamedReference.lockedNamedGridSource !== undefined;
    }

    get recordStore() { return this._recordStore; }
    get openedTable() { return this._openedTable; }
    get gridRowHeight() { return this._grid.rowHeight; }
    get gridHorizontalScrollbarMarginedHeight() { return this._componentAccess.gridHorizontalScrollbarMarginedHeight; }

    // get standardFieldListId(): TableFieldList.StandardId { return this._standardFieldListId; }
    // set standardFieldListId(value: TableFieldList.StandardId) { this._standardFieldListId = value; }
    // get table(): Table | undefined { return this._table; }
    get recordCount(): Integer { return this._table === undefined ? 0 : this._table.recordCount; }
    get opened(): boolean { return this._table !== undefined; }

    get isFiltered(): boolean { return this._grid.isFiltered; }
    get recordFocused() {return this._grid.recordFocused; }

    override finalise() {
        if (!this.finalised) {
            this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
            this.closeGridSource(false);
            super.finalise();
        }
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
        this._grid.recordFocusedEventer = (newRecordIndex, oldRecordIndex) => this.handleRecordFocusedEvent(newRecordIndex, oldRecordIndex);
        this._grid.mainClickEventer = (fieldIndex, recordIndex) => this.handleGridClickEvent(fieldIndex, recordIndex);
        this._grid.mainDblClickEventer = (fieldIndex, recordIndex) => this.handleGridDblClickEvent(fieldIndex, recordIndex);

        this._settingsChangedSubscriptionId =
            this._settingsService.subscribeSettingsChangedEvent(() => this.applySettings());

        this.applySettings();
    }

    tryOpenGridSource(definition: GridSourceOrNamedReferenceDefinition, keepView: boolean): GridSourceOrNamedReference | undefined {
        this.closeGridSource(keepView);

        if (definition.canUpdateGridLayoutDefinitionOrNamedReference() &&
            this.keepPreviousLayoutIfPossible &&
            this.keptGridLayoutOrNamedReferenceDefinition !== undefined
        ) {
            definition.updateGridLayoutDefinitionOrNamedReference(this.keptGridLayoutOrNamedReferenceDefinition);
        }
        const gridSourceOrNamedReference = new GridSourceOrNamedReference(
            this._namedGridLayoutsService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
            definition
        );

        const lockResult = gridSourceOrNamedReference.tryLock(this.opener);
        if (lockResult.isErr()) {
            const badness: Badness = {
                reasonId: Badness.ReasonId.LockError,
                reasonExtra: lockResult.error,
            };
            this._componentAccess.setBadness(badness);
            return undefined;
        } else {
            const gridSource = gridSourceOrNamedReference.lockedGridSource;
            if (gridSource === undefined) {
                throw new AssertInternalError('GSFOGSL22209');
            } else {
                gridSource.openLocked(this.opener);
                const table = gridSource.table;
                if (table === undefined) {
                    throw new AssertInternalError('GSFOGSTA22209');
                } else {
                    const layout = gridSource.lockedGridLayout;
                    if (layout === undefined) {
                        throw new AssertInternalError('GSFOGSGL22209');
                    } else {
                        this._lockedGridSourceOrNamedReference = gridSourceOrNamedReference;
                        this._openedGridSource = gridSource;
                        this._openedTable = table;

                        this._gridSourceGridLayoutSetSubscriptionId = this._openedGridSource.subscribeGridLayoutSetEvent(
                            () => this.handleGridSourceGridLayoutSetEvent()
                        );

                        this._recordStore.setTable(table);
                        this._tableFieldsChangedSubscriptionId = table.subscribeFieldsChangedEvent(
                            () => this._grid.updateAllowedFields(table.fields)
                        );

                        this._grid.fieldsLayoutReset(table.fields, layout);

                        if (table.beenUsable) {
                            this.applyFirstUsable();
                        } else {
                            this._tableFirstUsableSubscriptionId = table.subscribeFirstUsableEvent(() => {
                                table.unsubscribeFirstUsableEvent(this._tableFirstUsableSubscriptionId);
                                this.applyFirstUsable();
                            });
                        }

                        this.gridLayoutSetEventer(layout);
                        return gridSourceOrNamedReference;
                    }
                }
            }
        }
    }

    closeGridSource(keepView: boolean) {
        if (this._lockedGridSourceOrNamedReference !== undefined) {
            if (this._table === undefined) {
                throw new AssertInternalError('GSF22209');
            } else {
                this._table.unsubscribeFieldsChangedEvent(this._tableFieldsChangedSubscriptionId);
                this._tableFieldsChangedSubscriptionId = undefined;
                this._table.unsubscribeFirstUsableEvent(this._tableFirstUsableSubscriptionId); // may not be subscribed
                this._tableFirstUsableSubscriptionId = undefined;
                this._tableFieldsChangedSubscriptionId = undefined;
                this._openedGridSource.unsubscribeGridLayoutSetEvent(this._gridSourceGridLayoutSetSubscriptionId);
                this._gridSourceGridLayoutSetSubscriptionId = undefined;
                if (this.keepPreviousLayoutIfPossible) {
                    this.keptGridLayoutOrNamedReferenceDefinition = this.createGridLayoutOrNamedReferenceDefinition();
                } else {
                    this.keptGridLayoutOrNamedReferenceDefinition = undefined;
                }
                if (keepView) {
                    this._keptRowOrderDefinition = this._grid.getRowOrderDefinition();
                    this._keptGridRowAnchor = this._grid.getViewAnchor();
                } else {
                    this._keptRowOrderDefinition = undefined;
                    this._keptGridRowAnchor = undefined;
                }
                this._openedGridSource.closeLocked(this._opener);
                this._lockedGridSourceOrNamedReference.unlock(this._opener);
                this._lockedGridSourceOrNamedReference = undefined;
                this._table = undefined;
            }
        }
    }

    createGridSourceOrNamedReferenceDefinition(): GridSourceOrNamedReferenceDefinition {
        if (this._lockedGridSourceOrNamedReference === undefined) {
            throw new AssertInternalError('GSFCGSONRD22209');
        } else {
            const rowOrderDefinition = this._grid.getRowOrderDefinition();
            return this._lockedGridSourceOrNamedReference.createDefinition(rowOrderDefinition);
        }
    }

    createGridLayoutOrNamedReferenceDefinition() {
        return this._openedGridSource.createGridLayoutOrNamedReferenceDefinition();
    }

    createTableRecordSourceDefinition(): TableRecordSourceDefinition {
        if (this._openedGridSource === undefined) {
            throw new AssertInternalError('GSFCGSONRD22209');
        } else {
            return this._openedGridSource.createTableRecordSourceDefinition();
        }
    }

    createRowOrderDefinition() {
        return this._grid.getRowOrderDefinition();
    }

    openGridLayoutOrNamedReferenceDefinition(gridLayoutOrNamedReferenceDefinition: GridLayoutOrNamedReferenceDefinition) {
        this._openedGridSource.openGridLayoutOrNamedReferenceDefinition(gridLayoutOrNamedReferenceDefinition, this._opener);
    }

    applyGridLayoutDefinition(definition: GridLayoutOrNamedReferenceDefinition) {
        this._openedGridSource.openGridLayoutOrNamedReferenceDefinition(definition, this._opener);
    }


    // loadLayoutConfig(element: JsonElement | undefined) {

    //     this._recordStore.beginChange();
    //     try {

    //         this.closeTable(false);

    //         if (element === undefined) {
    //             this.tryNewDefaultPrivateTable();
    //         } else {
    //             const tableElementResult = element.tryGetElement(GridSourceFrame.JsonName.table);
    //             if (tableElement === undefined) {
    //                 this.tryNewDefaultPrivateTable();
    //             } else {
    //                 const definition = TableDefinition.createFr
    //             }

    //             const privateElementResult = element.tryGetElement(GridSourceFrame.JsonName.privateTable);
    //             if (privateElement !== undefined) {
    //                 const id = nanoid(); // not sure if needed
    //                 this._table = this._tablesService.newTable(id, undefined, );
    //                 this.createPrivateTable();
    //                 if (this._table !== undefined) {
    //                     const success = this._table.loadFromJson(privateElement);
    //                     if (!success) {
    //                         this.closeTable(false);
    //                         this.tryNewDefaultPrivateTable();
    //                     } else {
    //                         this._privateNameSuffixId = privateElement.tryGetIntegerType(GridSourceFrame.JsonName.privateNameSuffixId);
    //                         if (this._privateNameSuffixId !== undefined) {
    //                             GridSourceFrame.addlayoutConfigLoadedNewPrivateNameSuffixId(this._privateNameSuffixId);
    //                         }
    //                         this.activate(-1);
    //                     }
    //                 }
    //             } else {
    //                 const loadedTableIdResult = element.tryGetGuid(
    //                     GridSourceFrame.JsonName.tableId,
    //                     'TableFrame.loadLayoutConfigId'
    //                 );
    //                 if (loadedTableId === undefined) {
    //                     this.tryNewDefaultPrivateTable();
    //                 } else {
    //                     const tableDirIdx = this._tablesService.indexOfId(loadedTableId);
    //                     if (tableDirIdx < 0) {
    //                         this.tryNewDefaultPrivateTable();
    //                     } else {
    //                         this._table = this._tablesService.lock(tableDirIdx, this);
    //                         this.activate(-1);
    //                     }
    //                 }
    //             }
    //         }

    //     } finally {
    //         this._recordStore.endChange();
    //     }
    // }

    // saveLayoutConfig(element: JsonElement) {
    //     if (this._table !== undefined) {
    //         if (!this.isPrivate()) {
    //             element.setGuid(GridSourceFrame.JsonName.tableId, this._table.id);
    //         } else {
    //             const layout = this._grid.saveLayout();
    //             this._table.layout = layout;
    //             const privateTableElement = element.newElement(GridSourceFrame.JsonName.privateTable);
    //             this._table.saveToJson(privateTableElement);
    //             element.setInteger(GridSourceFrame.JsonName.privateNameSuffixId, this._privateNameSuffixId);
    //         }
    //     }
    // }

    createRecordDefinition(index: Integer) {
        return this._openedTable.createRecordDefinition(index);
    }

    handleRecordFocusedEvent(newRecordIndex: Integer | undefined, oldRecordIndex: Integer | undefined) {
        if (this.recordFocusedEventer !== undefined) {
            this.recordFocusedEventer(newRecordIndex, oldRecordIndex);
        }
    }

    handleGridClickEvent(fieldIndex: Integer, recordIndex: Integer) {
        if (this.gridClickEventer !== undefined) {
            this.gridClickEventer(fieldIndex, recordIndex);
        }
    }

    handleGridDblClickEvent(fieldIndex: Integer, recordIndex: Integer) {
        if (this.gridDblClickEventer !== undefined) {
            this.gridDblClickEventer(fieldIndex, recordIndex);
        }
    }

    // notifyTableOpen(recordDefinitionList: TableRecordDefinitionList) {
    //     if (this._table === undefined) {
    //         throw new AssertInternalError('TFNTO533955482');
    //     } else {
    //         this._componentAccess.hideBadnessWithVisibleDelay(this._table.badness);
    //     }
    //     if (this.tableOpenEvent !== undefined) {
    //         this.tableOpenEvent(recordDefinitionList);
    //     }
    // }

    // notifyTableOpenChange(opened: boolean) {
    // //     if (this.tableOpenChangeEvent !== undefined) {
    // //         this.tableOpenChangeEvent(opened);
    // //     }
    // }

    notifyTableBadnessChange() {
        if (this._table === undefined) {
            throw new AssertInternalError('TFHDIBCE1994448333');
        } else {
            this._componentAccess.setBadness(this._table.badness);
        }
    }

    // notifyTableRecordsLoaded() {
    //     this._tableGridRecordStore.recordsLoaded();
    // }

    // notifyTableRecordsInserted(index: Integer, count: Integer) {
    //     this._tableGridRecordStore.recordsInserted(index, count);
    // }

    // notifyTableRecordsDeleted(index: Integer, count: Integer) {
    //     this._tableGridRecordStore.recordsDeleted(index, count);
    // }

    // notifyTableAllRecordsDeleted() {
    //     this._tableGridRecordStore.allRecordsDeleted();
    // }

    // notifyTableRecordListChange(listChangeTypeId: UsableListChangeTypeId, itemIdx: Integer, changeCount: Integer) {
    //     switch (listChangeTypeId) {
    //         case UsableListChangeTypeId.Unusable:
    //             // handled through badness change
    //             break;
    //         case UsableListChangeTypeId.PreUsableClear:
    //             this._tableGridRecordStore.allRecordsDeleted();
    //             break;
    //         case UsableListChangeTypeId.PreUsableAdd:
    //             if (this._table === undefined) {
    //                 throw new AssertInternalError('TFNTRLCA388590');
    //             } else {
    //                 // if (this._table.changeRecordDefinitionOrderAllowed) {
    //                     this._tableGridRecordStore.recordsInserted(itemIdx, changeCount);
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
    //                     this._tableGridRecordStore.recordsInserted(itemIdx, changeCount);
    //                 // } else {
    //                 //     this._componentAccess.gridInsertRecordsInSameRowPosition(itemIdx, changeCount); // probably not required
    //                 // }
    //             }
    //             break;
    //         case UsableListChangeTypeId.Remove:
    //             this._tableGridRecordStore.recordsDeleted(itemIdx, changeCount);
    //             break;
    //         case UsableListChangeTypeId.Clear:
    //             this._tableGridRecordStore.allRecordsDeleted();
    //             break;
    //         default:
    //             throw new UnreachableCaseError('TFNTRLC2323597', listChangeTypeId);
    //     }
    // }

    // notifyTableRecordValuesChanged(recordIdx: Integer, invalidatedValues: RevRecordInvalidatedValue[]) {
    //     // TODO:MED There is a possible bug somewhere. This method is being called with a fieldIdx value greater
    //     // then the number of fields. The problem manifests when the table-frame is used via the PariDepth component.
    //     const fieldCount = this._table !== undefined ? this._grid.fieldCount : -1;
    //     if (recordIdx < this.recordCount) {
    //         this._recordStore.invalidateRecordValues(recordIdx, invalidatedValues);
    //     } else {
    //         throw new AssertInternalError('TFTFNTVC22944',
    //             `Record: "${recordIdx}", FieldCount: ${fieldCount}, RecordCount: ${this.recordCount}`);
    //     }
    // }

    // notifyTableRecordSequentialFieldValuesChanged(recordIdx: Integer, fieldIndex: number, fieldCount: number) {
    //     // TODO:MED There is a possible bug somewhere. This method is being called with a fieldIdx value greater
    //     // then the number of fields. The problem manifests when the table-frame is used via the PariDepth component.
    //     const tableFieldCount = this._table !== undefined ? this._table.fieldList.fieldCount : -1;
    //     if (fieldIndex + fieldCount <= tableFieldCount && recordIdx < this.recordCount) {
    //         this._recordStore.invalidateRecordFields(recordIdx, fieldIndex, fieldCount);
    //     } else {
    //         throw new AssertInternalError('TFTFNTVC22944',
    //             `Field: ${fieldIndex}, Record: "${recordIdx}", FieldCount: ${fieldCount}, RecordCount: ${this.recordCount}`);
    //     }
    // }

    // notifyTableRecordChanged(recordIdx: Integer) {
    //     // TODO:MED There is a possible bug somewhere. This method is being called with a fieldIdx value greater
    //     // then the number of fields. The problem manifests when the table-frame is used via the PariDepth component.
    //     const fieldCount = this._table !== undefined ? this._table.fieldList.fieldCount : -1;
    //     if (recordIdx < this.recordCount) {
    //         this._recordStore.invalidateRecord(recordIdx);
    //     } else {
    //         throw new AssertInternalError('TFTFNTRC4422944',
    //             `Record: "${recordIdx}", FieldCount: ${fieldCount}, RecordCount: ${this.recordCount}`);
    //     }
    // }

    // notifyTableLayoutUpdated() {
    //     if (this._table === undefined) {
    //         throw new AssertInternalError('TFTFNTLU48571');
    //     } else {
    //         this._grid.loadLayout(this._table.layout);
    //     }
    // }

    // notifyTableRecordDisplayOrderChanged(itemIndices: Integer[]) {
    //     this._grid.reorderRecRows(itemIndices);
    // }

    // notifyTableFirstPreUsable() {
    //     // this is not fully implemented
    //     if (this._autoSizeAllColumnWidthsOnFirstUsable) {
    //         this.checkAutoSizeAllColumnWidthsOnFirstUsable();
    //     }
    // }

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

    focusItem(itemIdx: Integer) {
        this._grid.focusedRecordIndex = itemIdx;
    }

    // clearRecordDefinitions() {
    //     if (this._table === undefined) {
    //         throw new AssertInternalError('TFCRD599995877');
    //     } else {
    //         if (this._table.addDeleteRecordDefinitionsAllowed) {
    //             this._table.clearRecordDefinitions();
    //         }
    //     }
    // }

    // canAddRecordDefinition(definition: TableRecordDefinition): boolean {
    //     if (this._table === undefined) {
    //         return false;
    //     } else {
    //         return this._table.canAddRecordDefinition(definition);
    //     }
    // }

    // addRecordDefinition(definition: TableRecordDefinition) {
    //     if (this._table === undefined) {
    //         Logger.assertError('addItemDefinition undefined');
    //     } else {
    //         if (this._table.addDeleteRecordDefinitionsAllowed) {
    //             this._table.addRecordDefinition(definition);
    //         }
    //     }
    // }

    // setRecordDefinition(idx: Integer, value: TableRecordDefinition) {
    //     if (this._table === undefined) {
    //         Logger.assertError('setRecordDefinition undefined');
    //     } else {
    //         if (this._table.addDeleteRecordDefinitionsAllowed) {
    //             this._table.setRecordDefinition(idx, value);
    //         }
    //     }
    // }

    // deleteFocusedRecord() {
    //     const itemIdx = this._grid.focusedRecordIndex;
    //     if (itemIdx !== undefined && itemIdx >= 0 && this._table !== undefined) {
    //         this._recordStore.beginChange();
    //         try {
    //             this._table.userRemoveAt(itemIdx, 1);
    //         } finally {
    //             this._recordStore.endChange();
    //         }
    //     }
    // }

    // canDeleteFocusedRecord() {
    //     return this._table !== undefined &&
    //         this._table.addDeleteRecordDefinitionsAllowed &&
    //         this._grid.focusedRecordIndex !== undefined;
    // }

    // newPrivateTable(tableDefinition: TableDefinition, keepCurrentLayout: boolean) {

    //     this._recordStore.beginChange();
    //     try {
    //         if (this.table !== undefined) {
    //             this.closeTable(keepCurrentLayout);
    //         }

    //         this.createPrivateTable();

    //         if (this.table !== undefined) {
    //             this.table.setDefinition(tableDefinition);
    //             const { name, suffixId } = this.calculateNewPrivateName();
    //             this.table.setName(name);
    //             this._privateNameSuffixId = suffixId;

    //             if (this._keptLayout !== undefined) {
    //                 this.table.layout = this._keptLayout;
    //             } else {
    //                 this.table.layout = this.table.createDefaultLayout();
    //             }

    //             // this.table.newPrivateRecordDefinitionList();
    //             this.activate(-1);

    //             if (!keepCurrentLayout) {
    //                 this.checkAutoSizeAllColumnWidthsOnFirstUsable();
    //             }
    //         }
    //     } finally {
    //         this._recordStore.endChange();
    //     }
    // }

    // openTableById(id: Guid): boolean {
    //     const idx = this._tablesService.indexOfId(id);

    //     if (idx < 0) {
    //         return false;
    //     } else {
    //         this.openTable(idx);
    //         return true;
    //     }
    // }

    // openTable(recordSourceDefinition: TableRecordSourceDefinition) {
    //     this._recordStore.beginChange();
    //     try {
    //         // this.closeTable(false);
    //         this.closeTable();
    //         const recordSource = this._tableRecordSourceFactoryService.createFromDefinition(recordSourceDefinition);
    //         const table = new Table(recordSource);
    //         this._recordStore.setTable(table);
    //         table.open(this._opener);
    //         //     this._table = this._tablesService.lock(idx, this);
    //         // this.activate(idx);
    //     } finally {
    //         this._recordStore.endChange();
    //     }
    // }

    // openRecordDefinitionList(id: Guid, keepCurrentLayout: boolean) {
    //     let layout: GridLayout | undefined;
    //     if (!keepCurrentLayout) {
    //         layout = undefined;
    //     } else {
    //         layout = this.getGridLayout();
    //     }

    //     this.openRecordDefinitionListWithLayout(id, layout, !keepCurrentLayout);
    // }

    // openRecordDefinitionListWithLayout(id: Guid, layout: GridLayout | undefined,
    //     autoSizeAllColumnWidthsRequired: boolean) {
    //     if (this._table === undefined) {
    //         throw new UnexpectedUndefinedError('TFORDLWL031195');
    //     } else {
    //         this._recordStore.beginChange();
    //         try {
    //             this.closeTable(false);

    //             this.createPrivateTable();
    //             const tableDefinition = this._tablesService.definitionFactory.createFromTableRecordDefinitionListDirectoryId(
    //                 id, this._table
    //             );
    //             this._table.setDefinition(tableDefinition);

    //             if (layout !== undefined) {
    //                 this._table.layout = layout; // .createCopy();`
    //                 // todo
    //             } else {
    //                 this._table.layout = this._table.createDefaultLayout();
    //                 autoSizeAllColumnWidthsRequired = true;
    //             }

    //             // this._table.lockRecordDefinitionListById(id);
    //             this._table.setNameFromRecordDefinitionList();
    //             this.activate(-1);
    //             if (autoSizeAllColumnWidthsRequired) {
    //                 this.checkAutoSizeAllColumnWidthsOnFirstUsable();
    //             }

    //         } finally {
    //             this._recordStore.endChange();
    //         }
    //     }
    // }

    // openNullItemDefinitionList(keepCurrentLayout: boolean) {
    //     const id = this._tableRecordDefinitionListsService.nullListId;
    //     this.openRecordDefinitionList(id, keepCurrentLayout);
    // }

    /*saveAsTable(saveAsExistingIdx: Integer | undefined, saveAsName: string | undefined, openSaved: boolean): Integer {
        if (this._table === undefined) {
            throw new PulseError('WatchlistFrame.saveAsWatchlist: watchlist undefined');
        } else {
            let result: Integer;
            let targetTable: Table;

            if (saveAsExistingIdx !== undefined && saveAsExistingIdx >= 0) {
                result = saveAsExistingIdx;
                targetTable = this._tablesService.getTable(result);
            } else {
                if (saveAsName !== undefined && saveAsName !== '') {
                    result = this._tablesService.add();
                    targetTable = this._tablesService.getTable(result);
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
                    result = this._tableRecordDefinitionListsService.addNoIdUserList(
                        saveAsName, TableRecordDefinitionList.ListTypeId.Portfolio
                    );
                    if (result < 0) {
                        throw new PulseError('WatchlistFrame.saveAsPortfolioWatchItemDefinitionList: User list not created');
                    }
                }
            }

            if (result >= 0) {
                const userDefinitions = PortfolioTableRecordDefinitionList.createFromRecordDefinitionList(this._table.recordDefinitionList);
                const targetSymbolList = this._tableRecordDefinitionListsService.getList(result) as PortfolioTableRecordDefinitionList;
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
                    result = this._tableRecordDefinitionListsService.addNoIdUserList(
                        saveAsName, TableRecordDefinitionList.ListTypeId.Group
                    );
                    if (result < 0) {
                        throw new PulseError('WatchlistFrame.saveAsGroupWatchItemDefinitionList: User list not created');
                    }
                }
            }

            if (result >= 0) {
                const userDefinitions = GroupTableRecordDefinitionList.createFromRecordDefinitionList(this._table.recordDefinitionList);
                const targetSymbolList = this._tableRecordDefinitionListsService.getList(result) as GroupTableRecordDefinitionList;
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

    // loadDefaultLayout() {
    //     if (this._table !== undefined) {
    //         this.setGridLayout(this._table.createDefaultLayout());
    //     }
    // }

    createAllowedFieldsAndLayoutDefinition() {
        return this._grid.createAllowedFieldsAndLayoutDefinition();
    }

    // getGridLayout(): GridLayout {
    //     return this._grid.saveLayout();
    // }

    // getGridLayoutWithHeadersMap(): GridLayoutRecordStore.LayoutWithHeadersMap {
    //     return this._grid.getLayoutWithHeadersMap();
    // }

    // gridLoadLayout(layout: GridLayout) {
    //     this._grid.loadLayout(layout);
    // }

    // isPrivate(): boolean {
    //     return this._privateTable !== undefined;
    // }

    // hasPrivateRecordDefinitionList(): boolean {
    //     return this._table !== undefined && this._table.hasPrivateRecordDefinitionList();
    // }

    clearFilter(): void {
        this._grid.applyFilter(undefined);
    }

    applyFilter(filter?: RevRecordMainAdapter.RecordFilterCallback): void {
        this._grid.applyFilter(filter);
    }

    protected applySettings() {
        this._table?.clearRendering();
    }

    private handleGridSourceGridLayoutSetEvent() {
        const newLayout = this._openedGridSource.lockedGridLayout;
        if (newLayout === undefined) {
            throw new AssertInternalError('GSFHGSGLCE22202');
        } else {
            this._grid.updateGridLayout(newLayout);
            this.gridLayoutSetEventer(newLayout);
        }
    }

    private applyFirstUsable() {
        let rowOrderDefinition = this._keptRowOrderDefinition;
        this._keptRowOrderDefinition = undefined;
        if (rowOrderDefinition === undefined) {
            rowOrderDefinition = this._openedGridSource.initialRowOrderDefinition;
        }
        const viewAnchor = this._keptGridRowAnchor;
        this._keptGridRowAnchor = undefined;
        this._grid.applyFirstUsable(rowOrderDefinition, viewAnchor);
    }

    // private closeTable() {
    //     if (this._table !== undefined) {
    //         if (keepCurrentLayout) {
    //             this._keptLayout = this.getGridLayout();
    //         } else {
    //             this._keptLayout = undefined;
    //         }

    //         this._tablesService.closeItem(this._table, this);

    //         this._privateNameSuffixId = undefined;
    //         this._table = undefined;
    //     }
    // }

    // private createTable() {

    // }

    // private processFirstUsable() {
    //     this._grid.setValuesBeenUsable(true);
    //     if (this._table !== undefined) {
    //         if (!this._table.beenUsable) {
    //             this._autoSizeAllColumnWidthsOnFirstUsable = true;
    //         } else {
    //             this._autoSizeAllColumnWidthsOnFirstUsable = false;
    //             // FGridDrawer.ApplyAppOptions;  // need to have font set to correctly calculate widths // todo
    //             this.autoSizeAllColumnWidths();
    //         }
    //     }
    // }

    // private createPrivateTable() {
    //     assert(this._privateTable === undefined && this.table === undefined);
    //     this._privateTable = new OpenedTable(this._tablesService.definitionFactory, this);
    //     this._table = this._privateTable;
    // }

    // private calculateNewPrivateName(): GridSourceFrame.NewPrivateName {
    //     const suffixId = GridSourceFrame.getNextNewPrivateNameSuffixId();
    //     const name = Strings[StringId.New] + suffixId.toString(10);
    //     return {
    //         name,
    //         suffixId,
    //     };
    // }

    // private prepareGrid() {
    //     if (this._table === undefined) {
    //         throw new UnexpectedUndefinedError('TFPG448443');
    //     } else {
    //         if (this._gridPrepared) {
    //             this._grid.reset();
    //         }

    //         const fieldsAndInitialStates = this._table.getGridFieldsAndInitialStates();
    //         this._recordStore.addFields(fieldsAndInitialStates.fields);

    //         const states = fieldsAndInitialStates.states;
    //         const fieldCount = states.length; // one state for each field
    //         for (let i = 0; i < fieldCount; i++) {
    //             this._grid.setFieldState(fieldsAndInitialStates.fields[i], states[i]);
    //         }
    //         this._grid.loadLayout(this._table.layout);
    //         this.updateGridSettingsFromTable();
    //         this._recordStore.recordsLoaded();

    //         this._gridPrepared = true;
    //     }
    // }

    // private activate(tableDirIdx: Integer) {
    //     if (this._table === undefined) {
    //         throw new UnexpectedUndefinedError('TFA5592245');
    //     } else {
    //         this._recordStore.beginChange();
    //         try {
    //             this.prepareGrid();
    //             if (this.isPrivate()) {
    //                 this._table.open();
    //             } else {
    //                 assert(tableDirIdx >= 0);
    //                 this._tablesService.open(tableDirIdx, this);
    //             }

    //             // this.prepareDeleteListAction();

    //         } finally {
    //             this._recordStore.endChange();
    //         }
    //     }
    // }

    // private updateGridSettingsFromTable() {
    //     if (this._table === undefined || !this._table.changeRecordDefinitionOrderAllowed) {
    //         // Grid.ClickSort = false;
    //     } else {
    //         // Grid.ClickSort = true;
    //     }
    // }

    // private prepareDeleteListAction() {
    //     const canDeleteListResult = this.canDeleteList();
    //     this.notifyDeleteListActionPrepared(canDeleteListResult.deletable, canDeleteListResult.actionHint);
    // }

    // private canDeleteList(): GridSourceFrame.CanDeleteListResult {
    //     if (this._table === undefined) {
    //         return {
    //             deletable: false,
    //             isRecordDefinitionList: false,
    //             listName: '',
    //             actionHint: Strings[StringId.NoTable]
    //         };
    //     } else {
    //         if (!this.isPrivate()) {
    //             const listName = this._table.name;
    //             const deletable = this._tablesService.isTableLocked(this._table, this);
    //             let actionHint: string;
    //             if (deletable) {
    //                 actionHint = Strings[StringId.DeleteWatchlist] + ' "' + listName + '"';
    //             } else {
    //                 actionHint = Strings[StringId.CannotDeleteWatchlist] + ' "' + listName + '"';
    //             }
    //             return {
    //                 deletable,
    //                 isRecordDefinitionList: false,
    //                 listName,
    //                 actionHint
    //             };
    //         } else {
    //             if (this._table.hasPrivateRecordDefinitionList()) {
    //                 return {
    //                     deletable: false,
    //                     isRecordDefinitionList: false,
    //                     listName: '',
    //                     actionHint: Strings[StringId.CannotDeletePrivateList]
    //                 };
    //             } else {
    //                 const recordDefinitionList = this._table.recordDefinitionList;
    //                 const listName = recordDefinitionList.name;
    //                 let actionHint: string;
    //                 let deletable: boolean;
    //                 if (recordDefinitionList.builtIn) {
    //                     deletable = false;
    //                     actionHint = Strings[StringId.CannotDeleteBuiltinList];
    //                 } else {
    //                     deletable = !this._tableRecordDefinitionListsService.isItemLocked(recordDefinitionList, this._table);
    //                     if (deletable) {
    //                         actionHint = Strings[StringId.DeleteList] + ' :' + listName;
    //                     } else {
    //                         actionHint = Strings[StringId.CannotDeleteList] + ' :' + listName;
    //                     }
    //                 }

    //                 return {
    //                     deletable,
    //                     isRecordDefinitionList: true,
    //                     listName,
    //                     actionHint
    //                 };
    //             }
    //         }
    //     }
    // }

    // private deleteList() {
    //     if (this._table !== undefined) {
    //         const canDeleteListResult = this.canDeleteList();
    //         if (canDeleteListResult.deletable) {
    //             if (!canDeleteListResult.isRecordDefinitionList) {
    //                 const idx = this._table.index;
    //                 if (idx < 0) {
    //                     throw new AssertInternalError('TFDLNID259', `${this._table.name}`);
    //                 } else {
    //                     this.closeTable(false);
    //                     if (this._tablesService.isItemAtIndexLocked(idx, undefined)) {
    //                         throw new AssertInternalError('TFDLDIS288', `${idx}`);
    //                     } else {
    //                         this._tablesService.delete(idx);
    //                     }
    //                 }
    //             } else {
    //                 const idx = this._table.recordDefinitionList.index;
    //                 if (idx < 0) {
    //                     throw new AssertInternalError('TFDLRNID897', `${this._table.recordDefinitionList.name}`);
    //                 } else {
    //                     this.closeTable(false);
    //                     if (this._tableRecordDefinitionListsService.isItemAtIndexLocked(idx, undefined)) {
    //                         throw new AssertInternalError('TFDLDISR211', `${idx}`);
    //                     } else {
    //                         this._tableRecordDefinitionListsService.deleteItemAtIndex(idx);
    //                     }
    //                 }
    //             }

    //             // this.newPrivatePortfolioItemDefinitionList(false); // this should be done elsewhere
    //         }
    //     }
    // }

    // private tryNewDefaultPrivateTable() {
    //     if (this.requireDefaultTableDefinitionEvent === undefined) {
    //         // do nothing - will remain closed
    //     } else {
    //         const tableDefinition = this.requireDefaultTableDefinitionEvent();
    //         if (tableDefinition !== undefined) {

    //             this.newPrivateTable( tableDefinition, false);
    //         }
    //     }
    // }
}

export namespace GridSourceFrame {
    export type SettingsApplyEventer = (this: void) => void;
    export type GridLayoutSetEventer = (this: void, layout: GridLayout) => void;
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined, oldRecordIndex: Integer | undefined) => void;
    export type GridClickEventer = (this: void, fieldIndex: Integer, recordIndex: Integer) => void;
    export type GridDblClickEventer = (this: void, fieldIndex: Integer, recordIndex: Integer) => void;
    // export type RequireDefaultTableDefinitionEvent = (this: void) => TableDefinition | undefined;
    // export type TableOpenEvent = (this: void, recordDefinitionList: TableRecordDefinitionList) => void;
    // export type TableOpenChangeEvent = (this: void, opened: boolean) => void;

    export type ListChangedEvent = (this: void) => void;
    export type LayoutChangedEvent = (this: void) => void;
    export type FocusedCellChangeEvent = (this: void, newFieldIdx: Integer, oldFieldIdx: Integer,
        newRecIdx: Integer, oldRecIdx: Integer, uiEvent: boolean) => void;
    export type GridKeyUpDownMessageEvent = (this: void) => void; // todo
    export type GridEnterEvent = (this: void) => void;
    export type GridExitEvent = (this: void) => void;
    export type DeleteListActionPreparedEvent = (this: void, deletable: boolean, actionHint: string) => void;

    export type FirstUsableEventer = (this: void) => void;

    export namespace JsonName {
        export const table = 'table';
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
