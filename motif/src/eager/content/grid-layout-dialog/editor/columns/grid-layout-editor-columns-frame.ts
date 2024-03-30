/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdaptedRevgridBehavioredColumnSettings,
    AssertInternalError,
    Badness,
    CellPainterFactoryService,
    CheckboxRenderValueRecordGridCellEditor,
    CheckboxRenderValueRecordGridCellPainter,
    DataSourceDefinition,
    DataSourceOrReference,
    DataSourceOrReferenceDefinition,
    EditableGridLayoutDefinitionColumn,
    EditableGridLayoutDefinitionColumnList,
    EditableGridLayoutDefinitionColumnTableRecordSource,
    EditableGridLayoutDefinitionColumnTableRecordSourceDefinition,
    GridField,
    Integer,
    ModifierKey,
    ModifierKeyId,
    ReferenceableDataSourcesService,
    ReferenceableGridLayoutsService,
    RenderValueRecordGridCellPainter,
    SettingsService,
    TableFieldSourceDefinitionCachingFactoryService,
    TableRecordSourceFactory,
    TextHeaderCellPainter,
    TextRenderValueCellPainter
} from '@motifmarkets/motif-core';
import { RevFieldCustomHeadingsService } from '@xilytix/rev-data-source';
import { CellEditor, CellPainter, DatalessViewCell, Subgrid, ViewCell } from '@xilytix/revgrid';
import { ToastService } from 'component-services-internal-api';
import { GridSourceFrame } from '../../../grid-source/internal-api';
import { TableRecordSourceDefinitionFactoryService } from '../../../table-record-source-definition-factory-service';

export class GridLayoutEditorColumnsFrame extends GridSourceFrame {
    selectionChangedEventer: GridLayoutEditorColumnsFrame.SelectionChangedEventer | undefined;

    private _recordList: EditableGridLayoutDefinitionColumnList;

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: RenderValueRecordGridCellPainter<TextRenderValueCellPainter>;
    private _visibleCheckboxPainter: CheckboxRenderValueRecordGridCellPainter;
    private _visibleCheckboxEditor: CheckboxRenderValueRecordGridCellEditor;
    private _widthEditor: CellEditor<AdaptedRevgridBehavioredColumnSettings, GridField>;

    constructor(
        settingsService: SettingsService,
        gridFieldCustomHeadingsService: RevFieldCustomHeadingsService,
        namedGridLayoutsService: ReferenceableGridLayoutsService,
        tableFieldSourceDefinitionCachingFactoryService: TableFieldSourceDefinitionCachingFactoryService,
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        tableRecordSourceFactory: TableRecordSourceFactory,
        namedGridSourcesService: ReferenceableDataSourcesService,
        cellPainterFactoryService: CellPainterFactoryService,
        toastService: ToastService,
        private readonly _columnList: EditableGridLayoutDefinitionColumnList,
    ) {
        super(
            settingsService,
            gridFieldCustomHeadingsService,
            namedGridLayoutsService,
            tableFieldSourceDefinitionCachingFactoryService,
            tableRecordSourceDefinitionFactoryService,
            tableRecordSourceFactory,
            namedGridSourcesService,
            cellPainterFactoryService,
            toastService,
        );
    }

    get selectedCount() { return this.grid.getSelectedRowCount(); }

    get selectedRecordIndices() {
        const selection = this.grid.selection
        const rowIndices = selection.getRowIndices(true);
        const count = rowIndices.length;
        const recordIndices = new Array<Integer>(count);
        for (let i = 0; i < count; i++) {
            const rowIndex = rowIndices[i];
            recordIndices[i] = this.grid.rowToRecordIndex(rowIndex);
        }
        return recordIndices;
    }

    override createGridAndCellPainters(gridHostElement: HTMLElement) {
        const grid = this.createGrid(
            gridHostElement,
            {
                fixedColumnCount: 1,
                sortOnClick: false,
                sortOnDoubleClick: false,
                mouseColumnSelectionEnabled: false,
                switchNewRectangleSelectionToRowOrColumn: 'row',
            },
            (columnSettings) => this.customiseSettingsForNewGridColumn(columnSettings),
            (viewCell) => this.getGridMainCellPainter(viewCell),
            (viewCell) => this.getGridHeaderCellPainter(viewCell),
        );

        this._gridHeaderCellPainter = this.cellPainterFactoryService.createTextHeader(grid, grid.headerDataServer);
        this._gridMainCellPainter = this.cellPainterFactoryService.createTextRenderValueRecordGrid(grid, grid.mainDataServer);
        this._visibleCheckboxPainter = this.cellPainterFactoryService.createCheckboxRenderValueRecordGrid(grid, grid.mainDataServer);
        this._visibleCheckboxEditor = new CheckboxRenderValueRecordGridCellEditor(this.settingsService, grid, grid.mainDataServer);

        grid.selectionChangedEventer = () => this.handleGridSelectionChangedEventer();

        grid.focus.getCellEditorEventer = (
            field,
            subgridRowIndex,
            subgrid,
            readonly,
            viewCell
        ) => this.getCellEditor(field, subgridRowIndex, subgrid, readonly, viewCell);


        return grid;
    }

    setWidthEditor(value: CellEditor<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        this._widthEditor = value;
    }

    appendFields(gridFields: readonly GridField[]) {
        if (gridFields.length > 0) {
            this._columnList.appendFields(gridFields);
            this.selectGridFields(gridFields);
        }
    }

    removeSelectedColumns() {
        const selectedRecordIndices = this.selectedRecordIndices;
        if (selectedRecordIndices.length > 0) {
            this._columnList.removeIndexedRecords(selectedRecordIndices);
        }
    }

    moveSelectedColumnsUp() {
        const selectedRecordIndices = this.selectedRecordIndices;
        if (selectedRecordIndices.length > 0) {
            const gridFields = this.getGridFieldsFromRecordIndices(selectedRecordIndices);
            this._columnList.moveIndexedRecordsOnePositionTowardsStartWithSquash(selectedRecordIndices);
            this.selectGridFields(gridFields);
        }
    }

    moveSelectedColumnsToTop() {
        const selectedRecordIndices = this.selectedRecordIndices;
        if (selectedRecordIndices.length > 0) {
            const gridFields = this.getGridFieldsFromRecordIndices(selectedRecordIndices);
            this._columnList.moveIndexedRecordsToStart(selectedRecordIndices);
            this.selectGridFields(gridFields);
        }
    }

    moveSelectedColumnsDown() {
        const selectedRecordIndices = this.selectedRecordIndices;
        if (selectedRecordIndices.length > 0) {
            const gridFields = this.getGridFieldsFromRecordIndices(selectedRecordIndices);
            this._columnList.moveIndexedRecordsOnePositionTowardsEndWithSquash(selectedRecordIndices);
            this.selectGridFields(gridFields);
        }
    }

    moveSelectedColumnsToBottom() {
        const selectedRecordIndices = this.selectedRecordIndices;
        if (selectedRecordIndices.length > 0) {
            const gridFields = this.getGridFieldsFromRecordIndices(selectedRecordIndices);
            this._columnList.moveIndexedRecordsToEnd(selectedRecordIndices);
            this.selectGridFields(gridFields);
        }
    }

    tryFocusFirstSearchMatch(searchText: string) {
        if (searchText.length > 0) {
            const rowCount = this.grid.mainDataServer.getRowCount();
            if (rowCount > 0) {
                // specify last as this will immediately wrap and start searching at first
                const lastRowIndex = this.grid.mainDataServer.getRowCount() - 1;
                this.tryFocusNextSearchMatchFromRow(searchText, lastRowIndex, false);
            }
        }
    }

    tryFocusNextSearchMatch(searchText: string, downKeys: ModifierKey.IdSet) {
        if (searchText.length > 0) {
            const rowCount = this.grid.mainDataServer.getRowCount();
            if (rowCount > 0) {
                const backwards = ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift);
                const focusedRecIdx = this.grid.focusedRecordIndex;

                let rowIndex: Integer;
                if (focusedRecIdx === undefined) {
                    rowIndex = 0;
                } else {
                    rowIndex = this.grid.recordToRowIndex(focusedRecIdx);
                }

                this.tryFocusNextSearchMatchFromRow(searchText, rowIndex, backwards);
            }
        }
    }

    protected override getDefaultGridSourceOrReferenceDefinition() {
        return this.createDefaultLayoutGridSourceOrReferenceDefinition();
    }

    protected override processGridSourceOpenedEvent(_gridSourceOrReference: DataSourceOrReference) {
        const table = this.openedTable;
        const recordSource = table.recordSource as EditableGridLayoutDefinitionColumnTableRecordSource;
        this._recordList = recordSource.list;
    }

    protected override setBadness(value: Badness) {
        if (!Badness.isUsable(value)) {
            throw new AssertInternalError('GLECFSB42112', Badness.generateText(value));
        }
    }

    protected override hideBadnessWithVisibleDelay(_badness: Badness) {
        // always hidden as never bad
    }

    private createDefaultLayoutGridSourceOrReferenceDefinition() {
        const tableRecordSourceDefinition = new EditableGridLayoutDefinitionColumnTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachingFactoryService,
            this._columnList,
        )
        const gridSourceDefinition = new DataSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        return new DataSourceOrReferenceDefinition(gridSourceDefinition);
    }

    private handleGridSelectionChangedEventer() {
        if (this.selectionChangedEventer !== undefined) {
            this.selectionChangedEventer();
        }
    }

    private tryFocusNextSearchMatchFromRow(searchText: string, fromRowIndex: Integer, backwards: boolean) {
        const rowIncrement = backwards ? -1 : 1;
        const upperSearchText = searchText.toUpperCase();
        const rowCount = this.grid.mainDataServer.getRowCount();

        let rowIndex = fromRowIndex;
        let wrapped = false;
        do {
            rowIndex += rowIncrement;
            if (rowIndex < 0) {
                rowIndex = rowCount - 1
                wrapped = true;
            } else {
                if (rowIndex >= rowCount) {
                    rowIndex = 0;
                    wrapped = true;
                }
            }

            const recordIndex = this.grid.rowToRecordIndex(rowIndex);
            const column = this._columnList.records[recordIndex];
            const upperHeading = column.fieldHeading.toUpperCase();
            if (upperHeading.includes(upperSearchText)) {
                this.grid.focusedRecordIndex = recordIndex;
                break;
            }
        } while (!wrapped || (backwards ? rowIndex > fromRowIndex : rowIndex < fromRowIndex));
    }

    private customiseSettingsForNewGridColumn(_columnSettings: AdaptedRevgridBehavioredColumnSettings) {
        // no customisation
    }

    private getGridHeaderCellPainter(_viewCell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        return this._gridHeaderCellPainter;
    }

    private getGridMainCellPainter(viewCell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        let cellPainter: CellPainter<
            AdaptedRevgridBehavioredColumnSettings,
            GridField
        >;

        if (viewCell.viewLayoutColumn.column.field.definition.sourcelessName === EditableGridLayoutDefinitionColumn.FieldName.visible) {
            cellPainter = this._visibleCheckboxPainter;
        } else {
            cellPainter = this._gridMainCellPainter;
        }
        return cellPainter;
    }

    private getCellEditor(
        field: GridField,
        subgridRowIndex: Integer,
        _subgrid: Subgrid<AdaptedRevgridBehavioredColumnSettings, GridField>,
        readonly: boolean,
        _viewCell: ViewCell<AdaptedRevgridBehavioredColumnSettings, GridField> | undefined
    ): CellEditor<AdaptedRevgridBehavioredColumnSettings, GridField> | undefined {
        return this.tryGetCellEditor(field.definition.sourcelessName, readonly, subgridRowIndex);
    }

    private tryGetCellEditor(sourcelesFieldName: string, readonly: boolean, subgridRowIndex: Integer): CellEditor<AdaptedRevgridBehavioredColumnSettings, GridField> | undefined {
        if (sourcelesFieldName === EditableGridLayoutDefinitionColumn.FieldName.visible) {
            this._visibleCheckboxEditor.readonly = readonly || subgridRowIndex < this._recordList.anchoredRecordCount;
            return this._visibleCheckboxEditor;
        } else {
            if (sourcelesFieldName === EditableGridLayoutDefinitionColumn.FieldName.width) {
                this._widthEditor.readonly = readonly
                return this._widthEditor;
            } else {
                return undefined;
            }
        }
    }

    private getGridFieldsFromRecordIndices(indices: readonly Integer[]) {
        const indexCount = indices.length;
        const gridFields = new Array<GridField>(indexCount);
        for (let i = 0; i < indexCount; i++) {
            const index = indices[i];
            const column = this._recordList.getAt(index);
            gridFields[i] = column.field;
        }
        return gridFields;
    }

    private selectGridFields(gridFields: readonly GridField[]) {
        const grid = this.grid;
        grid.beginSelectionChange();
        let cleared = false;
        for (const gridField of gridFields) {
            const recordIndex  = this._columnList.indexOfGridField(gridField);
            if (recordIndex < 0) {
                throw new AssertInternalError('GLECFSGFG30304');
            } else {
                const rowIndex = this.grid.mainDataServer.getRowIndexFromRecordIndex(recordIndex);
                if (rowIndex === undefined) {
                    throw new AssertInternalError('GLECFSGFR30304');
                } else {
                    if (cleared) {
                        grid.selectRow(rowIndex);
                    } else {
                        grid.onlySelectRow(rowIndex);
                        cleared = true;
                    }
                }
            }
        }
        grid.endSelectionChange();
    }
}

export namespace GridLayoutEditorColumnsFrame {
    export type SelectionChangedEventer = (this: void) => void;
    export type FocusChangedEventer = (this: void, column: EditableGridLayoutDefinitionColumn | undefined) => void;
}
