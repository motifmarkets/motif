import {
    AssertInternalError, GridField, GridLayout,
    GridLayoutDefinition,
    GridLayoutRecordStore, MultiEvent,
    SettingsService,
    UnexpectedUndefinedError
} from '@motifmarkets/motif-core';
import {
    CellEvent,
    Column,
    EventDetail,
    GridProperties,
    Revgrid,
    RevRecordCellAdapter,
    RevRecordField,
    RevRecordFieldAdapter,
    RevRecordFieldIndex,
    RevRecordHeaderAdapter,
    RevRecordIndex,
    RevRecordMainAdapter,
    RevRecordStore,
    SelectionDetail,
    Subgrid
} from 'revgrid';
import { AdaptedRevgrid } from '../adapted-revgrid';
import { RecordGridCellPainter } from './record-grid-cell-painter';

/**
 * Implements a Grid Adapter over the Hypergrid control
 *
 * @public
 */
export class RecordGrid extends AdaptedRevgrid implements GridLayout.ChangeInitiator {
    fieldSortedEventer: RecordGrid.FieldSortedEventer | undefined;

    private readonly _componentAccess: RecordGrid.ComponentAccess;

    private readonly _fieldAdapter: RevRecordFieldAdapter;
    private readonly _headerRecordAdapter: RevRecordHeaderAdapter;
    private readonly _mainRecordAdapter: RevRecordMainAdapter;

    private _layout: GridLayout;
    private _allowedFields: readonly GridField[];

    private _lastNotifiedFocusedRecordIndex: number | undefined;

    private _layoutChangeSubscriptionId: MultiEvent.SubscriptionId;

    private _recordFocusEventer: RecordGrid.RecordFocusEventer | undefined;
    private _mainClickEventer: RecordGrid.MainClickEventer | undefined;
    private _mainDblClickEventer: RecordGrid.MainDblClickEventer | undefined;

    private readonly _selectionChangedListener: (event: CustomEvent<SelectionDetail>) => void;
    private readonly _clickListener: (event: CustomEvent<CellEvent>) => void;
    private readonly _dblClickListener: (event: CustomEvent<CellEvent>) => void;
    private readonly _columnSortListener: (event: CustomEvent<EventDetail.ColumnSort>) => void;

    constructor(
        componentAccess: RecordGrid.ComponentAccess,
        settingsService: SettingsService,
        gridElement: HTMLElement,
        recordStore: RevRecordStore,
        mainCellPainter: RecordGridCellPainter,
        gridProperties: Partial<GridProperties>
    ) {
        const fieldAdapter = new RevRecordFieldAdapter(recordStore);
        const headerRecordAdapter = new RevRecordHeaderAdapter();
        const mainRecordAdapter = new RevRecordMainAdapter(fieldAdapter, recordStore);
        const recordCellAdapter = new RevRecordCellAdapter(mainRecordAdapter, mainCellPainter);

        const options: Revgrid.Options = {
            adapterSet: {
                schemaModel: fieldAdapter,
                subgrids: [
                    {
                        role: Subgrid.RoleEnum.header,
                        dataModel: headerRecordAdapter,
                    },
                    {
                        role: Subgrid.RoleEnum.main,
                        dataModel: mainRecordAdapter,
                        cellModel: recordCellAdapter,
                    },
                ],
            },
            gridProperties,
            loadBuiltinFinbarStylesheet: false,
        };

        super(settingsService, gridElement, options);

        this._componentAccess = componentAccess;

        this._fieldAdapter = fieldAdapter;
        this._headerRecordAdapter = headerRecordAdapter;
        this._mainRecordAdapter = mainRecordAdapter;

        this._selectionChangedListener = (event) => this.handleHypegridSelectionChanged(event);
        this._clickListener = (event) => this.handleHypegridClickEvent(event);
        this._dblClickListener = (event) => this.handleHypegridDblClickEvent(event);
        this._columnSortListener = (event) => this.handleHypegridColumnSortEvent(event.detail.column);

        this.applySettings();
        // this.applySettingsToMainRecordAdapter();

        this.allowEvents(true);

        this.addEventListener('rev-column-sort', this._columnSortListener);
    }

    get fieldNames() { return this._fieldAdapter.getFieldNames(); }

    get recordFocused() {
        const selections = this.selections;
        return selections !== null && selections.length > 0;
    }

    get sortable(): boolean {
        return this.properties.sortable;
    }
    set sortable(value: boolean) {
        this.properties.sortable = value;
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get continuousFiltering(): boolean {
        return this._mainRecordAdapter.continuousFiltering;
    }
    set continuousFiltering(value: boolean) {
        const oldContinuousFiltering =
            this._mainRecordAdapter.continuousFiltering;
        if (value !== oldContinuousFiltering) {
            this._mainRecordAdapter.continuousFiltering = value;

            if (value) {
                // Continuous filtering was just turned on, apply if necessary
                this._mainRecordAdapter.recordsLoaded();
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get rowOrderReversed() {
        return this._mainRecordAdapter.rowOrderReversed;
    }
    set rowOrderReversed(value: boolean) {
        this._mainRecordAdapter.rowOrderReversed = value;
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get fieldCount(): number {
        return this._fieldAdapter.fieldCount;
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get fixedCols(): number {
        return this.getFixedColumnCount();
    }
    set fixedCols(value: number) {
        this.setFixedColumnCount(value);
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get fixedRows(): number {
        return this.getFixedRowCount();
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get focusedRecordIndex(): RevRecordIndex | undefined {
        const selections = this.selections;

        if (selections === null || selections.length === 0) {
            return undefined;
        } else {
            const rowIndex = selections[0].firstSelectedCell.y;

            // Following test probably not required as RevGrid now adjusts the current selection index if rows are deleted
            if (rowIndex >= this._mainRecordAdapter.rowCount) {
                return undefined;
            } else {
                return this._mainRecordAdapter.getRecordIndexFromRowIndex(
                    rowIndex
                );
            }
        }
    }

    set focusedRecordIndex(recordIndex: number | undefined) {
        if (recordIndex === undefined) {
            this.clearSelections();
        } else {
            const rowIndex =
                this._mainRecordAdapter.getRowIndexFromRecordIndex(recordIndex);

            if (rowIndex === undefined) {
                this.clearSelections();
            } else {
                this.selectRows(rowIndex, rowIndex);
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get headerRowCount(): number {
        return this._headerRecordAdapter.getRowCount();
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get isFiltered(): boolean {
        return this._mainRecordAdapter.isFiltered;
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get sortColumns(): number {
        return this._mainRecordAdapter.sortColumnCount;
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get gridRightAligned(): boolean {
        return this.properties.gridRightAligned;
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get rowHeight(): number {
        return this.properties.defaultRowHeight;
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get recordFocusEventer() {
        return this._recordFocusEventer;
    }
    set recordFocusEventer(value: RecordGrid.RecordFocusEventer | undefined) {
        if (this._recordFocusEventer !== undefined) {
            this.removeEventListener('rev-selection-changed', this._selectionChangedListener);
        }
        this._recordFocusEventer = value;

        if (this._recordFocusEventer !== undefined) {
            this.addEventListener('rev-selection-changed', this._selectionChangedListener);
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get mainClickEventer() {
        return this._mainClickEventer;
    }
    set mainClickEventer(value: RecordGrid.MainClickEventer | undefined) {
        if (this._mainClickEventer !== undefined) {
            this.removeEventListener('rev-click', this._clickListener);
        }
        this._mainClickEventer = value;

        if (this._mainClickEventer !== undefined) {
            this.addEventListener('rev-click', this._clickListener);
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get mainDblClickEventer() {
        return this._mainDblClickEventer;
    }
    set mainDblClickEventer(value: RecordGrid.MainDblClickEventer | undefined) {
        if (this._mainDblClickEventer !== undefined) {
            this.removeEventListener(
                'rev-double-click',
                this._dblClickListener
            );
        }
        this._mainDblClickEventer = value;

        if (this._mainDblClickEventer !== undefined) {
            this.addEventListener('rev-double-click', this._dblClickListener);
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get rowRecIndices(): number[] {
        return [];
        // todo
    }

    override destroy(): void {
        super.destroy();
        this._mainRecordAdapter.destroy();
    }

    setAllowedFields(value: readonly GridField[]) {
        this._allowedFields = value;
        if (this._layout !== undefined) {
            this.updateGridSchema();
        }
    }

    setLayout(value: GridLayout) {
        if (this._layout !== undefined) {
            this._layout.unsubscribeChangedEvent(this._layoutChangeSubscriptionId);
            this._layoutChangeSubscriptionId = undefined;
        }

        this._layout = value;
        this._layoutChangeSubscriptionId = this._layout.subscribeChangedEvent((initiator) => this.processLayoutChangedEvent(initiator));

        this.processLayoutChangedEvent(GridLayout.forceChangeInitiator);
    }

    setLayoutDefinition(value: GridLayoutDefinition) {
        if (this._layout === undefined) {
            throw new AssertInternalError('RGSLD34488');
        } else {
            this._layout.applyDefinition(GridLayout.forceChangeInitiator, value);
        }
    }

    applyFilter(filter?: RevRecordMainAdapter.RecordFilterCallback): void {
        this._mainRecordAdapter.filterCallback = filter;
    }

    autoSizeFieldColumnWidth(field: RevRecordField): void {
        const fieldIndex = this._fieldAdapter.getFieldIndex(field);
        const columnIndex = this.getActiveColumnIndexUsingFieldIndex(fieldIndex);

        if (columnIndex < 0) {
            throw new RangeError('Field is not visible');
        }

        this.autosizeColumn(columnIndex);
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
        this._mainRecordAdapter.clearSort();
    }

    getFieldByName(fieldName: string): RevRecordField {
        return this._fieldAdapter.getFieldByName(fieldName);
    }

    getFieldIndex(field: RevRecordField): RevRecordFieldIndex {
        return this._fieldAdapter.getFieldIndex(field);
    }

    getFieldNameToHeaderMap(): GridLayoutRecordStore.FieldNameToHeaderMap {
        const result = new Map<string, string | undefined>();
        const fields = this._fieldAdapter.fields;
        for (let i = 0; i < fields.length; i++) {
            const state = this.getFieldState(i);
            const field = fields[i];
            result.set(field.name, state.header);
        }
        return result;
    }

    getField(fieldIndex: RevRecordFieldIndex): RevRecordField {
        return this._fieldAdapter.getField(fieldIndex);
    }

    getFields(): readonly RevRecordField[] {
        return this._fieldAdapter.fields;
    }

    getFieldSortPriority(field: RevRecordFieldIndex | RevRecordField): number | undefined {
        return this._mainRecordAdapter.getFieldSortPriority(field);
    }

    getFieldSortAscending(field: RevRecordFieldIndex | RevRecordField): boolean | undefined {
        return this._mainRecordAdapter.getFieldSortAscending(field);
    }

    getFieldState(field: RevRecordFieldIndex | RevRecordField): GridRecordFieldState {
        const fieldIndex = typeof field === 'number' ? field : this.getFieldIndex(field);
        const column = this.getAllColumn(fieldIndex);
        const columnProperties = column.properties;

        return {
            width: !columnProperties.columnAutosized ? columnProperties.width : undefined,
            header: (column.schemaColumn as RevRecordField.SchemaColumn).header,
            alignment: columnProperties.halign,
        };
    }

    getFieldWidth(field: RevRecordFieldIndex | RevRecordField): number | undefined {
        const fieldIndex = typeof field === 'number' ? field : this.getFieldIndex(field);
        const columnProperties = this.getAllColumn(fieldIndex).properties;

        return !columnProperties.columnAutosized ? columnProperties.width : undefined;
    }

    getFieldVisible(field: RevRecordFieldIndex | RevRecordField): boolean {
        const fieldIndex = typeof field === 'number' ? field : this.getFieldIndex(field);
        const activeColumns = this.getActiveColumns();
        const index = activeColumns.findIndex((column) => (column.schemaColumn as RevRecordField.SchemaColumn).index === fieldIndex);
        return index !== -1;
    }

    getLayoutWithHeadersMap(): GridLayoutRecordStore.LayoutWithHeadersMap {
        return {
            layout: this.saveLayout(),
            headersMap: this.getFieldNameToHeaderMap(),
        };
    }

    getSortSpecifier(index: number): RevRecordMainAdapter.SortFieldSpecifier {
        return this._mainRecordAdapter.getSortSpecifier(index);
    }

    getVisibleFields(): RevRecordFieldIndex[] {
        return this.getActiveColumns().map(
            (column) => (column.schemaColumn as RevRecordField.SchemaColumn).index
        );
    }

    isHeaderRow(rowIndex: number): boolean {
        return rowIndex > this.headerRowCount;
    }

    loadLayoutDefinition(definition: GridLayoutDefinition) {
        const layout = new GridLayout(this._fieldAdapter.getFieldNames());
        layout.applyDefinition(definition);
        this.loadLayout(layout);
    }

    loadLayout(layout: GridLayout): void {
        const columns = layout
            .getColumns()
            .filter((column) => this._fieldAdapter.hasField(column.field.name));

        // Show all visible columns. Also sets their positions
        // TODO: Should we care about the position of hidden columns?
        this.showColumns(
            false,
            columns
                .filter((column) => column.visible)
                .map((column) =>
                    this._fieldAdapter.getFieldIndexByName(column.field.name)
                )
        );
        this.showColumns(
            false,
            columns
                .filter((column) => !column.visible)
                .map((column) =>
                    this._fieldAdapter.getFieldIndexByName(column.field.name)
                ),
            -1
        );

        const gridColumns = this.getAllColumns();

        // Apply width settings
        for (const column of columns) {
            const fieldIndex = this._fieldAdapter.getFieldIndexByName(
                column.field.name
            );
            const gridColumn = gridColumns[fieldIndex];

            if (column.width === undefined) {
                gridColumn.checkColumnAutosizing(true);
            } else {
                gridColumn.setWidth(column.width);
            }
        }

        // Apply sorting
        const sortedColumns = columns.filter(
            (column) => column.sortPriority !== undefined
        ) as GridLayout.SortPrioritizedColumn[];

        if (sortedColumns.length === 0) {
            this.clearSort();
        } else {
            sortedColumns.sort(
                (left, right) => right.sortPriority - left.sortPriority
            );

            const sortSpecifiers =
                sortedColumns.map<RevRecordMainAdapter.SortFieldSpecifier>(
                    (column) => {
                        const fieldIndex =
                            this._fieldAdapter.getFieldIndexByName(
                                column.field.name
                            );
                        return {
                            fieldIndex,
                            ascending: column.sortAscending === true,
                        };
                    }
                );

            this.sortByMany(sortSpecifiers);
        }

        // this._hypegrid.renderer.resetAllCellPropertiesCaches();
        this._mainRecordAdapter.recordsLoaded();
    }

    moveFieldColumn(
        field: RevRecordFieldIndex | RevRecordField,
        toColumnIndex: number
    ): void {
        const fieldIndex =
            typeof field === 'number' ? field : this.getFieldIndex(field);
        const fromColumnIndex =
            this.getActiveColumnIndexUsingFieldIndex(fieldIndex);

        if (fromColumnIndex < 0) {
            throw new AssertInternalError(
                'MGMFC89952',
                `${fieldIndex}, ${this._fieldAdapter.getField(fieldIndex).name}`
            );
        }

        this.moveActiveColumn(fromColumnIndex, toColumnIndex);
    }

    override reset(adapterSet?: GridProperties.AdapterSet): void {
        if (this._fieldAdapter !== undefined) {
            // will be undefined while grid is being constructed
            this._fieldAdapter.reset();
        }
        if (this._mainRecordAdapter !== undefined) {
            // will be undefined while grid is being constructed
            this._mainRecordAdapter.reset();
        }
        super.reset(adapterSet, undefined, false);
    }

    recordToRowIndex(recIdx: RevRecordIndex): number {
        const rowIdx =
            this._mainRecordAdapter.getRowIndexFromRecordIndex(recIdx);
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

    rowToRecordIndex(rowIdx: number): number {
        const recIdx =
            this._mainRecordAdapter.getRecordIndexFromRowIndex(rowIdx);
        if (recIdx === undefined) {
            throw new UnexpectedUndefinedError('DMIRTRI34448');
        } else {
            return recIdx;
        }
    }

    saveLayoutDefinition() {
        const layout = this.saveLayout();
        return layout.createDefinition();
    }

    saveLayout(): GridLayout {
        const layout = new GridLayout(this._fieldAdapter.getFieldNames());

        // Apply the order of the visible columns
        const visibleColumnFields = this.getActiveColumns().map((column) =>
            this._fieldAdapter.getFieldByName(column.schemaColumn.name)
        );
        layout.setFieldColumnsByFieldNames(
            visibleColumnFields.map<string>((field) => field.name)
        );

        // Hide all hidden fields
        const visibleSet = new Set(visibleColumnFields);
        const hiddenColumnFields = this._fieldAdapter.getFilteredFields(
            (field) => !visibleSet.has(field)
        );
        layout.setFieldsVisible(
            hiddenColumnFields.map((field) => field.name),
            false
        );

        // Apply width settings
        for (const column of this.getAllColumns()) {
            const field = this._fieldAdapter.getFieldByName(
                column.schemaColumn.name
            );
            const columnProperties = column.properties;

            if (columnProperties.columnAutosizing && columnProperties.columnAutosized) {
                layout.setFieldWidthByFieldName(field.name);
            } else {
                layout.setFieldWidthByFieldName(
                    field.name,
                    columnProperties.width
                );
            }
        }

        // Apply the sorting
        layout.setFieldSorting(this._mainRecordAdapter.sortFieldSpecifiers);

        return layout;
    }

    // setColumnWidth(indexOrColumn: number | Column, width: number): void {
    //     const widthChangedColumn = this._hypegrid.setActiveColumnWidth(indexOrColumn, width);
    //     if (this.columnWidthChangedEventer !== undefined && widthChangedColumn !== undefined) {
    //         this.columnWidthChangedEventer(widthChangedColumn.index);
    //     }
    // }

    setFieldHeader(fieldOrIdx: RevRecordFieldIndex | RevRecordField, header: string): void {
        const fieldIndex = this._fieldAdapter.setFieldHeader(
            fieldOrIdx,
            header
        );

        this._headerRecordAdapter.invalidateCell(fieldIndex);
    }

    setFieldState(field: RevRecordField, state: GridRecordFieldState): void {
        // const fieldIndex = typeof field === 'number' ? field : this.getFieldIndex(field);
        const fieldIndex = this.getFieldIndex(field);

        if (state === undefined) {
            state = {};
        }

        const columnIndex = this.getActiveColumnIndexUsingFieldIndex(fieldIndex);

        if (columnIndex < 0) {
            return;
        }

        const column = this.getAllColumn(columnIndex);

        // Update the schema
        const header = state.header ?? field.name;
        this.setFieldHeader(fieldIndex, header);

        // Update any properties
        if (state.alignment !== undefined) {
            column.properties.halign = state.alignment;
        }

        // Update the width
        if (state.width === undefined) {
            column.checkColumnAutosizing(true);
        } else {
            column.setWidth(state.width);
        }

        // Update Hypergrid schema
        // if (this.updateCounter == 0 && this.dispatchEvent !== undefined)
        // 	this.dispatchEvent('fin-hypergrid-schema-loaded');
    }

    setFieldsVisible(fields: (RevRecordFieldIndex | RevRecordField)[], visible: boolean): void {
        const fieldIndexes = fields.map((field) =>
            typeof field === 'number' ? field : this.getFieldIndex(field)
        );

        if (visible) {
            this.showColumns(false, fieldIndexes);
        } else {
            this.showColumns(false, fieldIndexes, -1);
        }
    }

    setFieldWidth(field: RevRecordFieldIndex | RevRecordField, width?: number): void {
        const fieldIndex =
            typeof field === 'number' ? field : this.getFieldIndex(field);
        const column = this.getAllColumn(fieldIndex);

        if (width === undefined) {
            column.checkColumnAutosizing(true);
        } else {
            column.setWidth(width);
        }

        // Update Hypergrid schema
        // if (this.updateCounter == 0 && this.dispatchEvent !== undefined)
        // 	this.dispatchEvent('fin-hypergrid-schema-loaded');
    }

    setFieldVisible(field: RevRecordFieldIndex | RevRecordField, visible: boolean): void {
        const fieldIndex =
            typeof field === 'number' ? field : this.getFieldIndex(field);
        const column = this.getActiveColumns().find(
            (activeColumn) => activeColumn.index === fieldIndex
        );

        if ((column !== undefined) === visible) {
            return;
        } // Visibility remains unchanged

        // Are we hiding the column?
        if (column !== undefined) {
            this.showColumns(false, fieldIndex, -1);
            return;
        }

        // No, so we're showing it
        // TODO: Work out roughly where to insert it. At the moment it goes on the end
        this.showColumns(false, fieldIndex);
    }

    sortBy(fieldIndex?: number, isAscending?: boolean): boolean {
        return this._mainRecordAdapter.sortBy(fieldIndex, isAscending);
    }

    sortByMany(specifiers: RevRecordMainAdapter.SortFieldSpecifier[]): boolean {
        return this._mainRecordAdapter.sortByMany(specifiers);
    }

    protected override applySettings() {
        const result = super.applySettings();

        const coreSettings = this._settingsService.core;
        this._mainRecordAdapter.allChangedRecentDuration = coreSettings.grid_AllChangedRecentDuration;
        this._mainRecordAdapter.recordInsertedRecentDuration = coreSettings.grid_RecordInsertedRecentDuration;
        this._mainRecordAdapter.recordUpdatedRecentDuration = coreSettings.grid_RecordUpdatedRecentDuration;
        this._mainRecordAdapter.valueChangedRecentDuration = coreSettings.grid_ValueChangedRecentDuration;

        this._componentAccess.applySettings();

        return result;
    }

    protected invalidateAll() {
        this._mainRecordAdapter.invalidateAll();
    }

    private handleHypegridColumnSortEvent(column: Column): void {
        const fieldIndex = column.schemaColumn.index;

        this.sortBy(fieldIndex);
    }

    private handleHypegridClickEvent(event: CustomEvent<CellEvent>): void {
        const gridY = event.detail.gridCell.y;
        if (gridY !== 0) {
            // Skip clicks to the column headers
            if (this._mainClickEventer !== undefined) {
                const rowIndex = event.detail.dataCell.y;
                const recordIndex =
                    this._mainRecordAdapter.getRecordIndexFromRowIndex(
                        rowIndex
                    );
                if (recordIndex === undefined) {
                    throw new UnexpectedUndefinedError('MGHC89877');
                } else {
                    const fieldIndex = event.detail.dataCell.x;
                    this._mainClickEventer(fieldIndex, recordIndex);
                }
            }
        }
    }

    /** @internal */
    private handleMouseDown(/*rowIndex: number, fieldIndex: number, gridY: number*/): void {
        /*if (gridY === 0) {
            return;
        } // Skip clicks to the column headers

        const recordIndex = this.rowLookup.getLeftIndex(rowIndex)!;

        this.recordFocusEventer!(recordIndex, fieldIndex);*/
    }

    /** @internal */
    private handleHypegridDblClickEvent(event: CustomEvent<CellEvent>): void {
        if (event.detail.gridCell.y !== 0) {
            // Skip clicks to the column headers
            if (this._mainDblClickEventer !== undefined) {
                const rowIndex = event.detail.dataCell.y;
                const recordIndex =
                    this._mainRecordAdapter.getRecordIndexFromRowIndex(
                        rowIndex
                    );
                if (recordIndex === undefined) {
                    throw new UnexpectedUndefinedError('MGHDC87877');
                } else {
                    this._mainDblClickEventer(
                        event.detail.dataCell.x,
                        recordIndex
                    );
                }
            }
        }
    }

    /** @internal */
    private handleHypegridSelectionChanged(event: CustomEvent<SelectionDetail>) {
        const selections = event.detail.selections;

        if (selections.length === 0) {
            if (this._lastNotifiedFocusedRecordIndex !== undefined) {
                const oldSelectedRecordIndex = this._lastNotifiedFocusedRecordIndex;
                this._lastNotifiedFocusedRecordIndex = undefined;
                const recordFocusEventer = this.recordFocusEventer;
                if (recordFocusEventer !== undefined) {
                    recordFocusEventer(undefined, oldSelectedRecordIndex);
                }
            }
        } else {
            const selection = selections[0];
            const newFocusedRecordIndex =
                this._mainRecordAdapter.getRecordIndexFromRowIndex(
                    selection.firstSelectedCell.y
                );
            if (
                newFocusedRecordIndex !== this._lastNotifiedFocusedRecordIndex
            ) {
                const oldFocusedRecordIndex = this._lastNotifiedFocusedRecordIndex;
                this._lastNotifiedFocusedRecordIndex = newFocusedRecordIndex;
                const recordFocusEventer = this.recordFocusEventer;
                if (recordFocusEventer !== undefined) {
                    recordFocusEventer(newFocusedRecordIndex, oldFocusedRecordIndex);
                }
            }
        }
    }

    private processLayoutChangedEvent(initiator: GridLayout.ChangeInitiator) {
        if (initiator !== this) {

        }
    }

    private updateGridSchema() {
        const maxCount = this._allowedFields.length;
        const schemaFields = new Array<GridRecordField>(maxCount);
        const layoutColumns = this._layout.getColumns;
        for (let i = 0; i < layoutColumnCount; i++) {
        this._fieldAdapter.setFields(schemaFields);
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

    private getColumnFieldIndex(activeColumnIndex: number): RevRecordFieldIndex {
        const column = this.getActiveColumn(activeColumnIndex);
        return column.index;
    }

    private getActiveColumnIndexUsingFieldIndex(
        fieldIndex: RevRecordFieldIndex
    ): number {
        return this.getActiveColumnIndexByAllIndex(fieldIndex);
    }
}

/** @public */
export namespace RecordGrid {
    // export type FieldNameToHeaderMap = Map<string, string | undefined>;

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

    export interface ComponentAccess {
        applySettings(): void;
    }
}
