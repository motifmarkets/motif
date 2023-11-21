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
    EditableGridLayoutDefinitionColumnList,
    GridField,
    GridFieldTableRecordSource,
    GridSourceDefinition,
    GridSourceOrReference,
    GridSourceOrReferenceDefinition,
    Integer,
    ModifierKey,
    ModifierKeyId,
    MultiEvent,
    ReferenceableGridLayoutsService,
    ReferenceableGridSourcesService,
    RenderValueRecordGridCellPainter,
    SettingsService,
    TableRecordSourceDefinitionFactoryService,
    TableRecordSourceFactoryService,
    TextHeaderCellPainter,
    TextRenderValueCellPainter,
    UsableListChangeTypeId,
    delay1Tick
} from '@motifmarkets/motif-core';
import { DatalessViewCell, RevRecord } from 'revgrid';
import { GridSourceFrame } from '../../../grid-source/internal-api';

export class GridLayoutEditorAllowedFieldsFrame extends GridSourceFrame {
    selectionChangedEventer: GridLayoutEditorAllowedFieldsFrame.SelectionChangedEventer | undefined;

    private _records: readonly GridField[];

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: RenderValueRecordGridCellPainter<TextRenderValueCellPainter>;

    private _columnListChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        settingsService: SettingsService,
        namedGridLayoutsService: ReferenceableGridLayoutsService,
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        tableRecordSourceFactoryService: TableRecordSourceFactoryService,
        namedGridSourcesService: ReferenceableGridSourcesService,
        cellPainterFactoryService: CellPainterFactoryService,
        private readonly _allowedFields: readonly GridField[],
        private readonly _columnList: EditableGridLayoutDefinitionColumnList,
    ) {
        super(
            settingsService,
            namedGridLayoutsService,
            tableRecordSourceDefinitionFactoryService,
            tableRecordSourceFactoryService,
            namedGridSourcesService,
            cellPainterFactoryService,
        );

        this._columnListChangeSubscriptionId = this._columnList.subscribeListChangeEvent(
            (listChangeTypeId, idx, count) => this.handleColumnListChangeEvent(listChangeTypeId, idx, count)
        );
    }

    get selectedCount() {
        return this.grid.getSelectedRowCount(true);
    }

    get selectedFields() {
        const selection = this.grid.selection
        const rowIndices = selection.getRowIndices(true);
        const count = rowIndices.length;
        const fields = new Array<GridField>(count);
        for (let i = 0; i < count; i++) {
            const rowIndex = rowIndices[i];
            const recordIndex = this.grid.rowToRecordIndex(rowIndex);
            fields[i] = this._records[recordIndex];
        }
        return fields;
    }

    override finalise() {
        super.finalise();
        this._columnList.unsubscribeListChangeEvent(this._columnListChangeSubscriptionId);
        this._columnListChangeSubscriptionId = undefined;
        this.grid.clearFilter();
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

        grid.selectionChangedEventer = () => this.handleGridSelectionChangedEventer();

        return grid;
    }

    selectAll() {
        this.grid.selectAll();
    }

    applyColumnListFilter() {
        this.grid.applyFilter((record) => this.filterInuseFields(record));
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
        const tableRecordSourceDefinition = this.tableRecordSourceDefinitionFactoryService.createGridField(this._allowedFields.slice());
        const gridSourceDefinition = new GridSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        return new GridSourceOrReferenceDefinition(gridSourceDefinition);
    }

    protected override processGridSourceOpenedEvent(_gridSourceOrReference: GridSourceOrReference) {
        const table = this.openedTable;
        const recordSource = table.recordSource as GridFieldTableRecordSource;
        this._records = recordSource.records;
    }

    protected override setBadness(value: Badness) {
        if (!Badness.isUsable(value)) {
            throw new AssertInternalError('GLEAFFSB42112', Badness.generateText(value));
        }
    }

    protected override hideBadnessWithVisibleDelay(_badness: Badness) {
        // always hidden as never bad
    }

    private handleGridSelectionChangedEventer() {
        if (this.selectionChangedEventer !== undefined) {
            this.selectionChangedEventer();
        }
    }

    private handleColumnListChangeEvent(_listChangeTypeId: UsableListChangeTypeId, _idx: Integer, _count: Integer) {
        delay1Tick(() => this.applyColumnListFilter());
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
            const field = this._allowedFields[recordIndex];
            const upperHeading = field.heading.toUpperCase();
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

    private getGridMainCellPainter(_viewCell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        return this._gridMainCellPainter;
    }

    private filterInuseFields(record: RevRecord) {
        const gridField = this._records[record.index];
        return !this._columnList.includesField(gridField);
    }
}

export namespace GridLayoutEditorAllowedFieldsFrame {
    export type SelectionChangedEventer = (this: void) => void;
}
