import {
    CellEvent,
    Column,
    EventDetail,
    GridProperties,
    Halign,
    Revgrid,
    RevRecordField,
    RevRecordFieldAdapter,
    RevRecordFieldIndex,
    RevRecordHeaderAdapter,
    RevRecordIndex,
    RevRecordInvalidatedValue,
    RevRecordMainAdapter,
    RevRecordValueRecentChangeTypeId,
    SelectionDetail
} from 'revgrid';
import { ColorScheme, SettingsService } from 'src/core/internal-api';
import { MultiEvent } from 'src/sys/internal-api';
import { AssertInternalError, UnexpectedUndefinedError } from 'src/sys/internal-error';
import { GridLayout } from './grid-layout';

/**
 * Implements a Grid Adapter over the Hypergrid control
 *
 * @public
 */
export class MotifGrid extends Revgrid {
    settingsChangedEventer: MotifGrid.SettingsChangedEventer | undefined;
    fieldSortedEventer: MotifGrid.FieldSortedEventer | undefined;
    columnWidthChangedEventer: MotifGrid.ColumnWidthChangedEventer | undefined;

    ctrlKeyMouseMoveEventer: MotifGrid.CtrlKeyMouseMoveEventer | undefined;

    private _lastNotifiedFocusedRecordIndex: number | undefined;

    private _maxSortingFieldCount = 3;

    private _beginThrottlingCount = 0;

    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    private _recordFocusEventer: MotifGrid.RecordFocusEventer | undefined;
    private _mainClickEventer: MotifGrid.MainClickEventer | undefined;
    private _mainDblClickEventer: MotifGrid.MainDblClickEventer | undefined;
    private _resizedEventer: MotifGrid.ResizedEventer | undefined;
    private _columnsViewWidthsChangedEventer: MotifGrid.ColumnsViewWidthsChangedEventer | undefined;
    private _renderedEventer: MotifGrid.RenderedEventer | undefined;

    constructor(
        gridElement: HTMLElement,
        options: Revgrid.Options,
        private readonly _settingsService: SettingsService,
        private readonly _fieldAdapter: RevRecordFieldAdapter,
        private readonly _headerRecordAdapter: RevRecordHeaderAdapter,
        private readonly _mainRecordAdapter: RevRecordMainAdapter,
    ) {
        super(gridElement, options);

        this.applySettingsToMainRecordAdapter();

        this.allowEvents(true);

        this.canvas.canvas.addEventListener('mousemove', this._ctrlKeyMousemoveListener);
        this.addEventListener('rev-column-sort', this._columnSortListener);

        this._settingsChangedSubscriptionId =
            this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());

        // this.hypegrid.addEventListener('fin-column-changed-event', (event: DataModelEvent) => this.HandleColumnChanged());

        // if (host.onRecordFocusClick !== undefined) {
        //     this.hypergrid.addEventListener('fin-mousedown', () =>
        //         this.handleMouseDown(/*event.detail.dataCell.y, event.detail.dataCell.x, event.detail.gridCell.y*/));
        // }

        // if (host.onRecordFocusClick !== undefined) {
        //     this.hypergrid.addEventListener('fin-key-up', (event) =>
        //         this.HandleClick(event.detail.dataCell.y, event.detail.dataCell.x, event.detail.gridCell.y));
        // }


        //        this.boundCheckNotifiedFocusedRecordIndex = this.checkNotifiedFocusedRecordIndex.bind(this);
    }

    override destroy(): void {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
        this._settingsChangedSubscriptionId = undefined;
        this.canvas.canvas.removeEventListener('mousemove', this._ctrlKeyMousemoveListener);
        this._mainRecordAdapter.destroy();
        super.destroy();
    }

    get sortable(): boolean { return this.properties.sortable; }
    set sortable(value: boolean) { this.properties.sortable = value; }

    get columnCount(): number { return this.getActiveColumnCount(); }

    get continuousFiltering(): boolean { return this._mainRecordAdapter.continuousFiltering; }
    set continuousFiltering(value: boolean) {
        const oldContinuousFiltering = this._mainRecordAdapter.continuousFiltering;
        if (value !== oldContinuousFiltering) {
            this._mainRecordAdapter.continuousFiltering = value;

            if (value) {
                // Continuous filtering was just turned on, apply if necessary
                this.invalidateAll();
            }
        }
    }

    get rowOrderReversed() { return this._mainRecordAdapter.rowOrderReversed; }
    set rowOrderReversed(value: boolean) { this._mainRecordAdapter.rowOrderReversed = value; }

    get fieldCount(): number { return this._fieldAdapter.fieldCount; }

    get fixedCols(): number { return this.getFixedColumnCount(); }
    set fixedCols(value: number) { this.setFixedColumnCount(value); }

    get fixedRows(): number { return this.getFixedRowCount(); }

    get focusedRecordIndex(): RevRecordIndex | undefined {
        const selections = this.selections;

        if (selections === null || selections.length === 0) {
            return undefined;
        } else {
            let rowIndex = selections[0].firstSelectedCell.y;

            // Following test probably not required as RevGrid now adjusts the current selection index if rows are deleted
            if (rowIndex >= this._mainRecordAdapter.rowCount) {
                return undefined;
            } else {
                return this._mainRecordAdapter.getRecordIndexFromRowIndex(rowIndex);
            }
        }
    }

    set focusedRecordIndex(recordIndex: number | undefined) {
        if (recordIndex === undefined) {
            this.clearSelections();
        } else {
            let rowIndex = this._mainRecordAdapter.getRowIndexFromRecordIndex(recordIndex);

            if (rowIndex === undefined) {
                this.clearSelections();
            } else {
                this.selectRows(rowIndex, rowIndex);
            }
        }
    }

    get headerRowCount(): number {
        return this._headerRecordAdapter.getRowCount();
    }

    get isFiltered(): boolean { return this._mainRecordAdapter.isFiltered; }
    get sortColumns(): number { return this._mainRecordAdapter.sortColumnCount; }

    get gridRightAligned(): boolean { return this.properties.gridRightAligned; }
    get rowHeight(): number { return this.properties.defaultRowHeight; }

    get recordFocusEventer() { return this._recordFocusEventer; }
    set recordFocusEventer(value: MotifGrid.RecordFocusEventer | undefined) {
        if (this._recordFocusEventer !== undefined) {
            this.removeEventListener('rev-selection-changed', this._selectionChangedListener);
        }
        this._recordFocusEventer = value;

        if (this._recordFocusEventer !== undefined) {
            this.addEventListener('rev-selection-changed', this._selectionChangedListener);
        }
    }

    get mainClickEventer() { return this._mainClickEventer; }
    set mainClickEventer(value: MotifGrid.MainClickEventer | undefined) {
        if (this._mainClickEventer !== undefined) {
            this.removeEventListener('rev-click', this._clickListener);
        }
        this._mainClickEventer = value;

        if (this._mainClickEventer !== undefined) {
            this.addEventListener('rev-click', this._clickListener);
        }
    }

    get mainDblClickEventer() { return this._mainDblClickEventer; }
    set mainDblClickEventer(value: MotifGrid.MainDblClickEventer | undefined) {
        if (this._mainDblClickEventer !== undefined) {
            this.removeEventListener('rev-double-click', this._dblClickListener);
        }
        this._mainDblClickEventer = value;

        if (this._mainDblClickEventer !== undefined) {
            this.addEventListener('rev-double-click', this._dblClickListener);
        }
    }

    get resizedEventer() { return this._resizedEventer; }
    set resizedEventer(value: MotifGrid.ResizedEventer | undefined) {
        if (this._resizedEventer !== undefined) {
            this.removeEventListener('rev-grid-resized', this._resizedListener);
        }
        this._resizedEventer = value;

        if (this._resizedEventer !== undefined) {
            this.addEventListener('rev-grid-resized', this._resizedListener);
        }
    }

    get columnsViewWidthsChangedEventer() { return this._columnsViewWidthsChangedEventer; }
    set columnsViewWidthsChangedEventer(value: MotifGrid.ColumnsViewWidthsChangedEventer | undefined) {
        if (this._columnsViewWidthsChangedEventer !== undefined) {
            this.removeEventListener('rev-columns-view-widths-changed', this._columnsViewWidthsChangedListener);
        }
        this._columnsViewWidthsChangedEventer = value;

        if (this._columnsViewWidthsChangedEventer !== undefined) {
            this.addEventListener('rev-columns-view-widths-changed', this._columnsViewWidthsChangedListener);
        }
    }

    get renderedEventer() { return this._renderedEventer; }
    set renderedEventer(value: MotifGrid.RenderedEventer | undefined) {
        if (this._renderedEventer !== undefined) {
            this.removeEventListener('rev-grid-rendered', this._renderedListener);
        }
        this._renderedEventer = value;

        if (this._renderedEventer !== undefined) {
            this.addEventListener('rev-grid-rendered', this._renderedListener);
        }
    }

    get rowRecIndices(): number[] {
        return [];
        // todo
    }

    addField(field: RevRecordField, state?: MotifGrid.FieldState): RevRecordFieldIndex {
        const header = state?.header ?? field.name;
        const schemaColumn = this._fieldAdapter.addField(field, header);
        return schemaColumn.index;
    }

    addFields(fields: RevRecordField[]): RevRecordFieldIndex {
        return this._fieldAdapter.addFields(fields);
    }

    applyFilter(filter?: RevRecordMainAdapter.RecordFilterCallback): void {
        this._mainRecordAdapter.filterCallback = filter;
    }

    autoSizeColumnWidth(columnIndex: number): void {
        this.autosizeColumn(columnIndex);
    }

    autoSizeFieldColumnWidth(field: RevRecordField): void {
        const fieldIndex = this._fieldAdapter.getFieldIndex(field);
        const columnIndex = this.getActiveColumnIndexUsingFieldIndex(fieldIndex);

        if (columnIndex < 0) {
            throw new RangeError('Field is not visible');
        }

        this.autosizeColumn(columnIndex);
    }

    autoSizeAllColumnWidths(): void {
        this.autosizeAllColumns();
    }

    // beginChange() {
    //     this.beginDataChange();
    //     this.beginSchemaChange();
    // }

    // endChange() {
    //     this.endSchemaChange();
    //     this.endDataChange();
    // }

    beginThrottling() {
        if (this._beginThrottlingCount++ === 0) {
        }
    }

    beginRecordChanges(): void {
        this._mainRecordAdapter.beginChange();
    }

    beginFieldChanges(): void {
        this._fieldAdapter.beginChange();
    }

    clearFilter(): void {
        this.applyFilter(undefined);
    }

    allRecordsDeleted(): void {
        this._mainRecordAdapter.allRecordsDeleted();
        // if (this._beginDataChangeCount > 0 && ++this._recordListChangeCount > 1) {
        //     this._selectionDeletedChange = true;
        //     return;
        // }

        // this._mainDataModel.allRecordsDeleted();

        // this._highlights = [];
        // if (this._highlightTimer !== undefined) {
        //     clearTimeout(this._highlightTimer);
        //     this._highlightTimer = undefined;
        // }

        // this._mainDataModel.notifyRowCountChanged();

        // this._hypegrid.clearSelections();
        // this.checkNotifiedFocusedRecordIndex();
    }

    clearSort() {
        this._mainRecordAdapter.clearSort();
    }

    recordDeleted(recordIndex: RevRecordIndex): void {
        this._mainRecordAdapter.recordDeleted(recordIndex);
    }

    recordsDeleted(recordIndex: RevRecordIndex, count: number): void {
        this._mainRecordAdapter.recordsDeleted(recordIndex, count);
    }

    endRecordChanges(): void {
        this._mainRecordAdapter.endChange();
    }

    endFieldChanges(): void {
        this._fieldAdapter.endChange();
    }

    getFieldByName(fieldName: string): RevRecordField {
        return this._fieldAdapter.getFieldByName(fieldName);
    }

    getFieldIndex(field: RevRecordField): RevRecordFieldIndex {
        return this._fieldAdapter.getFieldIndex(field);
    }

    getFieldNameToHeaderMap(): MotifGrid.FieldNameToHeaderMap {
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

    getFieldState(field: RevRecordFieldIndex | RevRecordField): MotifGrid.FieldState {
        const fieldIndex = typeof field === 'number' ? field : this.getFieldIndex(field);
        const column = this.getAllColumn(fieldIndex);
        const columnProperties = column.properties;

        return {
            width: !columnProperties.columnAutosized ? columnProperties.width : undefined,
            header: (column.schemaColumn as RevRecordFieldAdapter.SchemaColumn).header,
            alignment: columnProperties.halign
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
        return activeColumns.findIndex(column => (column.schemaColumn as RevRecordFieldAdapter.SchemaColumn).index === fieldIndex) !== -1;
    }

    getHeaderPlusFixedLineHeight(): number {
        const gridProps = this.properties;
        const rowHeight = gridProps.defaultRowHeight;
        let lineWidth = gridProps.fixedLinesHWidth;
        if (lineWidth === undefined) {
            lineWidth = gridProps.gridLinesHWidth;
        }
        return rowHeight + lineWidth;
    }

    getLayoutWithHeadersMap(): MotifGrid.LayoutWithHeadersMap {
        return {
            layout: this.saveLayout(),
            headersMap: this.getFieldNameToHeaderMap()
        };
    }

    getSortSpecifier(index: number): RevRecordMainAdapter.SortFieldSpecifier {
        return this._mainRecordAdapter.getSortSpecifier(index);
    }

    getVisibleFields(): RevRecordFieldIndex[] {
        return this.getActiveColumns().map(column => (column.schemaColumn as RevRecordFieldAdapter.SchemaColumn).index);
    }

    recordInserted(recordIndex: RevRecordIndex, recent?: boolean): void {
        this._mainRecordAdapter.recordInserted(recordIndex, recent);
    }

    recordsInserted(recordIndex: RevRecordIndex, count: number, recent?: boolean): void {
        this._mainRecordAdapter.recordsInserted(recordIndex, count, recent);
    }

    invalidateAll(recent?: boolean): void {
        this._mainRecordAdapter.invalidateAll(recent);
    }

    invalidateExisting(): void {
        this._mainRecordAdapter.invalidateExisting();
    }

    invalidateRecord(recordIndex: RevRecordIndex, recent?: boolean): void {
        this._mainRecordAdapter.invalidateRecord(recordIndex, recent);
    }

    invalidateRecords(recordIndex: RevRecordIndex, count: number, recent?: boolean): void {
        this._mainRecordAdapter.invalidateRecords(recordIndex, count, recent);
    }

    invalidateValue(fieldIndex: RevRecordFieldIndex, recordIndex: RevRecordIndex, changeType?: RevRecordValueRecentChangeTypeId): void {
        this._mainRecordAdapter.invalidateValue(fieldIndex, recordIndex, changeType);
    }

    invalidateRecordValues(recordIndex: RevRecordIndex, invalidatedValues: RevRecordInvalidatedValue[]): void {
        this._mainRecordAdapter.invalidateRecordValues(recordIndex, invalidatedValues);
    }

    invalidateRecordFields(recordIndex: RevRecordIndex, fieldIndex: number, fieldCount: number): void {
        this._mainRecordAdapter.invalidateRecordFields(recordIndex, fieldIndex, fieldCount);
    }

    invalidateRecordAndValues(
        recordIndex: RevRecordIndex,
        invalidatedRecordValues: RevRecordInvalidatedValue[],
        recordUpdateRecent?: boolean
    ): void {
        this._mainRecordAdapter.invalidateRecordAndValues(recordIndex, invalidatedRecordValues, recordUpdateRecent);
    }

    isHeaderRow(rowIndex: number): boolean {
        return rowIndex > this.headerRowCount;
    }

    loadLayout(layout: GridLayout): void {
        const columns = layout.getColumns().filter(column => this._fieldAdapter.hasField(column.field.name));

        // Show all visible columns. Also sets their positions
        // TODO: Should we care about the position of hidden columns?
        this.showColumns(
            false,
            columns.filter(column => column.visible).map(column => this._fieldAdapter.getFieldIndexByName(column.field.name))
        );
        this.showColumns(
            false,
            columns.filter(column => !column.visible).map(column => this._fieldAdapter.getFieldIndexByName(column.field.name)),
            -1
        );

        const gridColumns = this.getAllColumns();

        // Apply width settings
        for (const column of columns) {
            const fieldIndex = this._fieldAdapter.getFieldIndexByName(column.field.name);
            const gridColumn = gridColumns[fieldIndex];

            if (column.width === undefined) {
                gridColumn.checkColumnAutosizing(true);
            } else {
                gridColumn.setWidth(column.width);
            }
        }

        // Apply sorting
        const sortedColumns = columns.filter(column => column.sortPriority !== undefined) as GridLayout.SortPrioritizedColumn[];

        if (sortedColumns.length === 0) {
            this.clearSort();
        } else {
            sortedColumns.sort((left, right) => right.sortPriority - left.sortPriority);

            const sortSpecifiers = sortedColumns.map<RevRecordMainAdapter.SortFieldSpecifier>((column) => {
                const fieldIndex = this._fieldAdapter.getFieldIndexByName(column.field.name);
                return { fieldIndex, ascending: column.sortAscending === true };
            });

            this.sortByMany(sortSpecifiers);
        }

        // this._hypegrid.renderer.resetAllCellPropertiesCaches();
        this.invalidateAll();
    }

    moveActiveColumn(fromColumnIndex: number, toColumnIndex: number): void {
        this.showColumns(true, fromColumnIndex, toColumnIndex, false);
    }

    moveFieldColumn(field: RevRecordFieldIndex | RevRecordField, toColumnIndex: number): void {
        const fieldIndex = typeof field === 'number' ? field : this.getFieldIndex(field);
        const fromColumnIndex = this.getActiveColumnIndexUsingFieldIndex(fieldIndex);

        if (fromColumnIndex < 0) {
            throw new AssertInternalError('MGMFC89952', `${fieldIndex}, ${this._fieldAdapter.getField(fieldIndex).name}`);
        }

        this.moveActiveColumn(fromColumnIndex, toColumnIndex);
    }

    override reset(adapterSet?: GridProperties.AdapterSet): void {
        if (this._fieldAdapter !== undefined) { // will be undefined while grid is being constructed
            this._fieldAdapter.reset();
        }
        if (this._mainRecordAdapter !== undefined) { // will be undefined while grid is being constructed
            this._mainRecordAdapter.reset();
        }
        super.reset(adapterSet, undefined, false);
    }

    recordToRowIndex(recIdx: RevRecordIndex): number {
        const rowIdx = this._mainRecordAdapter.getRowIndexFromRecordIndex(recIdx);
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
        const recIdx = this._mainRecordAdapter.getRecordIndexFromRowIndex(rowIdx);
        if (recIdx === undefined) {
            throw new UnexpectedUndefinedError('DMIRTRI34448');
        } else {
            return recIdx;
        }
    }

    saveLayout(): GridLayout {
        const layout = new GridLayout(this._fieldAdapter.getFieldNames());

        // Apply the order of the visible columns
        const visibleColumnFields = this.getActiveColumns().map(
            column => this._fieldAdapter.getFieldByName(column.schemaColumn.name)
        );
        layout.setFieldColumnsByFieldNames(visibleColumnFields.map<string>(field => field.name));

        // Hide all hidden fields
        const visibleSet = new Set(visibleColumnFields);
        const hiddenColumnFields = this._fieldAdapter.getFilteredFields((field) => !visibleSet.has(field));
        layout.setFieldsVisible(hiddenColumnFields.map(field => field.name), false);

        // Apply width settings
        for (const column of this.getAllColumns()) {
            const field = this._fieldAdapter.getFieldByName(column.schemaColumn.name);
            const columnProperties = column.properties;

            if (columnProperties.columnAutosizing && columnProperties.columnAutosized) {
                layout.setFieldWidthByFieldName(field.name);
            } else {
                layout.setFieldWidthByFieldName(field.name, columnProperties.width);
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
        const fieldIndex = this._fieldAdapter.setFieldHeader(fieldOrIdx, header);

        this._headerRecordAdapter.invalidateCell(fieldIndex);
    }

    setFieldState(field: RevRecordField, state: MotifGrid.FieldState): void {
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
        const fieldIndexes = fields.map(field => typeof field === 'number' ? field : this.getFieldIndex(field));

        if (visible) {
            this.showColumns(false, fieldIndexes);
        } else {
            this.showColumns(false, fieldIndexes, -1);
        }
    }

    setFieldWidth(field: RevRecordFieldIndex | RevRecordField, width?: number): void {
        const fieldIndex = typeof field === 'number' ? field : this.getFieldIndex(field);
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
        const fieldIndex = typeof field === 'number' ? field : this.getFieldIndex(field);
        const column = this.getActiveColumns().find((activeColumn) => activeColumn.index === fieldIndex);

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


    private readonly _selectionChangedListener = (event: CustomEvent<SelectionDetail>) => this.handleHypegridSelectionChanged(event);
    private readonly _clickListener = (event: CustomEvent<CellEvent>) => this.handleHypegridClickEvent(event);
    private readonly _dblClickListener = (event: CustomEvent<CellEvent>) => this.handleHypegridDblClickEvent(event);
    private readonly _resizedListener = (event: CustomEvent<EventDetail.Resize>) => this.handleHypegridResizedEvent(event);
    private readonly _columnsViewWidthsChangedListener =
        (event: CustomEvent<EventDetail.ColumnsViewWidthsChanged>) => this.handleHypegridColumnsViewWidthsChangedEvent(event);
    private readonly _renderedListener = () => this.handleHypegridRenderedEvent();
    // private readonly _nextRenderedListener = () => this.handleHypegridNextRenderedEvent();
    private readonly _ctrlKeyMousemoveListener = (event: MouseEvent) => this.handleHypegridCtrlKeyMousemoveEvent(event.ctrlKey);
    private readonly _columnSortListener =
        (event: CustomEvent<EventDetail.ColumnSort>) => this.handleHypegridColumnSortEvent(event.detail.column);

    private handleHypegridCtrlKeyMousemoveEvent(ctrlKey: boolean) {
        if (ctrlKey && this.ctrlKeyMouseMoveEventer !== undefined) {
            this.ctrlKeyMouseMoveEventer();
        }
    }

    /** @internal */
    private handleHypegridColumnSortEvent(column: Column): void {
        const fieldIndex = column.schemaColumn.index;

        this.sortBy(fieldIndex);
    }

    /** @internal */
    private handleHypegridClickEvent(event: CustomEvent<CellEvent>): void {
        const gridY = event.detail.gridCell.y;
        if (gridY !== 0) { // Skip clicks to the column headers
            if (this._mainClickEventer !== undefined) {
                const rowIndex = event.detail.dataCell.y;
                const recordIndex = this._mainRecordAdapter.getRecordIndexFromRowIndex(rowIndex);
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
        if (event.detail.gridCell.y !== 0) { // Skip clicks to the column headers
            if (this._mainDblClickEventer !== undefined) {
                const rowIndex = event.detail.dataCell.y;
                const recordIndex = this._mainRecordAdapter.getRecordIndexFromRowIndex(rowIndex);
                if (recordIndex === undefined) {
                    throw new UnexpectedUndefinedError('MGHDC87877');
                } else {
                    this._mainDblClickEventer(event.detail.dataCell.x, recordIndex);
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
            const newFocusedRecordIndex = this._mainRecordAdapter.getRecordIndexFromRowIndex(selection.firstSelectedCell.y);
            if (newFocusedRecordIndex !== this._lastNotifiedFocusedRecordIndex) {
                const oldFocusedRecordIndex = this._lastNotifiedFocusedRecordIndex;
                this._lastNotifiedFocusedRecordIndex = newFocusedRecordIndex;
                const recordFocusEventer= this.recordFocusEventer;
                if (recordFocusEventer !== undefined) {
                    recordFocusEventer(newFocusedRecordIndex, oldFocusedRecordIndex);
                }
            }
        }
    }

    /** @internal */
    private handleHypegridResizedEvent(event: CustomEvent<EventDetail.Resize>) {
        if (this._resizedEventer !== undefined) {
            this._resizedEventer(event.detail);
        }
    }

    /** @internal */
    private handleHypegridColumnsViewWidthsChangedEvent(event: CustomEvent<EventDetail.ColumnsViewWidthsChanged>) {
        if (this._columnsViewWidthsChangedEventer !== undefined) {
            const detail = event.detail;
            this._columnsViewWidthsChangedEventer(detail.fixedChanged, detail.nonFixedChanged, detail.activeChanged);
        }
    }

    /** @internal */
    private handleHypegridRenderedEvent() {
        if (this._renderedEventer !== undefined) {
            this._renderedEventer();
        }
    }

    /** @internal */
    // private handleHypegridNextRenderedEvent() {
    //     if (this._nextRenderedResolves.length > 0) {
    //         this._hypegrid.removeEventListener('rev-grid-rendered', this._nextRenderedListener);
    //         const callbacks = this._nextRenderedResolves.slice();
    //         this._nextRenderedResolves.length = 0;
    //         for (const callback of callbacks) {
    //             callback();
    //         }
    //     }
    // }

    private handleSettingsChangedEvent(): void {
        this.applySettingsToMainRecordAdapter();

        if (this.settingsChangedEventer !== undefined) {
            this.settingsChangedEventer();
        }

        const updatedProperties = MotifGrid.createGridPropertiesFromSettings(this._settingsService, undefined, this.properties);

        const updatedPropertiesCount = Object.keys(updatedProperties).length;
        let gridPropertiesUpdated: boolean;
        if (updatedPropertiesCount > 0) {
            gridPropertiesUpdated = this.addProperties(updatedProperties);
        } else {
            gridPropertiesUpdated = false;
        }

        if (!gridPropertiesUpdated) {
            this.invalidateExisting();
        }
    }

    private applySettingsToMainRecordAdapter() {
        const coreSettings = this._settingsService.core;
        this._mainRecordAdapter.allChangedRecentDuration = coreSettings.grid_AllChangedRecentDuration;
        this._mainRecordAdapter.recordInsertedRecentDuration = coreSettings.grid_RecordInsertedRecentDuration;
        this._mainRecordAdapter.recordUpdatedRecentDuration = coreSettings.grid_RecordUpdatedRecentDuration;
        this._mainRecordAdapter.valueChangedRecentDuration = coreSettings.grid_ValueChangedRecentDuration;
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

    private getActiveColumnIndexUsingFieldIndex(fieldIndex: RevRecordFieldIndex): number {
        return this.getActiveColumnIndexByAllIndex(fieldIndex);
    }
}

/** @public */
export namespace MotifGrid {
    export type FieldNameToHeaderMap = Map<string, string | undefined>;

    export type ResizedEventDetail = EventDetail.Resize;

    export type SettingsChangedEventer = (this: void) => void;
    export type CtrlKeyMouseMoveEventer = (this: void) => void;
    export type RecordFocusEventer = (this: void, newRecordIndex: RevRecordIndex | undefined, oldRecordIndex: RevRecordIndex | undefined) => void;
    export type MainClickEventer = (this: void, fieldIndex: RevRecordFieldIndex, recordIndex: RevRecordIndex) => void;
    export type MainDblClickEventer = (this: void, fieldIndex: RevRecordFieldIndex, recordIndex: RevRecordIndex) => void;
    export type ResizedEventer = (this: void, detail: ResizedEventDetail) => void;
    export type ColumnsViewWidthsChangedEventer =
        (this: void, fixedChanged: boolean, nonFixedChanged: boolean, allChanged: boolean) => void;
    export type RenderedEventer = (this: void/*, detail: Hypergrid.GridEventDetail*/) => void;
    export type FieldSortedEventer = (this: void) => void;
    export type ColumnWidthChangedEventer = (this: void, columnIndex: number) => void;

    export interface LayoutWithHeadersMap {
        layout: GridLayout;
        headersMap: FieldNameToHeaderMap;
    }

    /** Defines the display details of a Field */
    export interface FieldState {
        /** Determines the header text of a Field. Undefined to use the raw field name */
        header?: string;
        /** Determines the width of a Field. Undefined to auto-size */
        width?: number;
        /** The text alignment within a cell */
        alignment?: Halign;
    }

    export type RenderedCallback = (this: void) => void;

    export type FrameGridProperties = Pick<GridProperties, 'gridRightAligned' | 'fixedColumnCount'>;

    export function createGridPropertiesFromSettings(
        settings: SettingsService,
        frameGridProperties: FrameGridProperties | undefined,
        existingGridProperties: GridProperties | undefined,
    ): Partial<GridProperties> {
        const properties: Partial<GridProperties> = {};
        const core = settings.core;
        const color = settings.color;

        if (frameGridProperties !== undefined) {
            const { fixedColumnCount, gridRightAligned } = frameGridProperties;
            if (fixedColumnCount >= 0 && fixedColumnCount !== existingGridProperties?.fixedColumnCount) {
                properties.fixedColumnCount = fixedColumnCount;
            }
            if (gridRightAligned !== existingGridProperties?.gridRightAligned) {
                properties.gridRightAligned = gridRightAligned;
            }
        }

        // scrollbarHorizontalThumbHeight,
        // scrollbarVerticalThumbWidth,
        // scrollbarThumbInactiveOpacity,
        const scrollbarMargin = core.grid_ScrollbarMargin;
        const fontFamily = core.grid_FontFamily;
        if (fontFamily !== '') {
            const fontSize = core.grid_FontSize;
            if (fontSize !== '') {
                const font = fontSize + ' ' + fontFamily;
                if (font !== existingGridProperties?.font) {
                    properties.font = font;
                    properties.foregroundSelectionFont = font;
                }
            }

            const columnHeaderFontSize = core.grid_ColumnHeaderFontSize;
            if (columnHeaderFontSize !== '') {
                const font = columnHeaderFontSize + ' ' + fontFamily;
                if (font !== existingGridProperties?.columnHeaderFont) {
                    properties.columnHeaderFont = font;
                }
                if (font !== existingGridProperties?.columnHeaderForegroundSelectionFont) {
                    properties.columnHeaderForegroundSelectionFont = font;
                }
                if (font !== existingGridProperties?.filterFont) {
                    properties.filterFont = font;
                }
            }
        }

        const defaultRowHeight = core.grid_RowHeight;
        if (defaultRowHeight > 0 && defaultRowHeight !== existingGridProperties?.defaultRowHeight) {
            properties.defaultRowHeight = defaultRowHeight;
        }

        const cellPadding = core.grid_CellPadding;
        if (cellPadding >= 0 && cellPadding !== existingGridProperties?.cellPadding) {
            properties.cellPadding = cellPadding;
        }

        const gridLinesH = core.grid_HorizontalLinesVisible;
        if (gridLinesH !== existingGridProperties?.gridLinesH) {
            properties.gridLinesH = gridLinesH;
        }

        let gridLinesHWidth: number;
        if (gridLinesH) {
            gridLinesHWidth = core.grid_HorizontalLineWidth;
        } else {
            gridLinesHWidth = 0;
        }
        if (gridLinesHWidth !== existingGridProperties?.gridLinesHWidth && gridLinesHWidth >= 0) {
            properties.gridLinesHWidth = gridLinesHWidth;
        }

        const gridLinesV = core.grid_VerticalLinesVisible;
        if (gridLinesV !== existingGridProperties?.gridLinesV) {
            properties.gridLinesV = gridLinesV;
        }

        let gridLinesVWidth: number;
        if (gridLinesV) {
            gridLinesVWidth = core.grid_VerticalLineWidth;
        } else {
            gridLinesVWidth = 0;
        }
        if (gridLinesVWidth !== existingGridProperties?.gridLinesVWidth && gridLinesVWidth >= 0) {
            properties.gridLinesVWidth = gridLinesVWidth;
        }

        const scrollHorizontallySmoothly = core.grid_ScrollHorizontallySmoothly;
        if (scrollHorizontallySmoothly !== existingGridProperties?.scrollHorizontallySmoothly) {
            properties.scrollHorizontallySmoothly = scrollHorizontallySmoothly;
        }

        const bkgdBase = color.getBkgd(ColorScheme.ItemId.Grid_Base);
        if (bkgdBase !== existingGridProperties?.backgroundColor) {
            properties.backgroundColor = bkgdBase;
        }
        const foreBase = color.getFore(ColorScheme.ItemId.Grid_Base);
        if (foreBase !== existingGridProperties?.color) {
            properties.color = foreBase;
        }
        const bkgdColumnHeader = color.getBkgd(ColorScheme.ItemId.Grid_ColumnHeader);
        if (bkgdColumnHeader !== existingGridProperties?.columnHeaderBackgroundColor) {
            properties.columnHeaderBackgroundColor = bkgdColumnHeader;
        }
        const foreColumnHeader = color.getFore(ColorScheme.ItemId.Grid_ColumnHeader);
        if (foreColumnHeader !== existingGridProperties?.columnHeaderColor) {
            properties.columnHeaderColor = foreColumnHeader;
        }
        const bkgdSelection = color.getBkgd(ColorScheme.ItemId.Grid_FocusedCell);
        if (bkgdSelection !== existingGridProperties?.backgroundSelectionColor) {
            properties.backgroundSelectionColor = bkgdSelection;
        }
        const foreSelection = color.getFore(ColorScheme.ItemId.Grid_FocusedCell);
        if (foreSelection !== existingGridProperties?.foregroundSelectionColor) {
            properties.foregroundSelectionColor = foreSelection;
        }
        if (bkgdColumnHeader !== existingGridProperties?.columnHeaderBackgroundSelectionColor) {
            properties.columnHeaderBackgroundSelectionColor = bkgdColumnHeader;
        }
        if (foreColumnHeader !== existingGridProperties?.columnHeaderForegroundSelectionColor) {
            properties.columnHeaderForegroundSelectionColor = foreColumnHeader;
        }
        const foreFocusedCellBorder = color.getFore(ColorScheme.ItemId.Grid_FocusedCellBorder);
        if (foreFocusedCellBorder !== existingGridProperties?.selectionRegionOutlineColor) {
            properties.selectionRegionOutlineColor = foreFocusedCellBorder;
        }
        const foreVerticalLine = color.getFore(ColorScheme.ItemId.Grid_VerticalLine);
        if (foreVerticalLine !== existingGridProperties?.gridLinesHColor) {
            properties.gridLinesHColor = foreVerticalLine;
        }
        const foreHorizontalLine = color.getFore(ColorScheme.ItemId.Grid_HorizontalLine);
        if (foreHorizontalLine !== existingGridProperties?.gridLinesVColor) {
            properties.gridLinesVColor = foreHorizontalLine;
        }
        if (foreVerticalLine !== existingGridProperties?.fixedLinesHColor) {
            properties.fixedLinesHColor = foreVerticalLine;
        }
        if (foreHorizontalLine !== existingGridProperties?.fixedLinesVColor) {
            properties.fixedLinesVColor = foreHorizontalLine;
        }
        // uncomment below when row stripes are working
        // const bkgdBaseAlt = color.getBkgd(ColorScheme.ItemId.Grid_BaseAlt);
        // properties.rowStripes = [
        //     {
        //         backgroundColor: bkgdBase,
        //     },
        //     {
        //         backgroundColor: bkgdBaseAlt,
        //     }
        // ];

        return properties;
    }
}


// interface Highlight {
//     index: number;
//     field: GridField | undefined;
//     expires: SysTick.Time;
// }

// interface TransformGridProperties extends GridProperties {
//     internalBorder?: string;
// }

// function highlightSort(left: Highlight, right: Highlight) {
//     return left.expires - right.expires;
// }
