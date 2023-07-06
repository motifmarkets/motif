/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    GridField,
    GridLayout,
    GridLayoutDefinition,
    GridRowOrderDefinition,
    GridSortDefinition,
    Integer,
    MultiEvent,
    SettingsService,
    UnexpectedUndefinedError,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import {
    Column,
    ColumnsManager,
    DatalessSubgrid,
    LinedHoverCell,
    ListChangedTypeId,
    RevRecordField,
    RevRecordFieldIndex,
    RevRecordIndex,
    RevRecordMainDataServer,
    RevRecordStore,
    Revgrid,
    Subgrid,
    ViewCell
} from 'revgrid';
import { AllowedFieldsAndLayoutDefinition } from '../../grid-layout-editor-dialog-definition';
import { AdaptedRevgrid } from '../adapted-revgrid';
import { AdaptedRevgridBehavioredColumnSettings } from '../settings/content-adapted-revgrid-settings-internal-api';
import { RecordGridHeaderDataServer } from './record-grid-header-data-server';
import { RecordGridMainDataServer } from './record-grid-main-data-server';
import { RecordGridSchemaServer } from './record-grid-schema-server';

/**
 * Implements a Grid Adapter over the Hypergrid control
 *
 * @public
 */
export class RecordGrid extends AdaptedRevgrid implements GridLayout.ChangeInitiator {
    declare mainDataServer: RecordGridMainDataServer;
    declare headerDataServer: RecordGridHeaderDataServer;

    recordFocusedEventer: RecordGrid.RecordFocusEventer | undefined;
    mainClickEventer: RecordGrid.MainClickEventer | undefined;
    mainDblClickEventer: RecordGrid.MainDblClickEventer | undefined;
    // fieldSortedEventer: RecordGrid.FieldSortedEventer | undefined;

    // private readonly _componentAccess: RecordGrid.ComponentAccess;

    private readonly _schemaServer: RecordGridSchemaServer;
    private readonly _headerDataServer: RecordGridHeaderDataServer;
    private readonly _mainDataServer: RecordGridMainDataServer;

    private _gridLayout: GridLayout | undefined;
    private _allowedFields: readonly GridField[] | undefined;

    private _beenUsable = false;
    private _usableRendered = false;
    private _firstUsableRenderViewAnchor: RecordGrid.ViewAnchor | undefined;

    private _gridLayoutChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _gridLayoutWidthsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        // componentAccess: RecordGrid.ComponentAccess,
        settingsService: SettingsService,
        gridHostElement: HTMLElement,
        recordStore: RevRecordStore,
        customGridSettings: AdaptedRevgrid.CustomGridSettings,
        customiseSettingsForNewColumnEventer: AdaptedRevgrid.CustomiseSettingsForNewColumnEventer,
        getMainCellPainterEventer: Subgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
        getHeaderCellPainterEventer: Subgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
    ) {
        const schemaServer = new RecordGridSchemaServer();
        const headerDataServer = new RecordGridHeaderDataServer();
        const mainDataServer = new RecordGridMainDataServer(schemaServer, recordStore);
        const definition: Revgrid.Definition<AdaptedRevgridBehavioredColumnSettings, GridField> = {
            schemaServer,
            subgrids: [
                {
                    role: DatalessSubgrid.RoleEnum.header,
                    dataServer: headerDataServer,
                    getCellPainterEventer: getHeaderCellPainterEventer,
                },
                {
                    role: DatalessSubgrid.RoleEnum.main,
                    dataServer: mainDataServer,
                    getCellPainterEventer: getMainCellPainterEventer,
                },
            ],
        }

        super(settingsService, gridHostElement, definition, customGridSettings, customiseSettingsForNewColumnEventer);

        this._schemaServer = schemaServer;
        this._headerDataServer = headerDataServer;
        this._mainDataServer = mainDataServer;

        this.applySettings();
    }

    get fieldCount() { return this._schemaServer.fieldCount; }
    get fieldNames() { return this._schemaServer.getFields(); }

    get recordFocused() { return this.focus.current !== undefined; }

    get continuousFiltering(): boolean { return this._mainDataServer.continuousFiltering; }
    set continuousFiltering(value: boolean) {
        const oldContinuousFiltering =
            this._mainDataServer.continuousFiltering;
        if (value !== oldContinuousFiltering) {
            this._mainDataServer.continuousFiltering = value;

            if (value) {
                // Continuous filtering was just turned on, apply if necessary
                this._mainDataServer.recordsLoaded();
            }
        }
    }

    get rowOrderReversed() { return this._mainDataServer.rowOrderReversed; }
    set rowOrderReversed(value: boolean) {
        this._mainDataServer.rowOrderReversed = value;
    }

    get focusedRecordIndex(): RevRecordIndex | undefined {
        const focusedSubgridRowIndex = this.focus.currentY;
        if (focusedSubgridRowIndex === undefined) {
            return undefined;
        } else {
            return this._mainDataServer.getRecordIndexFromRowIndex(focusedSubgridRowIndex);
        }
    }

    set focusedRecordIndex(recordIndex: number | undefined) {
        if (recordIndex === undefined) {
            this.focus.clear();
        } else {
            const rowIndex = this._mainDataServer.getRowIndexFromRecordIndex(recordIndex);
            if (rowIndex === undefined) {
                this.focus.clear();
            } else {
                this.focus.setY(rowIndex, undefined, undefined);
            }
        }
    }

    get headerRowCount(): number { return this._headerDataServer.getRowCount(); }
    get isFiltered(): boolean { return this._mainDataServer.isFiltered; }
    get gridRightAligned(): boolean { return this.settings.gridRightAligned; }
    get rowHeight(): number { return this.settings.defaultRowHeight; }

    get rowRecIndices(): number[] {
        return [];
        // todo
    }

    override destroy(): void {
        super.destroy();
        this._mainDataServer.destroy();
    }

    fieldsLayoutReset(fields: readonly GridField[], gridLayout: GridLayout) {
        this.dataReset();
        this._allowedFields = fields;
        this.updateGridLayout(gridLayout);
    }

    dataReset() {
        this._usableRendered = false;
        this._beenUsable = false;
    }

    applyFirstUsable(rowOrderDefinition: GridRowOrderDefinition | undefined, viewAnchor: RecordGrid.ViewAnchor | undefined) {
        this._beenUsable = true;

        this._firstUsableRenderViewAnchor = viewAnchor;

        const sortFields = rowOrderDefinition?.sortFields;
        if (sortFields !== undefined) {
            this.applySortFields(sortFields);
        }
    }

    updateAllowedFields(value: readonly GridField[]) {
        this._allowedFields = value;
        if (this._gridLayout !== undefined) {
            this.updateGridSchema(value, this._gridLayout);
        }
    }

    updateGridLayout(value: GridLayout) {
        if (this._gridLayout !== undefined) {
            this._gridLayout.unsubscribeChangedEvent(this._gridLayoutChangedSubscriptionId);
            this._gridLayoutChangedSubscriptionId = undefined;
            this._gridLayout.unsubscribeWidthsChangedEvent(this._gridLayoutWidthsChangedSubscriptionId);
            this._gridLayoutChangedSubscriptionId = undefined;
        }

        this._gridLayout = value;
        this._gridLayoutChangedSubscriptionId = this._gridLayout.subscribeChangedEvent(
            (initiator) => this.processGridLayoutChangedEvent(initiator)
        );
        this._gridLayoutWidthsChangedSubscriptionId = this._gridLayout.subscribeWidthsChangedEvent(
            (initiator) => this.processGridLayoutWidthsChangedEvent(initiator)
        );

        this.processGridLayoutChangedEvent(GridLayout.forceChangeInitiator);
    }

    applyGridLayoutDefinition(value: GridLayoutDefinition) {
        if (this._gridLayout === undefined) {
            throw new AssertInternalError('RGSLD34488');
        } else {
            this._gridLayout.applyDefinition(GridLayout.forceChangeInitiator, value);
        }
    }

    createGridLayoutDefinition() {
        const activeColumns = this.activeColumns;
        const activeCount = activeColumns.length;
        const definitionColumns = new Array<GridLayoutDefinition.Column>(activeCount);

        for (let i = 0; i < activeCount; i++) {
            const activeColumn = activeColumns[i];
            const autoSizableWidth = activeColumn.autoSizing ? undefined : activeColumn.width;
            const definitionColumn: GridLayoutDefinition.Column = {
                fieldName: activeColumn.field.name,
                visible: true,
                autoSizableWidth,
            };
            definitionColumns[i] = definitionColumn;
        }
        return new GridLayoutDefinition(definitionColumns);
    }

    createAllowedFieldsAndLayoutDefinition(): AllowedFieldsAndLayoutDefinition {
        if (this._allowedFields === undefined) {
            throw new AssertInternalError('RGCAFALD56678');
        } else {
            return {
                allowedFields: this._allowedFields,
                layoutDefinition: this.createGridLayoutDefinition(),
            };
        }
    }

    getSortFields(): GridSortDefinition.Field[] | undefined {
        const specifiers = this._mainDataServer.sortFieldSpecifiers;
        const count = specifiers.length;
        if (count === 0) {
            return undefined;
        } else {
            const fieldDefinitions = new Array<GridSortDefinition.Field>(count);
            const fieldCount = this.fieldCount;
            for (let i = 0; i < count; i++) {
                const specifier = specifiers[i];
                const fieldIndex = specifier.fieldIndex;
                if (fieldIndex > fieldCount) {
                    throw new AssertInternalError('RCGSC81899');
                } else {
                    const field = this.getField(fieldIndex);
                    const fieldDefinition: GridSortDefinition.Field = {
                        name: field.name,
                        ascending: specifier.ascending,
                    };
                    fieldDefinitions[i] = fieldDefinition;
                }
            }
            return fieldDefinitions;
        }
    }

    getViewAnchor(): RecordGrid.ViewAnchor | undefined {
        if (this._usableRendered) {
            const viewLayout = this.viewLayout;
            return {
                rowScrollAnchorIndex: viewLayout.rowScrollAnchorIndex,
                columnScrollAnchorIndex: viewLayout.columnScrollAnchorIndex,
                columnScrollAnchorOffset: viewLayout.columnScrollAnchorOffset,
            };
        } else {
            return undefined;
        }
    }

    applyFilter(filter?: RevRecordMainDataServer.RecordFilterCallback): void {
        this._mainDataServer.filterCallback = filter;
    }

    // beginChange() {
    //     this.beginDataChange();
    //     this.beginSchemaChange();
    // }

    // endChange() {
    //     this.endSchemaChange();
    //     this.endDataChange();
    // }

    clearFilter(): void {
        this.applyFilter(undefined);
    }

    clearSort() {
        this._mainDataServer.clearSort();
    }

    getRowOrderDefinition(): GridRowOrderDefinition {
        const sortColumns = this.getSortFields();
        return new GridRowOrderDefinition(sortColumns, undefined);
    }

    getFieldByName(fieldName: string): RevRecordField {
        return this._schemaServer.getFieldByName(fieldName);
    }

    // getFieldNameToHeaderMap(): GridLayoutRecordStore.FieldNameToHeaderMap {
    //     const result = new Map<string, string | undefined>();
    //     const fields = this._fieldAdapter.fields;
    //     for (let i = 0; i < fields.length; i++) {
    //         const state = this.getFieldState(i);
    //         const field = fields[i];
    //         result.set(field.name, state.header);
    //     }
    //     return result;
    // }

    getField(fieldIndex: RevRecordFieldIndex): RevRecordField {
        return this._schemaServer.getField(fieldIndex);
    }

    getFieldSortPriority(field: RevRecordFieldIndex | GridField): number | undefined {
        return this._mainDataServer.getFieldSortPriority(field);
    }

    getFieldSortAscending(field: RevRecordFieldIndex | GridField): boolean | undefined {
        return this._mainDataServer.getFieldSortAscending(field);
    }

    // getFieldState(field: RevRecordFieldIndex | RevRecordField): GridRecordFieldState {
    //     const fieldIndex = typeof field === 'number' ? field : this.getFieldIndex(field);
    //     const column = this.getAllColumn(fieldIndex);
    //     const columnProperties = column.properties;

    //     return {
    //         width: !columnProperties.columnAutosized ? columnProperties.width : undefined,
    //         header: (column.schemaColumn as RevRecordField.SchemaColumn).header,
    //         alignment: columnProperties.halign,
    //     };
    // }

    // getFieldWidth(field: RevRecordFieldIndex | RevRecordField): number | undefined {
    //     const fieldIndex = typeof field === 'number' ? field : this.getFieldIndex(field);
    //     const columnProperties = this.getAllColumn(fieldIndex).properties;

    //     return !columnProperties.columnAutosized ? columnProperties.width : undefined;
    // }

    // getFieldVisible(field: RevRecordFieldIndex | RevRecordField): boolean {
    //     const fieldIndex = typeof field === 'number' ? field : this.getFieldIndex(field);
    //     const activeColumns = this.getActiveColumns();
    //     const index = activeColumns.findIndex((column) => (column.schemaColumn as RevRecordField.SchemaColumn).index === fieldIndex);
    //     return index !== -1;
    // }

    // getLayoutWithHeadersMap(): GridLayoutRecordStore.LayoutWithHeadersMap {
    //     return {
    //         layout: this.saveLayout(),
    //         headersMap: this.getFieldNameToHeaderMap(),
    //     };
    // }

    getSortSpecifier(index: number): RevRecordMainDataServer.SortFieldSpecifier {
        return this._mainDataServer.getSortSpecifier(index);
    }

    // getVisibleFields(): RevRecordFieldIndex[] {
    //     return this.getActiveColumns().map(
    //         (column) => (column.schemaColumn as RevRecordField.SchemaColumn).index
    //     );
    // }

    isHeaderRow(rowIndex: number): boolean {
        return rowIndex > this.headerRowCount;
    }

    // loadLayoutDefinition(definition: GridLayoutDefinition) {
    //     const layout = new GridLayout(this._fieldAdapter.getFieldNames());
    //     layout.applyDefinition(definition);
    //     this.loadLayout(layout);
    // }

    // loadLayout(layout: GridLayout): void {
    //     const columns = layout
    //         .getColumns()
    //         .filter((column) => this._fieldAdapter.hasField(column.field.name));

    //     // Show all visible columns. Also sets their positions
    //     // TODO: Should we care about the position of hidden columns?
    //     this.showColumns(
    //         false,
    //         columns
    //             .filter((column) => column.visible)
    //             .map((column) =>
    //                 this._fieldAdapter.getFieldIndexByName(column.field.name)
    //             )
    //     );
    //     this.showColumns(
    //         false,
    //         columns
    //             .filter((column) => !column.visible)
    //             .map((column) =>
    //                 this._fieldAdapter.getFieldIndexByName(column.field.name)
    //             ),
    //         -1
    //     );

    //     const gridColumns = this.getAllColumns();

    //     // Apply width settings
    //     for (const column of columns) {
    //         const fieldIndex = this._fieldAdapter.getFieldIndexByName(
    //             column.field.name
    //         );
    //         const gridColumn = gridColumns[fieldIndex];

    //         if (column.width === undefined) {
    //             gridColumn.checkColumnAutosizing(true);
    //         } else {
    //             gridColumn.setWidth(column.width);
    //         }
    //     }

    //     // Apply sorting
    //     const sortedColumns = columns.filter(
    //         (column) => column.sortPriority !== undefined
    //     ) as GridLayout.SortPrioritizedColumn[];

    //     if (sortedColumns.length === 0) {
    //         this.clearSort();
    //     } else {
    //         sortedColumns.sort(
    //             (left, right) => right.sortPriority - left.sortPriority
    //         );

    //         const sortSpecifiers =
    //             sortedColumns.map<RevRecordMainAdapter.SortFieldSpecifier>(
    //                 (column) => {
    //                     const fieldIndex =
    //                         this._fieldAdapter.getFieldIndexByName(
    //                             column.field.name
    //                         );
    //                     return {
    //                         fieldIndex,
    //                         ascending: column.sortAscending === true,
    //                     };
    //                 }
    //             );

    //         this.sortByMany(sortSpecifiers);
    //     }

    //     // this._hypegrid.renderer.resetAllCellPropertiesCaches();
    //     this._mainRecordAdapter.recordsLoaded();
    // }

    override reset(): void {
        this._schemaServer.reset();
        this._mainDataServer.reset();
        super.reset();
    }

    recordToRowIndex(recIdx: RevRecordIndex): number {
        const rowIdx =
            this._mainDataServer.getRowIndexFromRecordIndex(recIdx);
        if (rowIdx === undefined) {
            throw new UnexpectedUndefinedError('DMIRTRI34449');
        } else {
            return rowIdx;
        }
        // return this._rowLookup.getLeftIndex(recIdx);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reorderRecRows(itemIndices: number[]) {
        // todo
    }

    rowToRecordIndex(rowIdx: number): Integer {
        return this._mainDataServer.getRecordIndexFromRowIndex(rowIdx);
    }

    // saveLayoutDefinition() {
    //     const layout = this.saveLayout();
    //     return layout.createDefinition();
    // }

    // saveLayout(): GridLayout {
    //     const layout = new GridLayout(this._fieldAdapter.getFieldNames());

    //     // Apply the order of the visible columns
    //     const visibleColumnFields = this.getActiveColumns().map((column) =>
    //         this._fieldAdapter.getFieldByName(column.schemaColumn.name)
    //     );
    //     layout.setFieldColumnsByFieldNames(
    //         visibleColumnFields.map<string>((field) => field.name)
    //     );

    //     // Hide all hidden fields
    //     const visibleSet = new Set(visibleColumnFields);
    //     const hiddenColumnFields = this._fieldAdapter.getFilteredFields(
    //         (field) => !visibleSet.has(field)
    //     );
    //     layout.setFieldsVisible(
    //         hiddenColumnFields.map((field) => field.name),
    //         false
    //     );

    //     // Apply width settings
    //     for (const column of this.getAllColumns()) {
    //         const field = this._fieldAdapter.getFieldByName(
    //             column.schemaColumn.name
    //         );
    //         const columnProperties = column.properties;

    //         if (columnProperties.columnAutosizing && columnProperties.columnAutosized) {
    //             layout.setFieldWidthByFieldName(field.name);
    //         } else {
    //             layout.setFieldWidthByFieldName(
    //                 field.name,
    //                 columnProperties.width
    //             );
    //         }
    //     }

    //     // Apply the sorting
    //     layout.setFieldSorting(this._mainRecordAdapter.sortFieldSpecifiers);

    //     return layout;
    // }

    // setColumnWidth(indexOrColumn: number | Column, width: number): void {
    //     const widthChangedColumn = this._hypegrid.setActiveColumnWidth(indexOrColumn, width);
    //     if (this.columnWidthChangedEventer !== undefined && widthChangedColumn !== undefined) {
    //         this.columnWidthChangedEventer(widthChangedColumn.index);
    //     }
    // }

    // setFieldState(field: RevRecordField, state: GridRecordFieldState): void {
    //     // const fieldIndex = typeof field === 'number' ? field : this.getFieldIndex(field);
    //     const fieldIndex = this.getFieldIndex(field);

    //     if (state === undefined) {
    //         state = {};
    //     }

    //     const columnIndex = this.getActiveColumnIndexUsingFieldIndex(fieldIndex);

    //     if (columnIndex < 0) {
    //         return;
    //     }

    //     const column = this.getAllColumn(columnIndex);

    //     // Update the schema
    //     const header = state.header ?? field.name;
    //     this.setFieldHeader(fieldIndex, header);

    //     // Update any properties
    //     if (state.alignment !== undefined) {
    //         column.properties.halign = state.alignment;
    //     }

    //     // Update the width
    //     if (state.width === undefined) {
    //         column.checkColumnAutosizing(true);
    //     } else {
    //         column.setWidth(state.width);
    //     }

    //     // Update Hypergrid schema
    //     // if (this.updateCounter == 0 && this.dispatchEvent !== undefined)
    //     // 	this.dispatchEvent('fin-hypergrid-schema-loaded');
    // }

    // setFieldsVisible(fields: (RevRecordFieldIndex | RevRecordField)[], visible: boolean): void {
    //     const fieldIndexes = fields.map((field) =>
    //         typeof field === 'number' ? field : this.getFieldIndex(field)
    //     );

    //     if (visible) {
    //         this.showColumns(false, fieldIndexes);
    //     } else {
    //         this.showColumns(false, fieldIndexes, -1);
    //     }
    // }

    // setFieldWidth(field: RevRecordFieldIndex | RevRecordField, width?: number): void {
    //     const fieldIndex = typeof field === 'number' ? field : this.getFieldIndex(field);
    //     const column = this.getAllColumn(fieldIndex);

    //     if (width === undefined) {
    //         column.checkColumnAutosizing(true);
    //     } else {
    //         column.setWidth(width);
    //     }
    // }

    // setFieldVisible(field: RevRecordFieldIndex | RevRecordField, visible: boolean): void {
    //     const fieldIndex = typeof field === 'number' ? field : this.getFieldIndex(field);
    //     const column = this.getActiveColumns().find((activeColumn) => activeColumn.index === fieldIndex);

    //     if ((column !== undefined) === visible) {
    //         return;
    //     } // Visibility remains unchanged

    //     // Are we hiding the column?
    //     if (column !== undefined) {
    //         this.showColumns(false, fieldIndex, -1);
    //         return;
    //     }

    //     // No, so we're showing it
    //     // TODO: Work out roughly where to insert it. At the moment it goes on the end
    //     this.showColumns(false, fieldIndex);
    // }

    sortBy(fieldIndex?: number, isAscending?: boolean): boolean {
        return this._mainDataServer.sortBy(fieldIndex, isAscending);
    }

    sortByMany(specifiers: RevRecordMainDataServer.SortFieldSpecifier[]): boolean {
        return this._mainDataServer.sortByMany(specifiers);
    }

    protected override descendantProcessColumnSort(_event: MouseEvent, headerOrFixedRowCell: ViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        this.sortBy(headerOrFixedRowCell.viewLayoutColumn.column.field.index);
    }

    protected override descendantProcessClick(_event: MouseEvent, hoverCell: LinedHoverCell<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        if (this.mainClickEventer !== undefined) {
            if (!LinedHoverCell.isMouseOverLine(hoverCell)) { // skip clicks on grid lines
                const cell = hoverCell.viewCell;
                if (!cell.isHeaderOrRowFixed) { // Skip clicks to the column headers
                    const rowIndex = cell.viewLayoutRow.subgridRowIndex;
                    const recordIndex = this._mainDataServer.getRecordIndexFromRowIndex(rowIndex);
                    const fieldIndex = cell.viewLayoutColumn.column.field.index;
                    this.mainClickEventer(fieldIndex, recordIndex);
                }
            }
        }
    }

    protected override descendantProcessDblClick(_event: MouseEvent, hoverCell: LinedHoverCell<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        if (this.mainDblClickEventer !== undefined) {
            if (!LinedHoverCell.isMouseOverLine(hoverCell)) { // skip clicks on grid lines
                const cell = hoverCell.viewCell;
                if (!cell.isHeaderOrRowFixed) { // Skip clicks to the column headers
                    const rowIndex = cell.viewLayoutRow.subgridRowIndex;
                    const recordIndex = this._mainDataServer.getRecordIndexFromRowIndex(rowIndex);
                    const fieldIndex = cell.viewLayoutColumn.column.field.index;
                    this.mainDblClickEventer(fieldIndex, recordIndex);
                }
            }
        }
    }

    protected override descendantProcessRowFocusChanged(newSubgridRowIndex: number | undefined, oldSubgridRowIndex: number | undefined) {
        if (this.recordFocusedEventer !== undefined) {
            this.recordFocusedEventer(newSubgridRowIndex, oldSubgridRowIndex);
        }
    }

    protected override descendantProcessRendered() {
        if (!this._usableRendered && this._beenUsable) {
            this._usableRendered = true;

            if (this._firstUsableRenderViewAnchor !== undefined) {
                this.viewLayout.setColumnScrollAnchor(
                    this._firstUsableRenderViewAnchor.columnScrollAnchorIndex,
                    this._firstUsableRenderViewAnchor.columnScrollAnchorOffset
                );
                this.viewLayout.setRowScrollAnchor(this._firstUsableRenderViewAnchor.rowScrollAnchorIndex, 0);
                this._firstUsableRenderViewAnchor = undefined;
            }
        }
    }

    protected override descendantProcessActiveColumnListChanged(
        typeId: ListChangedTypeId,
        index: number,
        count: number,
        targetIndex: number | undefined,
        ui: boolean,
    ) {
        if (ui) {
            if (this._gridLayout === undefined) {
                throw new AssertInternalError('RGPACLC56678');
            } else {
                switch (typeId) {
                    case ListChangedTypeId.Move: {
                        if (targetIndex === undefined) {
                            throw new AssertInternalError('RGPACCLCM44430');
                        } else {
                            this._gridLayout.moveColumns(this, index, count, targetIndex);
                            break;
                        }
                    }
                    case ListChangedTypeId.Clear: {
                        this._gridLayout.clearColumns(this);
                        break;
                    }
                    case ListChangedTypeId.Insert:
                    case ListChangedTypeId.Remove:
                    case ListChangedTypeId.Set: {
                        const definition = this.createGridLayoutDefinition();
                        this._gridLayout.applyDefinition(this, definition);
                        break;
                    }
                    default:
                        throw new UnreachableCaseError('RGPACCLCU44430', typeId);
                }
            }
        }
    }

    protected override descendantProcessColumnsWidthChanged(columns: Column<AdaptedRevgridBehavioredColumnSettings, GridField>[], ui: boolean) {
        if (ui) {
            if (this._gridLayout === undefined) {
                throw new AssertInternalError('RGPCWC56678');
            } else {
                this._gridLayout.beginChange(this);
                for (const column of columns) {
                    this._gridLayout.setColumnWidth(this, column.field.name, column.width);
                }
                this._gridLayout.endChange();
            }
        }
    }

    protected override applySettings() {
        const result = super.applySettings();

        const coreSettings = this._settingsService.core;
        this._mainDataServer.allChangedRecentDuration = coreSettings.grid_AllChangedRecentDuration;
        this._mainDataServer.recordInsertedRecentDuration = coreSettings.grid_RecordInsertedRecentDuration;
        this._mainDataServer.recordUpdatedRecentDuration = coreSettings.grid_RecordUpdatedRecentDuration;
        this._mainDataServer.valueChangedRecentDuration = coreSettings.grid_ValueChangedRecentDuration;

        // this._componentAccess.applySettings();

        return result;
    }

    protected override invalidateAll() {
        this._mainDataServer.invalidateAll();
    }

    private applySortFields(sortFields: GridSortDefinition.Field[] | undefined) {
        if (sortFields === undefined) {
            this._mainDataServer.clearSort();
        } else {
            const maxCount = sortFields.length;
            if (maxCount === 0) {
                this._mainDataServer.clearSort();
            } else {
                const specifiers = new Array<RevRecordMainDataServer.SortFieldSpecifier>(maxCount);
                let count = 0;
                for (let i = 0; i < maxCount; i++) {
                    const field = sortFields[i];
                    const fieldIndex = this._schemaServer.getFieldIndexByName(field.name);
                    if (fieldIndex >= 0) {
                        specifiers[count++] = {
                            fieldIndex,
                            ascending: field.ascending,
                        };
                    }
                }
                if (count === 0) {
                    this._mainDataServer.clearSort();
                } else {
                    specifiers.length = count;
                    this._mainDataServer.sortByMany(specifiers);
                }
            }
        }
    }


    private processGridLayoutChangedEvent(initiator: GridLayout.ChangeInitiator) {
        if (initiator !== this) {
            if (this._allowedFields !== undefined) {
                if (this._gridLayout === undefined) {
                    throw new AssertInternalError('RGPGLCE56678');
                } else {
                    this.updateGridSchema(this._allowedFields, this._gridLayout);
                }
            }
        }
    }

    private processGridLayoutWidthsChangedEvent(initiator: GridLayout.ChangeInitiator) {
        if (initiator !== this) {
            const columnNameWidths = this.createColumnNameWidths();
            this.setColumnWidthsByName(columnNameWidths);
        }
    }

    private createColumnNameWidths() {
        if (this._gridLayout === undefined) {
            throw new AssertInternalError('RGCCNW56678');
        } else {
            const schemaFieldNames = this._schemaServer.getFieldNames();
            const columns = this._gridLayout.columns;
            const maxCount = columns.length;
            const columnNameWidths = new Array<ColumnsManager.FieldNameAndAutoSizableWidth>(maxCount);
            let count = 0;
            for (let i = 0; i < maxCount; i++) {
                const column = columns[i];
                const fieldName = column.fieldName;
                if (schemaFieldNames.includes(fieldName)) {
                    const columnNameWidth: ColumnsManager.FieldNameAndAutoSizableWidth = {
                        name: fieldName,
                        autoSizableWidth: column.width,
                    };
                    columnNameWidths[count++] = columnNameWidth;
                }
            }
            columnNameWidths.length = count;
            return columnNameWidths;
        }
    }

    private updateGridSchema(allowedFields: readonly GridField[], gridLayout: GridLayout) {
        const layoutColumnCount = gridLayout.columnCount;
        const layoutColumns = gridLayout.columns;
        const schemaFields = new Array<GridField>(layoutColumnCount);
        let count = 0;
        for (let i = 0; i < layoutColumnCount; i++) {
            const column = layoutColumns[i];
            const fieldName = column.fieldName;
            const foundField = allowedFields.find((field) => field.name === fieldName);
            if (foundField !== undefined) {
                schemaFields[count++] = foundField;
            }
        }
        schemaFields.length = count;
        this._schemaServer.setFields(schemaFields);
    }

    // /** @internal */
    // private createGridPropertiesFromSettings(settings: Partial<GridSettings>): Partial<GridProperties> {
    //     const properties: Partial<GridProperties> = {};

    //     if (settings.fontFamily !== undefined) {
    //         if (settings.fontSize !== undefined) {
    //             const font = settings.fontSize + ' ' + settings.fontFamily;
    //             properties.font = font;
    //             properties.foregroundSelectionFont = font;
    //         }

    //         if (settings.columnHeaderFontSize !== undefined) {
    //             const font = settings.columnHeaderFontSize + ' ' + settings.fontFamily;
    //             properties.columnHeaderFont = font;
    //             properties.columnHeaderForegroundSelectionFont = font;
    //             properties.filterFont = font;
    //         }
    //     }

    //     if (settings.defaultRowHeight !== undefined) {
    //         properties.defaultRowHeight = settings.defaultRowHeight;
    //     }

    //     if (settings.cellPadding !== undefined) {
    //         properties.cellPadding = settings.cellPadding;
    //     }
    //     if (settings.fixedColumnCount !== undefined) {
    //         properties.fixedColumnCount = settings.fixedColumnCount;
    //     }
    //     if (settings.visibleColumnWidthAdjust !== undefined) {
    //         properties.visibleColumnWidthAdjust = settings.visibleColumnWidthAdjust;
    //     }
    //     if (settings.gridRightAligned !== undefined) {
    //         properties.gridRightAligned = settings.gridRightAligned;
    //     }

    //     if (settings.showHorizontalGridLines !== undefined) {
    //         properties.gridLinesH = settings.showHorizontalGridLines;
    //     }
    //     if (settings.gridLineHorizontalWeight !== undefined) {
    //         properties.gridLinesHWidth = settings.gridLineHorizontalWeight;
    //     }
    //     if (settings.showVerticalGridLines !== undefined) {
    //         properties.gridLinesV = settings.showVerticalGridLines;
    //     }
    //     if (settings.gridLineVerticalWeight !== undefined) {
    //         properties.gridLinesVWidth = settings.gridLineVerticalWeight;
    //     }

    //     if (settings.scrollHorizontallySmoothly !== undefined) {
    //         properties.scrollHorizontallySmoothly = settings.scrollHorizontallySmoothly;
    //     }

    //     const colorMap = settings.colorMap;
    //     if (colorMap !== undefined) {
    //         properties.backgroundColor = colorMap.bkgdBase;
    //         properties.color = colorMap.foreBase;
    //         properties.columnHeaderBackgroundColor = colorMap.bkgdColumnHeader;
    //         properties.columnHeaderColor = colorMap.foreColumnHeader;
    //         properties.backgroundSelectionColor = colorMap.bkgdSelection;
    //         properties.foregroundSelectionColor = colorMap.foreSelection;
    //         properties.columnHeaderBackgroundSelectionColor = colorMap.bkgdColumnHeaderSelection;
    //         properties.columnHeaderForegroundSelectionColor = colorMap.foreColumnHeaderSelection;
    //         properties.selectionRegionOutlineColor = colorMap.foreFocusedCellBorder;
    //         properties.gridLinesHColor = colorMap.foreVerticalLine;
    //         properties.gridLinesVColor = colorMap.foreHorizontalLine;
    //         properties.fixedLinesHColor = colorMap.foreVerticalLine;
    //         properties.fixedLinesVColor = colorMap.foreHorizontalLine;
    //         // uncomment below when row stripes are working
    //         // properties.rowStripes = [
    //         //     {
    //         //         backgroundColor: colorMap.bkgdBase,
    //         //     },
    //         //     {
    //         //         backgroundColor: colorMap.bkgdBaseAlt,
    //         //     }
    //         // ];
    //     }

    //     return properties;
    // }

    private getActiveColumnIndexUsingFieldIndex(fieldIndex: RevRecordFieldIndex): number {
        return this.getActiveColumnIndexByFieldIndex(fieldIndex);
    }
}

/** @public */
export namespace RecordGrid {
    export interface ViewAnchor {
        readonly columnScrollAnchorIndex: Integer;
        readonly columnScrollAnchorOffset: Integer;
        readonly rowScrollAnchorIndex: Integer;
    }

    export type RecordFocusEventer = (
        this: void,
        newRecordIndex: RevRecordIndex | undefined,
        oldRecordIndex: RevRecordIndex | undefined
    ) => void;
    export type MainClickEventer = (
        this: void,
        fieldIndex: RevRecordFieldIndex,
        recordIndex: RevRecordIndex
    ) => void;
    export type MainDblClickEventer = (
        this: void,
        fieldIndex: RevRecordFieldIndex,
        recordIndex: RevRecordIndex
    ) => void;
    export type FieldSortedEventer = (this: void) => void;

    // export interface LayoutWithHeadersMap {
    //     layout: GridLayout;
    //     headersMap: FieldNameToHeaderMap;
    // }

    // export interface ComponentAccess {
    //     applySettings(): void;
    // }
}
